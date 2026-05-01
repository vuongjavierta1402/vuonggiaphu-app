import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminClient from '../api/adminClient';

export const useAdminCategories = () =>
  useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminClient.get('/categories'),
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.post('/categories', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminClient.put(`/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminClient.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
};

export const useSeedCategories = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post('/categories/seed-defaults'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
};
