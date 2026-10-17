import Product from '../models/Product';
import { AppError } from './AppError';

export const r2 = (n: number) => Math.round(n * 100) / 100;

export function calcTotals(lines: { price: number; qty: number; gst: number }[], discount = 0) {
  const subtotal = r2(lines.reduce((a, l) => a + l.price * l.qty, 0));
  const tax = r2(lines.reduce((a, l) => a + (l.price * l.qty * l.gst) / 100, 0));
  const disc = r2(Math.min(Math.max(Number(discount) || 0, 0), subtotal + tax));
  return { subtotal, tax, discount: disc, total: r2(subtotal + tax - disc) };
}

// Used before payment: prices come from the database, never the browser
export async function priceCart(items: { productId: string; qty: number }[], discount = 0) {
  if (!Array.isArray(items) || !items.length) throw new AppError('Cart is empty');
  const lines = [];
  for (const it of items) {
    if (!Number.isInteger(it.qty) || it.qty < 1) throw new AppError('Invalid quantities');
    const p = await Product.findOne({ _id: it.productId, active: true });
    if (!p) throw new Error('Product not found');
    if (p.stock < it.qty) throw new AppError(`Insufficient stock for ${p.name}`);
    lines.push({ price: p.price, qty: it.qty, gst: p.gst });
  }
  return calcTotals(lines, discount);
}