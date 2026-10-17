import { useState } from 'react';
import { saleApi } from '../api/saleApi';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { inr } from '../utils/format';
import ReceiptModal from './ReceiptModal';
import type { Sale } from '../types/saleTypes';

const inp = 'rounded-lg border bg-white p-2 text-sm';

export default function SalesList() {
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [view, setView] = useState<Sale | null>(null);
  const dq = useDebounce(q, 250);

  const { data } = useFetch(() => saleApi.list({ q: dq, from, to }), [dq, from, to], 'Failed to load bills');
  const sales = data ?? [];
  const total = sales.reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <input placeholder="Bill no" value={q} onChange={(e) => setQ(e.target.value)} className={inp + ' w-28'} />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        <span className="ml-auto self-center text-sm text-gray-600">{sales.length} bills · <b>{inr(total)}</b></span>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>{['Bill', 'Date', 'Staff', 'Mode', 'Total', ''].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3 font-medium">{s.billNo}</td>
                <td className="whitespace-nowrap p-3">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="whitespace-nowrap p-3">{s.staffName}</td>
                <td className="p-3">{s.paymentMode}</td>
                <td className="p-3">{inr(s.total)}</td>
                <td className="p-3"><button onClick={() => setView(s)} className="text-indigo-600">View</button></td>
              </tr>
            ))}
            {!sales.length && <tr><td colSpan={6} className="p-6 text-center text-gray-400">No bills</td></tr>}
          </tbody>
        </table>
      </div>
      {view && <ReceiptModal sale={view} onClose={() => setView(null)} />}
    </div>
  );
}