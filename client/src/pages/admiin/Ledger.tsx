import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Download, Plus } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import Stat from '../../components/Stat';
import type { LedgerRow, Summary } from '../../types/reportTypes';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const ymd = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export default function Ledger() {
  const [from, setFrom] = useState(ymd(new Date(Date.now() - 29 * 864e5)));
  const [to, setTo] = useState(ymd(new Date()));
  const [type, setType] = useState('');
  const [s, setS] = useState<Summary | null>(null);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [open, setOpen] = useState(false);
  const [exp, setExp] = useState({ description: '', amount: '' });

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        api.get<Summary>('/reports/summary', { params: { from, to } }),
        api.get<LedgerRow[]>('/reports/ledger', { params: { from, to, type } }),
      ]);
      setS(a.data); setRows(b.data);
    } catch { toast.error('Failed to load report'); }
  };
  useEffect(() => { load(); }, [from, to, type]);

  const addExpense = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reports/expenses', { description: exp.description, amount: +exp.amount });
      toast.success('Expense added');
      setOpen(false); setExp({ description: '', amount: '' }); load();
    } catch (x: any) { toast.error(x.response?.data?.message || 'Failed'); }
  };

  const exportCsv = () => {
    const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [['Date', 'Type', 'Description', 'In', 'Out'].join(',')].concat(
      rows.map((r) => [q(new Date(r.createdAt).toLocaleString()), q(r.type), q(r.description), r.credit, r.debit].join(','))
    );
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `ledger_${from}_to_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const inp = 'rounded-lg border bg-white p-2 text-sm';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={inp}>
          <option value="">All types</option>
          {['sale', 'return', 'purchase', 'payment', 'expense'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => setOpen(true)} className="ml-auto flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm"><Plus size={16} /> Expense</button>
        <button onClick={exportCsv} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"><Download size={16} /> CSV</button>
      </div>

      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Sales" value={inr(s.sales.total)} />
            <Stat label="Returns" value={inr(s.returns.total)} tone="text-red-600" />
            <Stat label="Net sales" value={inr(s.sales.total - s.returns.total)} />
            <Stat label="Purchases" value={inr(s.purchases)} />
            <Stat label="Supplier payments" value={inr(s.payments)} />
            <Stat label="Expenses" value={inr(s.expenses)} />
            <Stat label="Gross profit" value={inr(s.grossProfit)} tone="text-green-700" />
            <Stat label="Net profit" value={inr(s.netProfit)} tone={s.netProfit < 0 ? 'text-red-600' : 'text-green-700'} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-2 font-semibold">Sales by staff</h2>
              {s.byStaff.map((x) => (
                <div key={x._id} className="flex justify-between border-b py-1.5 text-sm last:border-0">
                  <span>{x._id}</span><span>{x.count} bills · {inr(x.total)}</span>
                </div>
              ))}
              {!s.byStaff.length && <p className="text-sm text-gray-400">No data</p>}
            </div>
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-2 font-semibold">Top products</h2>
              {s.topProducts.map((x) => (
                <div key={x._id} className="flex justify-between border-b py-1.5 text-sm last:border-0">
                  <span>{x._id}</span><span>{x.qty} pcs · {inr(x.revenue)}</span>
                </div>
              ))}
              {!s.topProducts.length && <p className="text-sm text-gray-400">No data</p>}
            </div>
          </div>
        </>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>{['Date', 'Type', 'Description', 'In', 'Out'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="whitespace-nowrap p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3 capitalize">{r.type}</td>
                <td className="whitespace-nowrap p-3">{r.description}</td>
                <td className="p-3 text-green-700">{r.credit ? inr(r.credit) : ''}</td>
                <td className="p-3 text-red-600">{r.debit ? inr(r.debit) : ''}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No entries</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Add expense" onClose={() => setOpen(false)}>
          <form onSubmit={addExpense} className="space-y-3">
            <input required placeholder="Description (rent, electricity...)" value={exp.description}
              onChange={(e) => setExp({ ...exp, description: e.target.value })} className={inp + ' w-full'} />
            <input required type="number" min="1" step="any" placeholder="Amount" value={exp.amount}
              onChange={(e) => setExp({ ...exp, amount: e.target.value })} className={inp + ' w-full'} />
            <button className="w-full rounded-lg bg-indigo-600 p-2 text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}