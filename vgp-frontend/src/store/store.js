import { configureStore } from '@reduxjs/toolkit';
import cartReducer     from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer       from './slices/uiSlice';
import promoReducer    from './slices/promoSlice';
import currencyReducer from './slices/currencySlice';

export const store = configureStore({
  reducer: {
    cart:     cartReducer,
    wishlist: wishlistReducer,
    ui:       uiReducer,
    promo:    promoReducer,
    currency: currencyReducer,
    // NOTE: products are NOT stored in Redux.
    // Server data is managed by React Query (see src/hooks/useProducts.js).
  },
});
