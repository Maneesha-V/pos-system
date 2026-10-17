import { Schema, model, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, default: 'General', trim: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minStock: { type: Number, min: 0, default: 5 },
    gst: { type: Number, min: 0, max: 100, default: 5 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type IProduct = InferSchemaType<typeof productSchema>;
export default model('Product', productSchema);