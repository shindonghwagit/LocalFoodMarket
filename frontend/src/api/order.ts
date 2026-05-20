import api from './axios';
import type { ApiResponse, Order, Page } from '../types';

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
