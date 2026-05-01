import { useQuery } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProductByCode,
  fetchFeaturedProducts,
  fetchSaleProducts,
  fetchSimilarProducts,
  fetchCategories,
  fetchBrands,
} from '../api/productApi';

export const useProducts = (params) =>
  useQuery({
    queryKey: ['products', params],
    queryFn:  () => fetchProducts(params),
    select:   (res) => res.data,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

export const useProduct = (productCode) =>
  useQuery({
    queryKey: ['product', productCode],
    queryFn:  () => fetchProductByCode(productCode),
    select:   (res) => res.data,
    enabled:  !!productCode,
    staleTime: 10 * 60 * 1000,
  });

export const useFeaturedProducts = (limit = 6) =>
  useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn:  () => fetchFeaturedProducts(limit),
    select:   (res) => res.data.products,
    staleTime: 10 * 60 * 1000,
  });

export const useSaleProducts = (page = 1, limit = 24) =>
  useQuery({
    queryKey: ['products', 'sale', page, limit],
    queryFn:  () => fetchSaleProducts(page, limit),
    select:   (res) => res.data,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

export const useSimilarProducts = (productCode, limit = 6) =>
  useQuery({
    queryKey: ['products', 'similar', productCode, limit],
    queryFn:  () => fetchSimilarProducts(productCode, limit),
    select:   (res) => res.data.products,
    enabled:  !!productCode,
    staleTime: 10 * 60 * 1000,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    select:   (res) => res.data,
    staleTime: 30 * 60 * 1000,
  });

export const useBrands = () =>
  useQuery({
    queryKey: ['brands'],
    queryFn:  fetchBrands,
    select:   (res) => res.data,
    staleTime: 30 * 60 * 1000,
  });
