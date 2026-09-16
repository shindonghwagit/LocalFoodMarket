import api from './axios';
import type { ApiResponse } from '../types';

export interface PaymentPreparation {
  paymentId: number;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'DONE' | 'FAILED';
  clientKey: string;
  customerKey: string;
}

export interface PaymentConfirmation {
  paymentId: number;
  orderId: string;
  amount: number;
  status: 'DONE';
  pointBalance: number;
}

export const preparePayment = (amount: number) =>
  api.post<ApiResponse<PaymentPreparation>>('/payments/prepare', { amount });

export const confirmPayment = (paymentKey: string, orderId: string, amount: number) =>
  api.post<ApiResponse<PaymentConfirmation>>('/payments/confirm', { paymentKey, orderId, amount });
