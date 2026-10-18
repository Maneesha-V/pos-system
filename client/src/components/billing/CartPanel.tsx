import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { changeQty, clearCart, setDiscount } from '../../store/cartSlice';
import { inr } from '../../utils/format';
import type { PayMode } from '../../types/paymentTypes';

interface Cust { name: string; phone: string }
interface Props {
  totals: { subtotal: number; tax: number; total: number };
  mode: PayMode; onMode: (m: PayMode) => void;
  received: string; onReceived: (v: string) => void;
  cust: Cust; onCust: (c: Cust) => void;
  busy: boolean; onCheckout: () => void;
}

export default function CartPanel({ totals, mode, onMode, received, onReceived, cust, onCust, busy, onCheckout }: Props) {
  const dispatch = useAppDispatch();
  const { items, discount } = useAppSelector((s) => s.cart);
  const change = mode === 'Cash' && received ? +received - totals.total : 0;
  const inp = 'w-full rounded-lg border p-2 text-sm';

  return (
    <div className="rounded-xl border bg-white p-3">
      <h2 className="mb-2 font-semibold">Cart</h2>
      {items.map((i) => (
        <div key={i.productId} className="flex items-center gap-2 border-b py-2 text-sm">
          <div className="min-w-0 flex-1">
            <div className="truncate">{i.name}</div>
            <div className="text-xs text-gray-500">₹{i.price} · GST {i.gst}%</div>
          </div>
          <button onClick={() => dispatch(changeQty({ productId: i.productId, delta: -1 }))} className="rounded border p-1">
            {i.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
          </button>
          <span className="w-6 text-center">{i.qty}</span>
          <button onClick={() => dispatch(changeQty({ productId: i.productId, delta: 1 }))} className="rounded border p-1"><Plus size={14} /></button>
          <b className="w-20 text-right">{inr(i.price * i.qty)}</b>
        </div>
      ))}
      {!items.length && <p className="py-4 text-center text-gray-400">Tap a product to add</p>}

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{inr(totals.subtotal)}</span></div>
        <div className="flex justify-between"><span>GST</span><span>{inr(totals.tax)}</span></div>
        <div className="flex items-center justify-between gap-3">
          <span>Discount (₹)</span>
          <input type="number" min="0" value={discount || ''} onChange={(e) => dispatch(setDiscount(+e.target.value))}
            className="w-24 rounded border p-1 text-right" />
        </div>
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{inr(totals.total)}</span></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input placeholder="Customer name" value={cust.name} onChange={(e) => onCust({ ...cust, name: e.target.value })} className={inp} />
        <input placeholder="Phone" value={cust.phone} onChange={(e) => onCust({ ...cust, phone: e.target.value })} className={inp} />
      </div>

      <div className="mt-2 flex gap-2">
        {(['Cash','Online'] as const).map((m) => (
          <button key={m} onClick={() => onMode(m)}
            className={`flex-1 rounded-lg border p-2 text-sm ${mode === m ? 'bg-indigo-600 text-white' : ''}`}>
              {/* {m} */}
              {m === 'Online' ? 'Online (UPI / Card)' : m}
            </button>
        ))}
      </div>

      {mode === 'Cash' && (
        <div className="mt-2">
          <input type="number" min="0" placeholder="Amount received" value={received} onChange={(e) => onReceived(e.target.value)} className={inp} />
          {change > 0 && <p className="mt-1 text-sm text-green-700">Change to return: {inr(change)}</p>}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button disabled={busy || !items.length} onClick={onCheckout}
          className="flex-1 rounded-lg bg-green-600 p-3 font-medium text-white disabled:opacity-50">
          {busy ? 'Processing...' : mode === 'Cash' ? 'Pay & generate bill' : `Pay ${inr(totals.total)} online`}
        </button>
        <button onClick={() => dispatch(clearCart())} className="rounded-lg border px-3">Clear</button>
      </div>
    </div>
  );
}