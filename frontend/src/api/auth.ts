import api from './axios';
import type { ApiResponse, AuthResponse, Role } from '../types';

export const register = (email: string, password: string, role: Role) =>
  api.post<ApiResponse<AuthResponse>>('/auth/register', { email, password, role });

export const login = (email: string, password: string) =>
  api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });

export const completeOAuth2 = (tempToken: string, role: Role) =>
  api.post<ApiResponse<AuthResponse>>('/auth/oauth2/complete', { tempToken, role });
