import Stat from '../../components/Stat';
import { useFetch } from '../../hooks/useFetch';
import { reportApi } from '../../api/reportApi';
import { inr } from '../../utils/format';
import { lastNDays } from '../../utils/date';

export default function Dashboard() {
  const { data: s, loading } = useFetch(() => reportApi.summary(), [], 'Failed to load dashboard');

  if (loading && !s) return <p className="text-gray-400">Loading...</p>;
  if (!s) return <p className="text-gray-400">No data</p>;

  const days = lastNDays(7, s.daily);
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's sales" value={inr(s.sales.total)} />
        <Stat label="Bills today" value={s.sales.count} />
        <Stat label="Returns today" value={inr(s.returns.total)} tone="text-red-600" />
        <Stat label="Low-stock items" value={s.lowStock} tone={s.lowStock ? 'text-red-600' : ''} />
        <Stat label="Supplier payable" value={inr(s.payable)} />
        <Stat label="Profit today" value={inr(s.netProfit)} tone="text-green-700" />
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">Last 7 days</h2>
        <div className="flex h-40 items-end gap-2">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] text-gray-500">{d.total ? Math.round(d.total) : ''}</span>
              <div className="w-full rounded-t bg-indigo-500" style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total ? 4 : 1 }} />
              <span className="text-[10px] text-gray-500">{d.key.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">Top products today</h2>
        {s.topProducts.map((p) => (
          <div key={p._id} className="flex justify-between border-b py-1.5 text-sm last:border-0">
            <span>{p._id}</span><span>{p.qty} pcs · {inr(p.revenue)}</span>
          </div>
        ))}
        {!s.topProducts.length && <p className="text-sm text-gray-400">No sales yet today</p>}
      </div>
    </div>
  );
}