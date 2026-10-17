export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  gst: number;
}
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  cost: number;
  gst: number;
  qty: number;
  stock: number;
}