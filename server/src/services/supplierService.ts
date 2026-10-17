import mongoose from 'mongoose';
import Supplier from '../models/Supplier';
import Product from '../models/Product';
import Purchase from '../models/Purchase';
import LedgerEntry from '../models/LedgerEntry';
import { AppError } from '../utils/AppError';

type SupplierBody = { name?: string; phone?: string; address?: string };

export const list = () => Supplier.find({ active: true }).sort({ createdAt: -1 });

export async function create(b: SupplierBody) {
  if (!b.name?.trim()) throw new AppError('Name is required');
  return Supplier.create({ name: b.name, phone: b.phone, address: b.address });
}

export async function update(id: string, b: SupplierBody) {
  const s = await Supplier.findByIdAndUpdate(id, { name: b.name, phone: b.phone, address: b.address }, { new: true, runValidators: true });
  if (!s) throw new AppError('Supplier not found', 404);
  return s;
}

export async function remove(id: string) {
  const s = await Supplier.findById(id);
  if (!s) throw new AppError('Supplier not found', 404);
  if (s.balance > 0) throw new AppError('Clear the pending balance first');
  s.active = false;
  await s.save();
}

export async function purchase(supplierId: string, b: { productId?: string; qty?: number; unitCost?: number }) {
  const { productId, qty, unitCost } = b;
  if (!productId || !Number.isInteger(qty) || (qty as number) < 1 || !((unitCost as number) >= 0))
    throw new AppError('Invalid purchase data');
  const amount = (qty as number) * (unitCost as number);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const supplier = await Supplier.findByIdAndUpdate(supplierId, { $inc: { balance: amount } }, { new: true, session });
      const product = await Product.findByIdAndUpdate(productId, { $inc: { stock: qty }, cost: unitCost }, { new: true, session });
      if (!supplier || !product) throw new AppError('Supplier or product not found', 404);
      const [p] = await Purchase.create(
        [{ supplier: supplier._id, product: product._id, qty, unitCost, amount }], { session });
      await LedgerEntry.create(
        [{ type: 'purchase', description: `Purchase ${qty} x ${product.name} from ${supplier.name}`, debit: amount, ref: p._id }],
        { session });
    });
    return Supplier.findById(supplierId);
  } finally {
    await session.endSession();
  }
}

export async function pay(supplierId: string, rawAmount: unknown) {
  const amount = Number(rawAmount);
  if (!(amount > 0)) throw new AppError('Enter a valid amount');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const supplier = await Supplier.findOneAndUpdate(
        { _id: supplierId, balance: { $gte: amount } }, { $inc: { balance: -amount } }, { new: true, session });
      if (!supplier) throw new AppError('Amount exceeds pending balance');
      await LedgerEntry.create(
        [{ type: 'payment', description: `Paid ${supplier.name}`, debit: amount, ref: supplier._id }], { session });
    });
    return Supplier.findById(supplierId);
  } finally {
    await session.endSession();
  }
}