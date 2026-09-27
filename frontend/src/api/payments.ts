import apiClient from './client';
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '../types';

export interface RentPaymentPeriodResponse {
  dueDate: string;
  rentAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface InitializeChapaPaymentRequest {
  leaseId: number;
  amount: number;
  dueDate: string;
  paymentType: string;
  rentPeriods?: RentPaymentPeriodRequest[];
}

export interface RentPaymentPeriodRequest {
  dueDate: string;
  amount: number;
}

export interface InitializeChapaPaymentResponse {
  paymentId: number;
  txRef: string;
  checkoutUrl: string;
}

export interface MyRentResponse {
  leaseId: number;
  unitNumber: string;
  rentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: string;
  paymentId: number | null;
}

export const paymentsApi = {

  getMyRent: async (): Promise<MyRentResponse> => {
    const response = await apiClient.get<MyRentResponse>(
      '/api/payments/my-rent'
    );

    return response.data;
    
  },

  

  getRentPaymentPeriods: async (
    months: number = 3
  ): Promise<RentPaymentPeriodResponse[]> => {
    const response =
      await apiClient.get<RentPaymentPeriodResponse[]>(
        `/api/payments/rent-periods?months=${months}`
      );

    return response.data;
  },

  getAll: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(
      '/api/payments'
    );

    return response.data;
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await apiClient.get<Payment>(
      `/api/payments/${id}`
    );

    return response.data;
  },

  getByLease: async (leaseId: number): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(
      `/api/payments/by-lease/${leaseId}`
    );

    return response.data;
  },

  create: async (
    paymentData: CreatePaymentRequest
  ): Promise<Payment> => {
    const response = await apiClient.post<Payment>(
      '/api/payments',
      paymentData
    );

    return response.data;
  },

  initializeChapaPayment: async (
    paymentData: InitializeChapaPaymentRequest
  ): Promise<InitializeChapaPaymentResponse> => {
    const response =
      await apiClient.post<InitializeChapaPaymentResponse>(
        '/api/payments/chapa/initialize',
        paymentData
      );

    const data = response.data;

    // Save the Chapa transaction reference so the
    // payment success page can verify the payment
    // after Chapa redirects the user back.
    sessionStorage.setItem(
      'chapa_tx_ref',
      data.txRef
    );

    sessionStorage.setItem(
      'chapa_payment_id',
      String(data.paymentId)
    );

    return data;
  },

  update: async (
    id: number,
    paymentData: UpdatePaymentRequest
  ): Promise<Payment> => {
    const response = await apiClient.put<Payment>(
      `/api/payments/${id}`,
      paymentData
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete('/api/payments/' + id);
  },
};
