import apiClient from './client';

export const fetchProducts = (params) =>
  apiClient.get('/products', { params });

export const fetchProductByCode = (productCode) =>
  apiClient.get(`/products/${productCode}`);

export const fetchFeaturedProducts = (limit = 6) =>
  apiClient.get('/products/featured', { params: { limit } });

export const fetchSaleProducts = (page = 1, limit = 24) =>
  apiClient.get('/products/sale', { params: { page, limit } });

export const fetchSimilarProducts = (productCode, limit = 6) =>
  apiClient.get(`/products/${productCode}/similar`, { params: { limit } });

export const fetchCategories = () =>
  apiClient.get('/categories');

export const fetchBrands = () =>
  apiClient.get('/categories/brands');
