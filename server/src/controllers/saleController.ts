import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Sale, { PayMode } from '../models/Sale';
import Product from '../models/Product';
import Counter from '../models/Counter';
import LedgerEntry from '../models/LedgerEntry';

const r2 = (n: number) => Math.round(n * 100) / 100;

export const createSale = async (req: Request, res: Response) => {
  const { items, discount = 0, paymentMode = 'Cash', amountReceived, customerName, customerPhone } = req.body as {
    items: { productId: string; qty: number }[];
    discount?: number; paymentMode?: PayMode; amountReceived?: number;
    customerName?: string; customerPhone?: string;
  };

  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });
  if (items.some((i) => !i.productId || !Number.isInteger(i.qty) || i.qty < 1))
    return res.status(400).json({ message: 'Invalid quantities' });
  if (!['Cash', 'UPI', 'Card'].includes(paymentMode)) return res.status(400).json({ message: 'Invalid payment mode' });

  const session = await mongoose.startSession();
  try {
    let sale;
    await session.withTransaction(async () => {
      const lines = [];
      for (const it of items) {
  
        const p = await Product.findOneAndUpdate(
          { _id: it.productId, active: true, stock: { $gte: it.qty } },
          { $inc: { stock: -it.qty } },
          { new: true, session }
        );
        if (!p) {
          const ex = await Product.findById(it.productId).session(session);
          throw new Error(ex ? `Insufficient stock for ${ex.name}` : 'Product not found');
        }
        lines.push({ product: p._id, name: p.name, sku: p.sku, qty: it.qty, price: p.price, cost: p.cost, gst: p.gst });
      }

    
      const subtotal = r2(lines.reduce((a, l) => a + l.price * l.qty, 0));
      const tax = r2(lines.reduce((a, l) => a + (l.price * l.qty * l.gst) / 100, 0));
      const disc = r2(Math.min(Math.max(Number(discount) || 0, 0), subtotal + tax));
      const total = r2(subtotal + tax - disc);

      if (paymentMode === 'Cash' && amountReceived !== undefined && amountReceived < total)
        throw new Error('Amount received is less than the total');

      const counter = await Counter.findOneAndUpdate(
        { _id: 'bill' }, { $inc: { seq: 1 } }, { new: true, upsert: true, session }
      );
      const billNo = `B${1000 + counter!.seq}`;

      [sale] = await Sale.create(
        [{
          billNo, items: lines, subtotal, tax, discount: disc, total, paymentMode,
          amountReceived: amountReceived ?? total, customerName, customerPhone,
          staff: req.user!._id, staffName: req.user!.name,
        }],
        { session }
      );
      await LedgerEntry.create(
        [{ type: 'sale', description: `Bill ${billNo} (${paymentMode})`, credit: total, ref: sale._id }],
        { session }
      );
    });
    res.status(201).json(sale);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  } finally {
    await session.endSession();
  }
};

export const listSales = async (req: Request, res: Response) => {
  const { from, to, q } = req.query as { from?: string; to?: string; q?: string };
  const filter: Record<string, any> = {};
  if (req.user!.role !== 'admin') filter.staff = req.user!._id; // staff only see their own
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
  }
  if (q) filter.billNo = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Sale.find(filter).sort({ createdAt: -1 }).limit(200));
};

export const getSale = async (req: Request, res: Response) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) return res.status(404).json({ message: 'Bill not found' });
  if (req.user!.role !== 'admin' && String(sale.staff) !== String(req.user!._id))
    return res.status(403).json({ message: 'Forbidden' });
  res.json(sale);
};