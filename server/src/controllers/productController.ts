import { Request, Response } from 'express';
import Product from '../models/Product';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listProducts = async (req: Request, res: Response) => {
  const { q, lowStock } = req.query as { q?: string; lowStock?: string };
  const filter: Record<string, unknown> = { active: true };
  if (q) {
    const rx = new RegExp(esc(q), 'i');
    filter.$or = [{ name: rx }, { sku: rx }, { category: rx }];
  }
  if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$minStock'] };
  const products = await Product.find(filter).sort({ createdAt: -1 })
  console.log(products);
  
  res.json(products);
};

export const createProduct = async (req: Request, res: Response) => {
  res.status(201).json(await Product.create(req.body));
};

export const updateProduct = async (req: Request, res: Response) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Deleted' });
};