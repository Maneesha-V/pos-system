import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Receipt, Undo2, Truck, Users, BookOpen, ShoppingCart, LogOut,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/sales', label: 'Sales', icon: Receipt },
  { to: '/admin/returns', label: 'Returns', icon: Undo2 },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/ledger', label: 'Ledger', icon: BookOpen },
];

export default function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const out = () => { dispatch(logout()); nav('/login'); };

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-white md:flex">
        <div className="p-4 text-lg font-bold">🧵 Textile POS</div>
        <nav className="flex-1 space-y-1 px-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <NavLink to="/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <ShoppingCart size={18} /> Open Billing
          </NavLink>
        </nav>
        <div className="border-t p-3 text-sm">
          <div className="font-medium">{user?.name}</div>
          <button onClick={out} className="mt-2 flex items-center gap-2 text-red-600"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
          <b>🧵 Admin</b>
          <button onClick={out} className="text-red-600"><LogOut size={18} /></button>
        </header>
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6"><Outlet /></main>

        {/* Mobile bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {[...links, { to: '/billing', label: 'Billing', icon: ShoppingCart, end: false }].map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex min-w-[72px] flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
              <Icon size={20} /> {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}