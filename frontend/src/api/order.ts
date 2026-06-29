import api from './axios';
import type { ApiResponse, DeliveryMethod, Order, OrderStatus, Page } from '../types';

export interface OrderItemData {
  productId: number;
  quantity: number;
}

export interface CreateOrderData {
  deliveryMethod: DeliveryMethod;
  // DELIVERY일 때 필수
  deliveryAddress?: string | null;
  // PICKUP일 때 필수
  pickupLocation?: string | null;
  pickupTime?: string | null;
  buyerNote?: string | null;
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

export interface UpdateOrderStatusData {
  status: OrderStatus;
  courier?: string;
  trackingNumber?: string;
}

// 농가: 주문 상태 진행 (READY / PREPARING / SHIPPING / DELIVERED)
export const updateOrderStatus = (id: number, data: UpdateOrderStatusData) =>
  api.patch<ApiResponse<Order>>(`/orders/${id}/status`, data);

// 구매자: 수령 확인 → 정산
export const confirmOrder = (id: number) =>
  api.patch<ApiResponse<Order>>(`/orders/${id}/confirm`);

// 구매자 또는 농가: 주문 취소 → 환불
export const cancelOrder = (id: number) =>
  api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
