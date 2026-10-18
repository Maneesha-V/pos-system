export type PayMode = 'Cash' | 'Online';
export interface PaymentProof { orderId: string; paymentId: string; signature: string }