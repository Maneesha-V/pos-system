import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil } from 'lucide-react';
import { staffApi } from '../../api/staffApi';
import { useFetch } from '../../hooks/useFetch';
import { errMsg } from '../../utils/apiError';
import Modal from '../../components/Modal';
import type { Staff as StaffT } from '../../types/staffTypes';

type Form = { name: string; username: string; password: string; role: 'admin' | 'staff'; active: boolean };
const empty: Form = { name: '', username: '', password: '', role: 'staff', active: true };
const inp = 'w-full rounded-lg border p-2 text-sm';

export default function Staff() {
  const { data, reload } = useFetch(staffApi.list, [], 'Failed to load staff');
  const items = data ?? [];

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const openNew = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (s: StaffT) => {
    setEditId(s._id);
    setForm({ name: s.name, username: s.username, password: '', role: s.role, active: s.active });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await staffApi.update(editId, form);
      else await staffApi.create(form);
      toast.success('Saved');
      setOpen(false);
      reload();
    } catch (err) { toast.error(errMsg(err, 'Save failed')); }
  };

  const toggle = async (s: StaffT) => {
    try { await staffApi.update(s._id, { active: !s.active }); reload(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openNew} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
          <Plus size={16} /> Add staff
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>{['Name', 'Username', 'Role', 'Status', ''].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="whitespace-nowrap p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.username}</td>
                <td className="p-3 capitalize">{s.role}</td>
                <td className="p-3">
                  <button onClick={() => toggle(s)}
                    className={`rounded-full px-2 py-0.5 text-xs ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {s.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="p-3"><button onClick={() => openEdit(s)} className="text-indigo-600"><Pencil size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editId ? 'Edit staff' : 'Add staff'} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
            <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inp} />
            <input required={!editId} type="password" placeholder={editId ? 'New password (leave blank to keep)' : 'Password'}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inp} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Form['role'] })} className={inp}>
              <option value="staff">Billing staff</option>
              <option value="admin">Admin</option>
            </select>
            <button className="w-full rounded-lg bg-indigo-600 p-2 text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}