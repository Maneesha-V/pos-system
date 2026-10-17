import api from './axios';
import { unwrap } from './unwrap';
import type { Sale } from '../types/saleTypes';
import type { ReturnRec } from '../types/returnTypes';

export const returnApi = {
  list: () => unwrap(api.get<ReturnRec[]>('/returns')),
  lookup: (billNo: string) => unwrap(api.get<Sale>(`/returns/lookup/${encodeURIComponent(billNo)}`)),
  create: (b: { saleId: string; itemId: string; qty: number; reason: string; restock: boolean }) =>
    unwrap(api.post<ReturnRec>('/returns', b)),
};