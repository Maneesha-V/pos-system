import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal";
import type { Product } from "../../types/productTypes";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { productApi } from "../../api/productApi";
import { errMsg } from "../../utils/apiError";

const empty = {
  name: "",
  sku: "",
  category: "",
  price: "",
  cost: "",
  stock: "",
  minStock: "5",
  gst: "5",
};
type Form = typeof empty;

export default function Products() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const { data, reload } = useFetch(
    () => productApi.list({ q: dq }),
    [dq],
    "Failed to load products",
  );
  const items = data ?? [];

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: String(p.price),
      cost: String(p.cost),
      stock: String(p.stock),
      minStock: String(p.minStock),
      gst: String(p.gst),
    });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      price: +form.price,
      cost: +form.cost,
      stock: +form.stock,
      minStock: +form.minStock,
      gst: +form.gst,
    };
    try {
      if (editId) await productApi.update(editId, body);
      else await productApi.create(body);
      toast.success(editId ? "Product updated" : "Product added");
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Save failed"));
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      await productApi.remove(p._id);
      toast.success("Deleted");
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Delete failed"));
    }
  };

  const field = (key: keyof Form, label: string, type = "text") => (
    <label className="block text-xs text-gray-500">
      {label}
      <input
        required={["name", "sku", "price", "cost", "stock"].includes(key)}
        type={type}
        step="any"
        min={type === "number" ? 0 : undefined}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded-lg border p-2 text-sm text-gray-900"
      />
    </label>
  );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, SKU, category"
          className="min-w-0 flex-1 rounded-lg border bg-white p-2 text-sm"
        />
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 text-sm text-white"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {["Name", "SKU", "Category", "Price", "Stock", "GST", ""].map(
                (h) => (
                  <th key={h} className="whitespace-nowrap p-3">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="whitespace-nowrap p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.category}</td>
                <td className="whitespace-nowrap p-3">₹{p.price}</td>
                <td
                  className={`p-3 ${p.stock <= p.minStock ? "font-semibold text-red-600" : ""}`}
                >
                  {p.stock}
                </td>
                <td className="p-3">{p.gst}%</td>
                <td className="whitespace-nowrap p-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="mr-3 text-indigo-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(p)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={editId ? "Edit product" : "Add product"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit} className="space-y-3">
            {field("name", "Name")}
            <div className="grid grid-cols-2 gap-3">
              {field("sku", "SKU")}
              {field("category", "Category")}
              {field("price", "Selling price", "number")}
              {field("cost", "Cost price", "number")}
              {field("stock", "Stock", "number")}
              {field("minStock", "Low-stock alert", "number")}
              {field("gst", "GST %", "number")}
            </div>
            <button className="w-full rounded-lg bg-indigo-600 p-2 text-white">
              Save
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
