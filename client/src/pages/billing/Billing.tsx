import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Minus, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { useAppDispatch, useAppSelector } from '../../store';
import { addItem, changeQty, clearCart, setDiscount } from '../../store/cartSlice';
import ReceiptModal from '../../components/ReceiptModal';
import type { Product } from '../../types/productTypes';
import type { Sale } from '../../types/saleTypes';

const inr = (n: number) => '₹' + n.toFixed(2);

export default function Billing() {
  const dispatch = useAppDispatch();
  const { items, discount } = useAppSelector((s) => s.cart);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [received, setReceived] = useState('');
  const [cust, setCust] = useState({ name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Sale | null>(null);

  const loadProducts = async () => {
    try { 
        setProducts((await api.get<Product[]>('/products', { params: { q } })).data); 
        console.log(products);
        
    }
    catch { toast.error('Failed to load products'); }
  };
  useEffect(() => { const t = setTimeout(loadProducts, 250); return () => clearTimeout(t); }, [q]);

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
    const tax = items.reduce((a, i) => a + (i.price * i.qty * i.gst) / 100, 0);
    const d = Math.min(discount, subtotal + tax);
    return { subtotal, tax, total: subtotal + tax - d };
  }, [items, discount]);

  const change = mode === 'Cash' && received ? +received - total : 0;

  const checkout = async () => {
    if (!items.length) return toast.error('Cart is empty');
    if (mode === 'Cash' && received && +received < total) return toast.error('Received amount is less than total');
    setBusy(true);
    try {
      const { data } = await api.post<Sale>('/sales', {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        discount, paymentMode: mode,
        amountReceived: mode === 'Cash' && received ? +received : undefined,
        customerName: cust.name || undefined, customerPhone: cust.phone || undefined,
      });
      toast.success(`Bill ${data.billNo} created`);
      dispatch(clearCart());
      setReceived(''); setCust({ name: '', phone: '' });
      setDone(data);
      loadProducts();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Billing failed');
      loadProducts(); // refresh stock in case it changed
    } finally { setBusy(false); }
  };

  const inp = 'w-full rounded-lg border p-2 text-sm';

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      {/* Products */}
      <div className="rounded-xl border bg-white p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / SKU / category" className={inp + ' mb-3'} />
        <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {products.map((p) => (
            <button key={p._id} disabled={p.stock < 1}
              onClick={() => dispatch(addItem({ productId: p._id, name: p.name, price: p.price, cost: p.cost, gst: p.gst, stock: p.stock }))}
              className="rounded-lg border p-2 text-left hover:border-indigo-500 disabled:opacity-40">
              <div className="text-sm font-medium leading-tight">{p.name}</div>
              <div className="text-xs text-gray-500">{p.sku}</div>
              <div className="mt-1 flex justify-between text-sm">
                <b>₹{p.price}</b>
                <span className={p.stock <= p.minStock ? 'text-red-600' : 'text-gray-500'}>{p.stock < 1 ? 'Out' : p.stock}</span>
              </div>
            </button>
          ))}
          {!products.length && <p className="col-span-full p-4 text-center text-gray-400">No products</p>}
        </div>
      </div>

      {/* Cart */}
      <div className="rounded-xl border bg-white p-3">
        <h2 className="mb-2 font-semibold">Cart</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex items-center gap-2 border-b py-2 text-sm">
            <div className="min-w-0 flex-1">
              <div className="truncate">{i.name}</div>
              <div className="text-xs text-gray-500">₹{i.price} · GST {i.gst}%</div>
            </div>
            <button onClick={() => dispatch(changeQty({ productId: i.productId, delta: -1 }))} className="rounded border p-1">{i.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button>
            <span className="w-6 text-center">{i.qty}</span>
            <button onClick={() => dispatch(changeQty({ productId: i.productId, delta: 1 }))} className="rounded border p-1"><Plus size={14} /></button>
            <b className="w-20 text-right">{inr(i.price * i.qty)}</b>
          </div>
        ))}
        {!items.length && <p className="py-4 text-center text-gray-400">Tap a product to add</p>}

        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          <div className="flex justify-between"><span>GST</span><span>{inr(tax)}</span></div>
          <div className="flex items-center justify-between gap-3">
            <span>Discount (₹)</span>
            <input type="number" min="0" value={discount || ''} onChange={(e) => dispatch(setDiscount(+e.target.value))} className="w-24 rounded border p-1 text-right" />
          </div>
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{inr(total)}</span></div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <input placeholder="Customer name" value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} className={inp} />
          <input placeholder="Phone" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} className={inp} />
        </div>
        <div className="mt-2 flex gap-2">
          {(['Cash', 'UPI', 'Card'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg border p-2 text-sm ${mode === m ? 'bg-indigo-600 text-white' : ''}`}>{m}</button>
          ))}
        </div>
        {mode === 'Cash' && (
          <div className="mt-2">
            <input type="number" min="0" placeholder="Amount received" value={received} onChange={(e) => setReceived(e.target.value)} className={inp} />
            {change > 0 && <p className="mt-1 text-sm text-green-700">Change to return: {inr(change)}</p>}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button disabled={busy || !items.length} onClick={checkout} className="flex-1 rounded-lg bg-green-600 p-3 font-medium text-white disabled:opacity-50">
            {busy ? 'Processing...' : 'Pay & generate bill'}
          </button>
          <button onClick={() => dispatch(clearCart())} className="rounded-lg border px-3">Clear</button>
        </div>
      </div>

      {done && <ReceiptModal sale={done} onClose={() => setDone(null)} />}
    </div>
  );
}