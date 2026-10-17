import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ReceiptModal from './ReceiptModal';
import type { Sale } from '../types/saleTypes';

export default function SalesList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [view, setView] = useState<Sale | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      try { setSales((await api.get<Sale[]>('/sales', { params: { q, from, to } })).data); }
      catch { toast.error('Failed to load bills'); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, from, to]);

  const total = sales.reduce((a, s) => a + s.total, 0);
  const inp = 'rounded-lg border bg-white p-2 text-sm';

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <input placeholder="Bill no" value={q} onChange={(e) => setQ(e.target.value)} className={inp + ' w-28'} />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        <span className="ml-auto self-center text-sm text-gray-600">{sales.length} bills · <b>₹{total.toFixed(2)}</b></span>
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
                <td className="p-3">₹{s.total.toFixed(2)}</td>
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