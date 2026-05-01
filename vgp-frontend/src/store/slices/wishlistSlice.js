import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [], // array of { productCode, name, price, discountPrice, image }
  },
  reducers: {
    toggleWishlist(state, { payload }) {
      const idx = state.items.findIndex((i) => i.productCode === payload.productCode);
      if (idx !== -1) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(payload);
      }
    },
    removeFromWishlist(state, { payload: productCode }) {
      state.items = state.items.filter((i) => i.productCode !== productCode);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
