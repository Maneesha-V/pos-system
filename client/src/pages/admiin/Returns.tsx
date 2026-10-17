import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { returnApi } from '../../api/returnApi';
import { useFetch } from '../../hooks/useFetch';
import { errMsg } from '../../utils/apiError';
import { inr } from '../../utils/format';
import Modal from '../../components/Modal';
import type { Sale } from '../../types/saleTypes';

const inp = 'w-full rounded-lg border p-2 text-sm';

export default function Returns() {
  const { data, reload } = useFetch(returnApi.list, [], 'Failed to load returns');
  const list = data ?? [];

  const [open, setOpen] = useState(false);
  const [billNo, setBillNo] = useState('');
  const [sale, setSale] = useState<Sale | null>(null);
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('');
  const [restock, setRestock] = useState(true);

  const reset = () => { setBillNo(''); setSale(null); setItemId(''); setQty('1'); setReason(''); setRestock(true); };

  const lookup = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const s = await returnApi.lookup(billNo.trim());
      setSale(s);
      setItemId(s.items.find((i) => i.qty > i.returnedQty)?._id || '');
      setQty('1');
    } catch (x) { setSale(null); toast.error(errMsg(x)); }
  };

  const item = sale?.items.find((i) => i._id === itemId);
  const left = item ? item.qty - item.returnedQty : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sale || !item) return;
    try {
      await returnApi.create({ saleId: sale._id, itemId, qty: +qty, reason, restock });
      toast.success('Return processed');
      setOpen(false); reset(); reload();
    } catch (x) { toast.error(errMsg(x)); }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => { reset(); setOpen(true); }}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
          <Plus size={16} /> Process return
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>{['Date', 'Bill', 'Item', 'Qty', 'Refund', 'Reason', 'By'].map((h) => <th key={h} className="whitespace-nowrap p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="whitespace-nowrap p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3 font-medium">{r.billNo}</td>
                <td className="whitespace-nowrap p-3">{r.name}</td>
                <td className="p-3">{r.qty}</td>
                <td className="p-3">{inr(r.refund)}</td>
                <td className="p-3">{r.reason}{!r.restocked && ' (not restocked)'}</td>
                <td className="whitespace-nowrap p-3">{r.processedByName}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="p-6 text-center text-gray-400">No returns</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Process return" onClose={() => setOpen(false)}>
          <form onSubmit={lookup} className="mb-3 flex gap-2">
            <input required placeholder="Bill no (e.g. B1001)" value={billNo} onChange={(e) => setBillNo(e.target.value)} className={inp} />
            <button className="rounded-lg border px-3 text-sm">Find</button>
          </form>

          {sale && (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs text-gray-500">{sale.billNo} · {new Date(sale.createdAt).toLocaleDateString()} · {inr(sale.total)}</p>
              <select value={itemId} onChange={(e) => { setItemId(e.target.value); setQty('1'); }} className={inp}>
                {sale.items.map((i) => (
                  <option key={i._id} value={i._id} disabled={i.qty - i.returnedQty < 1}>
                    {i.name} (bought {i.qty}, returned {i.returnedQty})
                  </option>
                ))}
              </select>
              <input required type="number" min="1" max={left} step="1" value={qty} onChange={(e) => setQty(e.target.value)} className={inp} />
              <p className="text-xs text-gray-500">Returnable: {left}</p>
              <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className={inp} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
                Add back to stock (untick if damaged)
              </label>
              <button disabled={left < 1} className="w-full rounded-lg bg-indigo-600 p-2 text-white disabled:opacity-50">Refund & save</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}