import { Schema, model, Types } from 'mongoose';

export type PayMode = 'Cash' | 'UPI' | 'Card';
const itemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    name: String,
    sku: String,
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    returnedQty: { type: Number, default: 0 }, // used by Returns later
  },
  { _id: true }
);

const saleSchema = new Schema(
  {
    billNo: { type: String, required: true, unique: true },
    items: [itemSchema],
    subtotal: Number,
    tax: Number,
    discount: { type: Number, default: 0 },
    total: Number,
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card'], default: 'Cash' },
    amountReceived: Number,
    customerName: String,
    customerPhone: String,
    staff: { type: Types.ObjectId, ref: 'User', required: true },
    staffName: String,
  },
  { timestamps: true }
);
export default model('Sale', saleSchema);