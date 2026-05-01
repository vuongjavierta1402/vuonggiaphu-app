/**
 * Format a VND price number into a human-readable string.
 * e.g. 6200000 → "6.200.000 đ"
 */
export const formatVND = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

/**
 * Returns the effective selling price of a product.
 * Uses discountPrice if set and lower than price.
 */
export const sellingPrice = (product) => {
  if (!product) return 0;
  const { price, discountPrice } = product;
  return discountPrice && discountPrice > 0 && discountPrice < price ? discountPrice : price;
};

/**
 * Calculate discount percentage.
 */
export const discountPercent = (product) => {
  const { price, discountPrice } = product;
  if (!discountPrice || discountPrice <= 0 || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

/**
 * Resolve a product image value to a usable src URL.
 * Full URLs (Cloudinary, TDM, etc.) are returned as-is;
 * bare filenames fall back to the local /images/ folder.
 */
export const imgSrc = (value, fallback = '/images/placeholder.jpg') => {
  if (!value) return fallback;
  return value.startsWith('http') ? value : `/images/${value}`;
};

/**
 * Convert a VND amount to another currency using exchange rates from Redux.
 */
export const convertCurrency = (vndAmount, currency, exchangeRates) => {
  if (!currency || currency.VND === 1) return vndAmount;
  const rate = exchangeRates?.rates?.[Object.keys(currency)[0]];
  return rate ? Math.round(vndAmount * rate) : vndAmount;
};
