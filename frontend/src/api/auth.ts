import type { AxiosRequestConfig } from 'axios';
import api from './axios';
import type { ApiResponse, AuthResponse, User, Role } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
  farmName?: string;
  region?: string;
  category?: string;
  certification?: string;
  description?: string;
}

export const register = (data: RegisterPayload) =>
  api.post<ApiResponse<AuthResponse>>('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse<AuthResponse>>('/auth/login', data);

export const completeOAuth2 = (data: { tempToken: string; role: Role }) =>
  api.post<ApiResponse<AuthResponse>>('/auth/oauth2/complete', data);

export const getMe = () =>
  api.get<ApiResponse<User>>('/users/me');
