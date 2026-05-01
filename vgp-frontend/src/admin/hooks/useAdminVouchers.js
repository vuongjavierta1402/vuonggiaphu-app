import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminClient from '../api/adminClient';

export const useAdminVouchers = (params) =>
  useQuery({
    queryKey: ['admin-vouchers', params],
    queryFn: () => adminClient.get('/vouchers', { params }),
  });

export const useAdminVoucher = (id) =>
  useQuery({
    queryKey: ['admin-voucher', id],
    queryFn: () => adminClient.get(`/vouchers/${id}`),
    enabled: !!id,
  });

export const useCreateVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.post('/vouchers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vouchers'] }),
  });
};

export const useUpdateVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminClient.put(`/vouchers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vouchers'] }),
  });
};

export const useDeleteVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminClient.delete(`/vouchers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vouchers'] }),
  });
};
