import apiClient from './client';
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '../types';

export const tenantsApi = {
  getAll: async (): Promise<Tenant[]> => {
    const response = await apiClient.get<Tenant[]>('/api/tenants');
    return response.data;
  },

  getById: async (id: number): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(
      `/api/tenants/${id}`
    );

    return response.data;
  },

  create: async (
    tenantData: CreateTenantRequest
  ): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>(
      '/api/tenants',
      tenantData
    );

    return response.data;
  },

    update: async (
    id: number,
    tenantData: UpdateTenantRequest
  ): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(
      `/api/tenants/${id}`,
      tenantData
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tenants/${id}`);
  },
};