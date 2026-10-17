import api from './axios';
import { unwrap } from './unwrap';
import type { Sale } from '../types/saleTypes';
import type { PaymentProof, PayMode } from '../types/paymentTypes';

export interface CreateSaleBody {
  items: { productId: string; qty: number }[];
  discount: number;
  paymentMode: PayMode;
  payment?: PaymentProof;
  amountReceived?: number;
  customerName?: string;
  customerPhone?: string;
}

export const saleApi = {
  list: (params?: { q?: string; from?: string; to?: string }) => unwrap(api.get<Sale[]>('/sales', { params })),
  create: (b: CreateSaleBody) => unwrap(api.post<Sale>('/sales', b)),
};