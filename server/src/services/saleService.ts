import mongoose, { Types } from 'mongoose';
import Sale, { type PayMode } from '../models/Sale';
import Product from '../models/Product';
import Counter from '../models/Counter';
import LedgerEntry from '../models/LedgerEntry';
import { calcTotals } from '../utils/pricing';
import { verifyPayment, refundPayment, type VerifiedPayment } from './paymentService';
import type { PaymentProof } from '../types/payment';
import { AppError } from '../utils/AppError';
import { UserDoc } from '../models/User';
import { dayEnd, dayStart } from '../utils/dateRange';

export interface CreateSaleInput {
  items: { productId: string; qty: number }[];
  discount?: number;
  paymentMode: PayMode;
  amountReceived?: number;
  customerName?: string;
  customerPhone?: string;
  payment?: PaymentProof;
  staffId: Types.ObjectId;
  staffName: string;
}

// A payment already used by another bill must never be refunded
const isReusedPayment = (e: any) => e?.code === 11000 && !!e?.keyPattern?.paymentId;

export async function createSale(input: CreateSaleInput) {
  const { items, paymentMode, payment } = input;

  // 1) Verify online payment BEFORE the transaction (no network calls inside it)
  let paid: VerifiedPayment | undefined;
  if (paymentMode !== 'Cash') {
    if (!payment) throw new AppError('Online payment details required');
    if (await Sale.exists({ paymentId: payment.paymentId }))
      throw new AppError('This payment has already been used for a bill');
    paid = await verifyPayment(payment);
  }

  // 2) Create the bill atomically
  const session = await mongoose.startSession();
  const out: { id?: Types.ObjectId } = {};
  try {
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
          throw new AppError(ex ? `Insufficient stock for ${ex.name}` : 'Product not found');
        }
        lines.push({ product: p._id, name: p.name, sku: p.sku, qty: it.qty, price: p.price, cost: p.cost, gst: p.gst });
      }

      const { subtotal, tax, discount, total } = calcTotals(lines, input.discount);

      if (paid) {
        if (Math.round(total * 100) !== paid.amountPaise) throw new AppError('Paid amount does not match the bill total');
      } else if (input.amountReceived !== undefined && input.amountReceived < total) {
        throw new AppError('Amount received is less than the total');
      }

      const counter = await Counter.findOneAndUpdate(
        { _id: 'bill' }, { $inc: { seq: 1 } }, { new: true, upsert: true, session }
      );
      const billNo = `B${1000 + counter!.seq}`;

      const [created] = await Sale.create(
        [{
          billNo, items: lines, subtotal, tax, discount, total, paymentMode,
          amountReceived: paid ? total : input.amountReceived ?? total,
          customerName: input.customerName, customerPhone: input.customerPhone,
          staff: input.staffId, staffName: input.staffName,
          paymentId: paid?.paymentId, gatewayOrderId: payment?.orderId, paymentMethod: paid?.method,
        }],
        { session }
      );
      out.id = created._id;
      await LedgerEntry.create(
        [{ type: 'sale', description: `Bill ${billNo} (${paymentMode})`, credit: total, ref: created._id }],
        { session }
      );
    });

    const sale = await Sale.findById(out.id);
    if (!sale) throw new AppError('Bill could not be loaded');
    return sale;
  } catch (e) {
    // Customer paid but no bill was made -> give the money back
    if (paid && !isReusedPayment(e)) await refundPayment(paid.paymentId);
    throw e;
  } finally {
    await session.endSession();
  }
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listSales(user: UserDoc, query: { from?: string; to?: string; q?: string }) {
  const filter: Record<string, any> = {};
  if (user.role !== 'admin') filter.staff = user._id; // staff see only their own
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = dayStart(query.from);
    if (query.to) filter.createdAt.$lte = dayEnd(query.to);
  }
  if (query.q) filter.billNo = new RegExp(esc(query.q), 'i');
  return Sale.find(filter).sort({ createdAt: -1 }).limit(200);
}

export async function getSale(user: UserDoc, id: string) {
  const sale = await Sale.findById(id);
  if (!sale) throw new AppError('Bill not found', 404);
  if (user.role !== 'admin' && String(sale.staff) !== String(user._id)) throw new AppError('Forbidden', 403);
  return sale;
}