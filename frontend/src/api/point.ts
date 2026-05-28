import api from './axios';
import type { ApiResponse, PointLog, Page } from '../types';

export const chargePoint = (amount: number) =>
  api.post<ApiResponse<{ pointBalance: number }>>('/points/charge', { amount });

export const getPointLogs = (params?: { page?: number; size?: number }) =>
  api.get<ApiResponse<Page<PointLog>>>('/points/logs', { params });
