import { Schema, model } from 'mongoose';

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    balance: { type: Number, default: 0 }, 
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export default model('Supplier', supplierSchema);