import api from './axios';
import type { ApiResponse, PointLog, Page } from '../types';

export const getPointLogs = (params?: { page?: number; size?: number }) =>
  api.get<ApiResponse<Page<PointLog>>>('/points/logs', { params });
