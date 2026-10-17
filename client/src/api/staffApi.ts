import api from './axios';
import { unwrap } from './unwrap';
import type { Staff } from '../types/staffTypes';

export interface StaffInput { name: string; username: string; password?: string; role: 'admin' | 'staff'; active?: boolean }

export const staffApi = {
  list: () => unwrap(api.get<Staff[]>('/staff')),
  create: (b: StaffInput) => unwrap(api.post<Staff>('/staff', b)),
  update: (id: string, b: Partial<StaffInput>) => unwrap(api.put<Staff>(`/staff/${id}`, b)),
};