import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

export default function BillingLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const tab = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600'}`;

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <b className="mr-2">🧵 Billing</b>
        <NavLink to="/billing" end className={tab}>New Bill</NavLink>
        <NavLink to="/billing/my-sales" className={tab}>My Bills</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin" className={tab}>Admin</NavLink>}
        <span className="ml-auto text-sm text-gray-500">{user?.name}</span>
        <button onClick={() => { dispatch(logout()); nav('/login'); }} className="text-red-600"><LogOut size={18} /></button>
      </header>
      <main className="p-4"><Outlet /></main>
    </div>
  );
}