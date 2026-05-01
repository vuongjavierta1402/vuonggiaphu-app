import { createSlice } from '@reduxjs/toolkit';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    usedCurrency: { VND: 1, symbol: 'đ' },
    exchangeRates: { base: 'VND', date: null, rates: { USD: 0.000039 } },
  },
  reducers: {
    setCurrency(state, { payload }) {
      state.usedCurrency = payload;
    },
    setExchangeRates(state, { payload }) {
      state.exchangeRates = payload;
    },
  },
});

export const { setCurrency, setExchangeRates } = currencySlice.actions;
export default currencySlice.reducer;
