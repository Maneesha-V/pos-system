import axios from 'axios';
import { clearSession, getToken } from '../utils/session';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !err.config.url?.includes('/auth/login')) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export default api;