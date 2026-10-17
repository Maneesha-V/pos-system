import api from './axios';
import { unwrap } from './unwrap';
import type { Product } from '../types/productTypes';

export type ProductInput = Omit<Product, '_id'>;

export const productApi = {
  list: (params?: { q?: string; lowStock?: boolean }) => unwrap(api.get<Product[]>('/products', { params })),
  create: (b: ProductInput) => unwrap(api.post<Product>('/products', b)),
  update: (id: string, b: ProductInput) => unwrap(api.put<Product>(`/products/${id}`, b)),
  remove: (id: string) => unwrap(api.delete<{ message: string }>(`/products/${id}`)),
};