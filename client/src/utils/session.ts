import type { User } from '../types/userTypes';

export const loadUser = (): User | null => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};
export const saveSession = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
export const getToken = () => localStorage.getItem('token');
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};