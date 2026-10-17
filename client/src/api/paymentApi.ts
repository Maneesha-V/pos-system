import api from './axios';
import { unwrap } from './unwrap';

export const paymentApi = {
  createOrder: (items: { productId: string; qty: number }[], discount: number) =>
    unwrap(api.post<{ orderId: string; amount: number; keyId: string }>('/payments/order', { items, discount })),
};