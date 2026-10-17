import { Schema, model, Types } from 'mongoose';

const purchaseSchema = new Schema(
  {
    supplier: { type: Types.ObjectId, ref: 'Supplier', required: true },
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);
export default model('Purchase', purchaseSchema);