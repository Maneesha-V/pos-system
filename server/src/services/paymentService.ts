import crypto from 'crypto';
import { getRazorpay } from '../config/razorpay';
import type { PaymentProof } from '../types/payment';
import { AppError } from '../utils/AppError';

export interface VerifiedPayment { paymentId: string; amountPaise: number; method: string }

export async function createGatewayOrder(total: number) {
  const order = await getRazorpay().orders.create({
    amount: Math.round(total * 100), // paise
    currency: 'INR',
    receipt: `pos_${Date.now()}`,
  });
  return { orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID as string };
}

export async function verifyPayment(proof: PaymentProof): Promise<VerifiedPayment> {
  const { orderId, paymentId, signature } = (proof ?? {}) as Partial<PaymentProof>;
  if (!orderId || !paymentId || !signature) throw new AppError('Invalid payment details');

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('Payment verification failed');

  const pay = await getRazorpay().payments.fetch(paymentId);
  if (pay.order_id !== orderId || pay.status !== 'captured') throw new Error('Payment not completed');
  return { paymentId: pay.id, amountPaise: Number(pay.amount), method: String(pay.method) };
}

export async function refundPayment(paymentId: string): Promise<void> {
  try {
    await getRazorpay().payments.refund(paymentId, {});
  } catch (e) {
    console.error('AUTO-REFUND FAILED, refund manually in Razorpay dashboard:', paymentId, e);
  }
}