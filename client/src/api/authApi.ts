import api from './axios';
import { unwrap } from './unwrap';
import type { User } from '../types/userTypes';

export const authApi = {
  login: (creds: { username: string; password: string }) =>
    unwrap(api.post<{ token: string; user: User }>('/auth/login', creds)),
};