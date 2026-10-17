import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier';
import Product from '../models/Product';
import Purchase from '../models/Purchase';
import LedgerEntry from '../models/LedgerEntry';

export const listSuppliers = async (_req: Request, res: Response) => {
  res.json(await Supplier.find({ active: true }).sort({ createdAt: -1 }));
};

export const createSupplier = async (req: Request, res: Response) => {
  res.status(201).json(await Supplier.create(req.body));
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;
  const s = await Supplier.findByIdAndUpdate(req.params.id, { name, phone, address }, { new: true, runValidators: true });
  if (!s) return res.status(404).json({ message: 'Supplier not found' });
  res.json(s);
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const s = await Supplier.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Supplier not found' });
  if (s.balance > 0) return res.status(400).json({ message: 'Clear the pending balance first' });
  s.active = false;
  await s.save();
  res.json({ message: 'Deleted' });
};


export const purchase = async (req: Request, res: Response) => {
  const { productId, qty, unitCost } = req.body as { productId: string; qty: number; unitCost: number };
  if (!productId || !(qty >= 1) || !(unitCost >= 0)) return res.status(400).json({ message: 'Invalid purchase data' });
  const amount = qty * unitCost;
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const supplier = await Supplier.findByIdAndUpdate(req.params.id, { $inc: { balance: amount } }, { new: true, session });
      const product = await Product.findByIdAndUpdate(productId, { $inc: { stock: qty }, cost: unitCost }, { new: true, session });
      if (!supplier || !product) throw new Error('Supplier or product not found');
      const [p] = await Purchase.create([{ supplier: supplier._id, product: product._id, qty, unitCost, amount }], { session });
      await LedgerEntry.create(
        [{ type: 'purchase', description: `Purchase ${qty} x ${product.name} from ${supplier.name}`, debit: amount, ref: p._id }],
        { session }
      );
      result = supplier;
    });
    res.json(result);
  } finally {
    await session.endSession();
  }
};


export const paySupplier = async (req: Request, res: Response) => {
  const amount = Number(req.body.amount);
  if (!(amount > 0)) return res.status(400).json({ message: 'Enter a valid amount' });
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const supplier = await Supplier.findOneAndUpdate(
        { _id: req.params.id, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true, session }
      );
      if (!supplier) throw new Error('Amount exceeds pending balance');
      await LedgerEntry.create([{ type: 'payment', description: `Paid ${supplier.name}`, debit: amount, ref: supplier._id }], { session });
      result = supplier;
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  } finally {
    await session.endSession();
  }
};