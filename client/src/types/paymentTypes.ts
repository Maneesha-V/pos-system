export type PayMode = 'Cash' | 'UPI' | 'Card';
export interface PaymentProof { orderId: string; paymentId: string; signature: string }