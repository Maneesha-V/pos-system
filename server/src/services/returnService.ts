import mongoose, { Types } from 'mongoose';
import Sale from '../models/Sale';
import Product from '../models/Product';
import Return from '../models/Return';
import LedgerEntry from '../models/LedgerEntry';
import { AppError } from '../utils/AppError';
import { r2 } from '../utils/pricing';
import type { UserDoc } from '../models/User';

export async function lookupBill(rawBillNo: string) {
  const billNo = rawBillNo.replace(/[^a-zA-Z0-9]/g, '');
  const sale = await Sale.findOne({ billNo: new RegExp(`^${billNo}$`, 'i') });
  if (!sale) throw new AppError('Bill not found', 404);
  return sale;
}

export const list = () => Return.find().sort({ createdAt: -1 }).limit(200);

export async function create(
  b: { saleId?: string; itemId?: string; qty?: number; reason?: string; restock?: boolean },
  user: UserDoc
) {
  const { saleId, itemId, reason = '', restock = true } = b;
  const qty = b.qty as number;
  if (!saleId || !itemId || !Number.isInteger(qty) || qty < 1) throw new AppError('Invalid return data');

  const session = await mongoose.startSession();
  const out: { id?: Types.ObjectId } = {};
  try {
    await session.withTransaction(async () => {
      const sale = await Sale.findById(saleId).session(session);
      if (!sale) throw new AppError('Bill not found', 404);
      const item = sale.items.find((i) => String(i._id) === itemId);
      if (!item) throw new AppError('Item not on this bill');

      const left = item.qty - item.returnedQty;
      if (qty > left) throw new AppError(`Only ${left} can still be returned`);

      // Guarded update: fails if another return changed returnedQty meanwhile
      const upd = await Sale.updateOne(
        { _id: sale._id, items: { $elemMatch: { _id: item._id, returnedQty: item.returnedQty } } },
        { $inc: { 'items.$.returnedQty': qty } }, { session });
      if (upd.modifiedCount !== 1) throw new AppError('Bill was updated, please retry', 409);

      if (restock) await Product.updateOne({ _id: item.product }, { $inc: { stock: qty } }, { session });

      // Refund = price + GST, minus this item's share of the bill discount
      const total = sale.total ?? 0;
      const base = (sale.subtotal ?? 0) + (sale.tax ?? 0);
      const ratio = base > 0 ? total / base : 1;
      const refund = r2(qty * item.price * (1 + item.gst / 100) * ratio);

      const [created] = await Return.create(
        [{ sale: sale._id, billNo: sale.billNo, product: item.product, name: item.name, qty, refund, reason,
           restocked: !!restock, processedBy: user._id, processedByName: user.name }],
        { session });
      out.id = created._id;
      await LedgerEntry.create(
        [{ type: 'return', description: `Return ${sale.billNo}: ${qty} x ${item.name}`, debit: refund, ref: created._id }],
        { session });
    });
    return Return.findById(out.id);
  } finally {
    await session.endSession();
  }
}