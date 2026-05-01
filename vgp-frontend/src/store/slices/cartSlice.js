import { createSlice } from '@reduxjs/toolkit';

const MAX_CART = 10;

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    cartTotal: 0,       // total item count (for the badge)
    orderSuccess: false,
    orderNumber: null,  // set after a successful order submission
  },
  reducers: {
    addToCart(state, { payload }) {
      const { productCode, quantity = 1, name, price, discountPrice, image } = payload;
      const existing = state.items.find((i) => i.productCode === productCode);
      if (existing) {
        const newQty = Math.min(MAX_CART, existing.quantity + quantity);
        state.cartTotal += newQty - existing.quantity;
        existing.quantity = newQty;
      } else {
        const capped = Math.min(MAX_CART, quantity);
        state.items.push({ productCode, name, price, discountPrice, image, quantity: capped });
        state.cartTotal += capped;
      }
    },
    removeFromCart(state, { payload: productCode }) {
      const idx = state.items.findIndex((i) => i.productCode === productCode);
      if (idx !== -1) {
        state.cartTotal -= state.items[idx].quantity;
        state.items.splice(idx, 1);
      }
    },
    updateQuantity(state, { payload: { productCode, quantity } }) {
      const item = state.items.find((i) => i.productCode === productCode);
      if (item) {
        const capped = Math.min(MAX_CART, Math.max(1, quantity));
        state.cartTotal += capped - item.quantity;
        item.quantity = capped;
      }
    },
    clearCart(state) {
      state.items = [];
      state.cartTotal = 0;
    },
    // payload: { success: true, orderNumber: 'VGP-...' }
    setOrderSuccess(state, { payload }) {
      const success = payload === true || payload?.success === true;
      state.orderSuccess = success;
      state.orderNumber  = payload?.orderNumber ?? null;
      if (success) {
        state.items = [];
        state.cartTotal = 0;
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setOrderSuccess } =
  cartSlice.actions;

export default cartSlice.reducer;
