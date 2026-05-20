import api from './axios';
import type { ApiResponse, Farm, Page } from '../types';

export interface FarmParams {
  page?: number;
  size?: number;
  category?: string;
  certification?: string;
  keyword?: string;
}

export interface UpdateFarmData {
  name?: string;
  region?: string;
  category?: string;
  certification?: string;
  description?: string;
}

export const getFarms = (params?: FarmParams) =>
  api.get<ApiResponse<Page<Farm>>>('/farms', { params });

export const getFarm = (id: number) =>
  api.get<ApiResponse<Farm>>(`/farms/${id}`);

export const updateMyFarm = (data: UpdateFarmData) =>
  api.patch<ApiResponse<Farm>>('/farms/me', data);
