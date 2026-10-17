import toast from 'react-hot-toast';
import api from './axios';
import type { PaymentProof } from '../types/paymentTypes';

declare global { interface Window { Razorpay: any } }

let loader: Promise<void> | null = null;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => { loader = null; reject(new Error('Could not load payment gateway')); };
    document.body.appendChild(s);
  });
  return loader;
};

export async function startOnlinePayment(
  items: { productId: string; qty: number }[],
  discount: number,
  prefill: { name?: string; phone?: string }
): Promise<PaymentProof> {
  const { data: o } = await api.post<{ orderId: string; amount: number; keyId: string }>(
    '/payments/order', { items, discount }
  );
  await loadRazorpay();

  return new Promise<PaymentProof>((resolve, reject) => {
    const rz = new window.Razorpay({
      key: o.keyId, amount: o.amount, currency: 'INR', order_id: o.orderId,
      name: 'Textile Store', prefill: { name: prefill.name, contact: prefill.phone },
      handler: (r: any) =>
        resolve({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    // Do NOT reject here: the customer can retry inside the popup
    rz.on('payment.failed', (r: any) => toast.error(r.error?.description || 'Payment failed, try again'));
    rz.open();
  });
}