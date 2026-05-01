import apiClient from './client';

export const submitOrder = (payload) =>
  apiClient.post('/orders', payload);

export const fetchOrder = (orderNumber) =>
  apiClient.get(`/orders/${orderNumber}`);

export const validatePromo = (code) =>
  apiClient.post('/promos/validate', { code });
