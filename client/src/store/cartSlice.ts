import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types/productTypes';

interface CartState { items: CartItem[]; discount: number }
const initialState: CartState = { items: [], discount: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(s, a: PayloadAction<Omit<CartItem, 'qty'>>) {
      const ex = s.items.find((i) => i.productId === a.payload.productId);
      if (ex) { if (ex.qty < ex.stock) ex.qty += 1; }
      else if (a.payload.stock > 0) s.items.push({ ...a.payload, qty: 1 });
    },
    changeQty(s, a: PayloadAction<{ productId: string; delta: number }>) {
      const it = s.items.find((i) => i.productId === a.payload.productId);
      if (!it) return;
      it.qty = Math.min(it.stock, it.qty + a.payload.delta);
      if (it.qty < 1) s.items = s.items.filter((i) => i.productId !== it.productId);
    },
    setDiscount(s, a: PayloadAction<number>) { s.discount = Math.max(0, a.payload); },
    clearCart() { return initialState; },
  },
});

export const { addItem, changeQty, setDiscount, clearCart } = cartSlice.actions;
export default cartSlice.reducer;