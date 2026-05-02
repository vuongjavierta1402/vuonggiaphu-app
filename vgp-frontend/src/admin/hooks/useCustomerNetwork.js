import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminClient from '../api/adminClient';

const KEY = ['customer-network'];

export const useCustomerNetwork = () =>
  useQuery({
    queryKey: KEY,
    queryFn: () => adminClient.get('/customers/network'),
  });

// ── Nodes ─────────────────────────────────────────────────────────────────────
export const useCreateNode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.post('/customers/nodes', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateNode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminClient.put(`/customers/nodes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteNode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminClient.delete(`/customers/nodes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateNodePosition = () =>
  useMutation({
    mutationFn: ({ id, x, y }) => adminClient.patch(`/customers/nodes/${id}/position`, { x, y }),
  });

// ── Relations ─────────────────────────────────────────────────────────────────
export const useCreateRelation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.post('/customers/relations', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateRelation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminClient.put(`/customers/relations/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteRelation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminClient.delete(`/customers/relations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

// ── Groups ────────────────────────────────────────────────────────────────────
export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminClient.post('/customers/groups', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminClient.put(`/customers/groups/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminClient.delete(`/customers/groups/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
