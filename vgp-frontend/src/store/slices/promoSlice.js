import { createSlice } from '@reduxjs/toolkit';

const promoSlice = createSlice({
  name: 'promo',
  initialState: {
    usedPromoCode: null, // { code, discountType: 'percentage'|'fixed', discountValue }
  },
  reducers: {
    applyPromo(state, { payload }) {
      state.usedPromoCode = payload;
    },
    removePromo(state) {
      state.usedPromoCode = null;
    },
  },
});

export const { applyPromo, removePromo } = promoSlice.actions;
export default promoSlice.reducer;
