// Enhanced payment API
import { axiosInstance } from '@/shared/api/axios-instance';

export const createInvoice = async (bookId: string): Promise<string> => {
  const response = await axiosInstance.post('/api/payment/create-invoice', {
    bookId,
    // In a real app, we'd also pass userId from auth context
  });
  return response.data.invoiceLink;
};

export const createYookassaPayment = async (bookId: string) => {
  const response = await axiosInstance.post('/api/payment/create-yookassa', { bookId });
  return response.data;
};

export const createUsdtTonPayment = async (bookId: string) => {
  const response = await axiosInstance.post('/api/payment/create-usdt-ton', { bookId });
  return response.data;
};

export const createUsdtTrc20Payment = async (bookId: string) => {
  const response = await axiosInstance.post('/api/payment/create-usdt-trc20', { bookId });
  return response.data;
};

export const verifyUsdtPayment = async (address: string, network: string, bookId: string, userId: string) => {
  const response = await axiosInstance.post('/api/payment/verify-usdt', {
    address,
    network,
    bookId,
    userId
  });
  return response.data;
};

export const verifyPayment = async (transactionId: string): Promise<boolean> => {
  const response = await axiosInstance.post('/api/payment/verify', { transactionId });
  return response.data.verified;
};

// For handling payment webhook responses (frontend doesn't typically handle webhooks directly,
// but we'll define types for completeness)
export interface PaymentWebhookData {
  update_type: string;
  invoice_payload?: string;
  telegram_payment_charge_id?: string;
  total_amount?: number;
}