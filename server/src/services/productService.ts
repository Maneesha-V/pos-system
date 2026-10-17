import Product from '../models/Product';
import { AppError } from '../utils/AppError';

const FIELDS = ['name', 'sku', 'category', 'price', 'cost', 'stock', 'minStock', 'gst'] as const;
const pick = (b: any) => Object.fromEntries(FIELDS.filter((k) => b?.[k] !== undefined).map((k) => [k, b[k]]));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function list(q?: string, lowStock?: string) {
  const filter: Record<string, any> = { active: true };
  if (q) {
    const rx = new RegExp(esc(q), 'i');
    filter.$or = [{ name: rx }, { sku: rx }, { category: rx }];
  }
  if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$minStock'] };
  return Product.find(filter).sort({ createdAt: -1 });
}

export const create = (body: unknown) => Product.create(pick(body)); // ignores unknown fields

export async function update(id: string, body: unknown) {
  const p = await Product.findByIdAndUpdate(id, pick(body), { new: true, runValidators: true });
  if (!p) throw new AppError('Product not found', 404);
  return p;
}

export async function remove(id: string) {
  const p = await Product.findByIdAndUpdate(id, { active: false });
  if (!p) throw new AppError('Product not found', 404);
}