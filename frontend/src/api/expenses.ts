import apiClient from './client';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../types';

export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>('/api/expenses');

    return response.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await apiClient.get<Expense>(
      `/api/expenses/${id}`
    );

    return response.data;
  },

  getByProperty: async (propertyId: number): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>(
      `/api/expenses/by-property/${propertyId}`
    );

    return response.data;
  },

  create: async (
    expenseData: CreateExpenseRequest
  ): Promise<Expense> => {
    const response = await apiClient.post<Expense>(
      '/api/expenses',
      expenseData
    );

    return response.data;
  },

  update: async (
    id: number,
    expenseData: UpdateExpenseRequest
  ): Promise<Expense> => {
    const response = await apiClient.put<Expense>(
      `/api/expenses/${id}`,
      expenseData
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
  await apiClient.delete('/api/expenses/' + id);
},
};