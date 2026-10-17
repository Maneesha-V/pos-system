import type { Product } from '../../types/productTypes';

interface Props {
  products: Product[];
  q: string;
  onSearch: (v: string) => void;
  onAdd: (p: Product) => void;
}

export default function ProductGrid({ products, q, onSearch, onAdd }: Props) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search name / SKU / category"
        className="mb-3 w-full rounded-lg border p-2 text-sm" />
      <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
        {products.map((p) => (
          <button key={p._id} disabled={p.stock < 1} onClick={() => onAdd(p)}
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
  );
}