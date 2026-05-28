import api from './axios';
import type { ApiResponse, Farm, Page } from '../types';

export interface FarmParams {
  page?: number;
  size?: number;
  category?: string;
  certification?: string;
  keyword?: string;
  sort?: string;
}

export interface FarmData {
  name?: string;
  region?: string;
  category?: string;
  certification?: string;
  description?: string;
}

export const getFarms = (params?: FarmParams) =>
  api.get<ApiResponse<Page<Farm>>>('/farms', { params });

export const getMyFarm = () =>
  api.get<ApiResponse<Farm>>('/farms/me');

export const getFarm = (id: number) =>
  api.get<ApiResponse<Farm>>(`/farms/${id}`);

export const createFarm = (data: FarmData) =>
  api.post<ApiResponse<Farm>>('/farms', data);

export const updateMyFarm = (data: FarmData) =>
  api.patch<ApiResponse<Farm>>('/farms/me', data);
