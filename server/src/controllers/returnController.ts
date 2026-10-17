import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale';
import Product from '../models/Product';
import Return from '../models/Return';
import LedgerEntry from '../models/LedgerEntry';

const r2 = (n: number) => Math.round(n * 100) / 100;

export const lookupBill = async (req: Request, res: Response) => {
  const billNo = String(req.params.billNo).replace(/[^a-zA-Z0-9]/g, '');
  const sale = await Sale.findOne({ billNo: new RegExp(`^${billNo}$`, 'i') });
  if (!sale) return res.status(404).json({ message: 'Bill not found' });
  res.json(sale);
};

export const listReturns = async (_req: Request, res: Response) => {
  res.json(await Return.find().sort({ createdAt: -1 }).limit(200));
};

export const createReturn = async (req: Request, res: Response) => {
  const { saleId, itemId, qty, reason = '', restock = true } = req.body as {
    saleId: string; itemId: string; qty: number; reason?: string; restock?: boolean;
  };
  if (!saleId || !itemId || !Number.isInteger(qty) || qty < 1)
    return res.status(400).json({ message: 'Invalid return data' });

  const session = await mongoose.startSession();
  try {
    let created: InstanceType<typeof Return> | undefined;
    await session.withTransaction(async () => {
      const sale = await Sale.findById(saleId).session(session);
      if (!sale) throw new Error('Bill not found');
      const item = sale.items.find((i) => String(i._id) === itemId);
      if (!item) throw new Error('Item not on this bill');

      const left = item.qty - item.returnedQty;
      if (qty > left) throw new Error(`Only ${left} can still be returned`);

      const upd = await Sale.updateOne(
        { _id: sale._id, items: { $elemMatch: { _id: item._id, returnedQty: item.returnedQty } } },
        { $inc: { 'items.$.returnedQty': qty } },
        { session }
      );
      if (upd.modifiedCount !== 1) throw new Error('Bill was updated, please retry');

      if (restock) await Product.updateOne({ _id: item.product }, { $inc: { stock: qty } }, { session });

  
      const total = sale.total ?? 0;
      const base = (sale.subtotal ?? 0) + (sale.tax ?? 0);
      const ratio = base > 0 ? total / base : 1;

      const refund = r2(qty * item.price * (1 + item.gst / 100) * ratio);

      [created] = await Return.create(
        [{
          sale: sale._id, billNo: sale.billNo, product: item.product, name: item.name,
          qty, refund, reason, restocked: !!restock,
          processedBy: req.user!._id, processedByName: req.user!.name,
        }],
        { session }
      );
      await LedgerEntry.create(
        [{ type: 'return', description: `Return ${sale.billNo}: ${qty} x ${item.name}`, debit: refund, ref: created!._id }],
        { session }
      );
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  } finally {
    await session.endSession();
  }
};