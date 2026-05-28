import api from './axios';
import type { ApiResponse } from '../types';

export interface AddressResult {
  addressName: string;
  x: string;
  y: string;
}

export const searchAddress = (query: string) =>
  api.get<ApiResponse<AddressResult[]>>('/address/search', { params: { query } });
