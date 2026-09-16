import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // { id, name, price, qty, image }
  },
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.qty += action.payload.qty ?? 1;
      } else {
        state.items.push({ qty: 1, ...action.payload });
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setQty(state, action) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.qty = action.payload.qty;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, setQty, clearCart } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0);

export default cartSlice.reducer;
