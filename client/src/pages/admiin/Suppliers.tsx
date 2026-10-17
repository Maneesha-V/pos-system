import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supplierApi } from '../../api/supplierApi';
import { productApi } from '../../api/productApi';
import { useFetch } from '../../hooks/useFetch';
import { errMsg } from '../../utils/apiError';
import { inr } from '../../utils/format';
import Modal from '../../components/Modal';
import type { Supplier } from '../../types/supplierTypes';

type Mode = null | 'form' | 'purchase' | 'pay';
const emptyS = { name: '', phone: '', address: '' };
const inp = 'w-full rounded-lg border p-2 text-sm';

export default function Suppliers() {
  const sup = useFetch(supplierApi.list, [], 'Failed to load suppliers');
  const prod = useFetch(() => productApi.list(), [], 'Failed to load products');
  const items = sup.data ?? [];
  const products = prod.data ?? [];

  const [mode, setMode] = useState<Mode>(null);
  const [sel, setSel] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyS);
  const [pur, setPur] = useState({ productId: '', qty: '', unitCost: '' });
  const [amount, setAmount] = useState('');

  const close = () => setMode(null);

  const run = async (action: () => Promise<unknown>, okMsg: string, also?: () => void) => {
    try {
      await action();
      toast.success(okMsg);
      close();
      sup.reload();
      also?.();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const saveSupplier = (e: FormEvent) => {
    e.preventDefault();
    run(() => (sel ? supplierApi.update(sel._id, form) : supplierApi.create(form)), 'Saved');
  };
  const savePurchase = (e: FormEvent) => {
    e.preventDefault();
    run(() => supplierApi.purchase(sel!._id, { productId: pur.productId, qty: +pur.qty, unitCost: +pur.unitCost }),
      'Stock added', prod.reload);
  };
  const savePay = (e: FormEvent) => {
    e.preventDefault();
    run(() => supplierApi.pay(sel!._id, +amount), 'Payment recorded');
  };
  const remove = async (s: Supplier) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    try { await supplierApi.remove(s._id); toast.success('Deleted'); sup.reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => { setSel(null); setForm(emptyS); setMode('form'); }}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
          <Plus size={16} /> Add supplier
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>{['Name', 'Phone', 'Payable', ''].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="whitespace-nowrap p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.phone}</td>
                <td className={`p-3 ${s.balance > 0 ? 'font-semibold text-red-600' : ''}`}>{inr(s.balance)}</td>
                <td className="whitespace-nowrap p-3">
                  <button onClick={() => { setSel(s); setPur({ productId: products[0]?._id || '', qty: '', unitCost: '' }); setMode('purchase'); }}
                    className="mr-2 rounded border px-2 py-1 text-xs">Purchase</button>
                  <button onClick={() => { setSel(s); setAmount(''); setMode('pay'); }}
                    className="mr-3 rounded border px-2 py-1 text-xs">Pay</button>
                  <button onClick={() => { setSel(s); setForm({ name: s.name, phone: s.phone || '', address: s.address || '' }); setMode('form'); }}
                    className="mr-3 text-indigo-600"><Pencil size={16} /></button>
                  <button onClick={() => remove(s)} className="text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={4} className="p-6 text-center text-gray-400">No suppliers</td></tr>}
          </tbody>
        </table>
      </div>

      {mode === 'form' && (
        <Modal title={sel ? 'Edit supplier' : 'Add supplier'} onClose={close}>
          <form onSubmit={saveSupplier} className="space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
            <button className="w-full rounded-lg bg-indigo-600 p-2 text-white">Save</button>
          </form>
        </Modal>
      )}

      {mode === 'purchase' && sel && (
        <Modal title={`Purchase from ${sel.name}`} onClose={close}>
          <form onSubmit={savePurchase} className="space-y-3">
            <select value={pur.productId} onChange={(e) => setPur({ ...pur, productId: e.target.value })} className={inp}>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} (stock {p.stock})</option>)}
            </select>
            <input required type="number" min="1" step="1" placeholder="Quantity" value={pur.qty} onChange={(e) => setPur({ ...pur, qty: e.target.value })} className={inp} />
            <input required type="number" min="0" step="any" placeholder="Unit cost" value={pur.unitCost} onChange={(e) => setPur({ ...pur, unitCost: e.target.value })} className={inp} />
            <p className="text-sm text-gray-500">Total: {inr((+pur.qty || 0) * (+pur.unitCost || 0))}</p>
            <button className="w-full rounded-lg bg-indigo-600 p-2 text-white">Add stock</button>
          </form>
        </Modal>
      )}

      {mode === 'pay' && sel && (
        <Modal title={`Pay ${sel.name}`} onClose={close}>
          <form onSubmit={savePay} className="space-y-3">
            <p className="text-sm text-gray-500">Pending: {inr(sel.balance)}</p>
            <input required type="number" min="1" step="any" max={sel.balance} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inp} />
            <button className="w-full rounded-lg bg-indigo-600 p-2 text-white">Record payment</button>
          </form>
        </Modal>
      )}
    </div>
  );
}