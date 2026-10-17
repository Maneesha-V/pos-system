const r2 = (n: number) => Math.round(n * 100) / 100;

export function calcTotals(items: { price: number; qty: number; gst: number }[], discount: number) {
  const subtotal = r2(items.reduce((a, i) => a + i.price * i.qty, 0));
  const tax = r2(items.reduce((a, i) => a + (i.price * i.qty * i.gst) / 100, 0));
  const d = r2(Math.min(Math.max(discount, 0), subtotal + tax));
  return { subtotal, tax, discount: d, total: r2(subtotal + tax - d) };
}