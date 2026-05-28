import api from './axios';
import type { ApiResponse, Order, OrderStatus, Page } from '../types';

export interface OrderItemData {
  productId: number;
  quantity: number;
}

export interface CreateOrderData {
  deliveryAddress: string;
  items: OrderItemData[];
}

export const createOrder = (data: CreateOrderData) =>
  api.post<ApiResponse<Order>>('/orders', data);

export const getOrders = () =>
  api.get<ApiResponse<Page<Order>>>('/orders');

export const getOrder = (id: number) =>
  api.get<ApiResponse<Order>>(`/orders/${id}`);

export const getFarmOrders = (params?: { page?: number; size?: number }) =>
  api.get<ApiResponse<Page<Order>>>('/orders/farm', { params });

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
