import api from './axios';
import type { ApiResponse, AuthResponse, Role } from '../types';

export const register = (data: { email: string; password: string; role: Role }) =>
  api.post<ApiResponse<AuthResponse>>('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse<AuthResponse>>('/auth/login', data);

export const completeOAuth2 = (data: { tempToken: string; role: Role }) =>
  api.post<ApiResponse<AuthResponse>>('/auth/oauth2/complete', data);
