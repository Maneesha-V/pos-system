import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import BillingLayout from './layouts/BillingLayout';
import Login from './pages/Login';
import Products from './pages/admiin/Products';
import Suppliers from './pages/admiin/Suppliers';
import Staff from './pages/admiin/Staff';
import SalesList from './components/SalesList';
import Billing from './pages/billing/Billing';
import Returns from './pages/admiin/Returns';
import Dashboard from './pages/admiin/Dashboard';
import Ledger from './pages/admiin/Ledger';
import MobileFrame from './pages/MobileFrame';

export default function App() {
  return (
    <Routes>
      <Route path="/mobile" element={<MobileFrame />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<SalesList />} />
          <Route path="returns" element={<Returns />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="staff" element={<Staff />} />
          <Route path="ledger" element={<Ledger />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin', 'staff']} />}>
        <Route path="/billing" element={<BillingLayout />}>
          <Route index element={<Billing />} />
          <Route path="my-sales" element={<SalesList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}