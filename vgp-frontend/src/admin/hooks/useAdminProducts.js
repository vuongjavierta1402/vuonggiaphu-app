import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminClient from '../api/adminClient';

export const useAdminProducts = (params) =>
  useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminClient.get('/products', { params }),
  });

export const useAdminProduct = (code) =>
  useQuery({
    queryKey: ['admin-product', code],
    queryFn: () => adminClient.get(`/products/${code}`),
    enabled: !!code && code !== 'new',
  });

export const useProductVouchers = (code) =>
  useQuery({
    queryKey: ['admin-product-vouchers', code],
    queryFn: () => adminClient.get(`/products/${code}/vouchers`),
    enabled: !!code && code !== 'new',
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.post('/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
};

export const useUpdateProduct = (code) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.put(`/products/${code}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-product', code] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code) => adminClient.delete(`/products/${code}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
};

export const useToggleDisplay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, isDisplay }) => adminClient.put(`/products/${code}`, { isDisplay }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
};

export const useBulkDeleteProducts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (codes) => Promise.all(codes.map(code => adminClient.delete(`/products/${code}`))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
};

export const useBulkSetDisplay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ codes, isDisplay }) =>
      Promise.all(codes.map(code => adminClient.put(`/products/${code}`, { isDisplay }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
};

export const useSyncProductVouchers = (code) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (voucherIds) => adminClient.post(`/products/${code}/sync-vouchers`, { voucherIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-product-vouchers', code] }),
  });
};

export const useUploadImages = () =>
  useMutation({
    mutationFn: (files) => {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      return adminClient.post('/products/upload-images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  });

export const useExportProducts = () => {
  const [loading, setLoading] = useState(false);

  const exportProducts = async (filters = {}) => {
    setLoading(true);
    try {
      // Strip pagination and empty values
      const params = Object.fromEntries(
        Object.entries(filters).filter(([k, v]) => !['page', 'limit'].includes(k) && v !== undefined && v !== '')
      );
      const blob = await adminClient.get('/products/export', {
        params,
        responseType: 'blob',
        timeout: 120000,
      });
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `vgp_products_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return { exportProducts, loading };
};

export const useImportProducts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return adminClient.post('/products/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 1200000, // 20 minutes for large imports
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
};
