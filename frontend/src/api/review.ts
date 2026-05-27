import api from './axios';
import type { ApiResponse, Review, Page } from '../types';

export interface ReviewParams {
  page?: number;
  size?: number;
  productId?: number;
  farmId?: number;
}

export const getReviews = (params?: ReviewParams) =>
  api.get<ApiResponse<Page<Review>>>('/reviews', { params });

export const createReview = (data: { productId: number; orderId: number; rating: number; content: string }) =>
  api.post<ApiResponse<Review>>('/reviews', data);
