import { Schema, model, Types } from 'mongoose';

const ledgerSchema = new Schema(
  {
    type: { type: String, enum: ['sale', 'return', 'purchase', 'payment', 'expense'], required: true },
    description: { type: String, required: true },
    debit: { type: Number, default: 0 },  
    credit: { type: Number, default: 0 },
    ref: { type: Types.ObjectId },
  },
  { timestamps: true }
);
export default model('LedgerEntry', ledgerSchema);