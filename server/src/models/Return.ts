import { Schema, model, Types } from 'mongoose';

const returnSchema = new Schema(
  {
    sale: { type: Types.ObjectId, ref: 'Sale', required: true },
    billNo: { type: String, required: true },
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    name: String,
    qty: { type: Number, required: true, min: 1 },
    refund: { type: Number, required: true },
    reason: { type: String, default: '' },
    restocked: { type: Boolean, default: true },
    processedBy: { type: Types.ObjectId, ref: 'User', required: true },
    processedByName: String,
  },
  { timestamps: true }
);
export default model('Return', returnSchema);