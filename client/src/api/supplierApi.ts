import api from './axios';
import { unwrap } from './unwrap';
import type { Supplier } from '../types/supplierTypes';

export interface SupplierInput { name: string; phone?: string; address?: string }

export const supplierApi = {
  list: () => unwrap(api.get<Supplier[]>('/suppliers')),
  create: (b: SupplierInput) => unwrap(api.post<Supplier>('/suppliers', b)),
  update: (id: string, b: SupplierInput) => unwrap(api.put<Supplier>(`/suppliers/${id}`, b)),
  remove: (id: string) => unwrap(api.delete(`/suppliers/${id}`)),
  purchase: (id: string, b: { productId: string; qty: number; unitCost: number }) =>
    unwrap(api.post<Supplier>(`/suppliers/${id}/purchase`, b)),
  pay: (id: string, amount: number) => unwrap(api.post<Supplier>(`/suppliers/${id}/pay`, { amount })),
};