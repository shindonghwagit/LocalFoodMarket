import api from './axios';
import type { ApiResponse, Product, Page } from '../types';

export interface ProductParams {
  page?: number;
  size?: number;
  category?: string;
  keyword?: string;
  farmId?: number;
}

export interface ProductData {
  name: string;
  price: number;
  stock: number;
  category: string;
  harvestDate?: string;
  description?: string;
}

export const getProducts = (params?: ProductParams) =>
  api.get<ApiResponse<Page<Product>>>('/products', { params });

export const getProduct = (id: number) =>
  api.get<ApiResponse<Product>>(`/products/${id}`);

export const createProduct = (data: ProductData) =>
  api.post<ApiResponse<Product>>('/products', data);

export const updateProduct = (id: number, data: Partial<ProductData>) =>
  api.patch<ApiResponse<Product>>(`/products/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete<ApiResponse<void>>(`/products/${id}`);
