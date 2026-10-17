export interface SaleItem {
  _id: string; product: string; name: string; sku: string;
  qty: number; price: number; gst: number; returnedQty: number;
}
export interface Sale {
  _id: string; billNo: string; items: SaleItem[];
  subtotal: number; tax: number; discount: number; total: number;
  paymentMode: 'Cash' | 'UPI' | 'Card'; amountReceived: number;
  customerName?: string; customerPhone?: string;
  staffName: string; createdAt: string;
}