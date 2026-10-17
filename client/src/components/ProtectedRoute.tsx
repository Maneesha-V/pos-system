import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import type { Role } from '../types/userTypes';

export default function ProtectedRoute({ roles }: { roles: Role[] }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/billing'} replace />;
  }
  return <Outlet />;
}