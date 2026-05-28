import api from './axios';
import type { ApiResponse, Farm, Page } from '../types';

export interface AdminStats {
  totalFarms: number;
  pendingFarms: number;
  totalUsers: number;
  reportedPosts: number;
  todaySignups: number;
  todayOrders: number;
  todayRevenue: number;
  todayPosts: number;
}

export interface AdminPost {
  id: number;
  title: string;
  authorEmail: string;
  reportCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  pointBalance: number;
  suspended: boolean;
  createdAt: string;
}

export const getAdminStats = () =>
  api.get<ApiResponse<AdminStats>>('/admin/stats');

export const getAdminFarms = (params?: { page?: number; size?: number; status?: string }) =>
  api.get<ApiResponse<Page<Farm>>>('/admin/farms', { params });

export const updateFarmStatus = (farmId: number, status: 'APPROVED' | 'REJECTED') =>
  api.patch<ApiResponse<Farm>>(`/admin/farms/${farmId}/status`, { status });

export const getAdminPosts = (params?: { page?: number; size?: number }) =>
  api.get<ApiResponse<Page<AdminPost>>>('/admin/posts', { params });

export const deleteAdminPost = (postId: number) =>
  api.delete<ApiResponse<void>>(`/admin/posts/${postId}`);

export const getAdminUsers = (params?: { page?: number; size?: number; keyword?: string }) =>
  api.get<ApiResponse<Page<AdminUser>>>('/admin/users', { params });

export const updateUserRole = (userId: number, role: string) =>
  api.patch<ApiResponse<void>>(`/admin/users/${userId}/role`, { role });

export const suspendUser = (userId: number) =>
  api.patch<ApiResponse<void>>(`/admin/users/${userId}/suspend`);
