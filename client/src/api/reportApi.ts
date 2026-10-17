import api from './axios';
import { unwrap } from './unwrap';
import type { Summary, LedgerRow } from '../types/reportTypes';

export interface DateRange { from?: string; to?: string }

export const reportApi = {
  summary: (p?: DateRange) => unwrap(api.get<Summary>('/reports/summary', { params: p })),
  ledger: (p?: DateRange & { type?: string }) => unwrap(api.get<LedgerRow[]>('/reports/ledger', { params: p })),
  addExpense: (b: { description: string; amount: number }) => unwrap(api.post<LedgerRow>('/reports/expenses', b)),
};