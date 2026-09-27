import apiClient from './client';
import type {
  Lease,
  CreateLeaseRequest,
  UpdateLeaseRequest,
} from '../types';

export const leasesApi = {
  getAll: async (): Promise<Lease[]> => {
    const response = await apiClient.get<Lease[]>('/api/leases');

    return response.data;
  },

  getById: async (id: number): Promise<Lease> => {
    const response = await apiClient.get<Lease>(
      `/api/leases/${id}`
    );

    return response.data;
  },

  getByUnit: async (unitId: number): Promise<Lease[]> => {
    const response = await apiClient.get<Lease[]>(
      `/api/leases/by-unit/${unitId}`
    );

    return response.data;
  },

  getByTenant: async (tenantId: number): Promise<Lease[]> => {
    const response = await apiClient.get<Lease[]>(
      `/api/leases/by-tenant/${tenantId}`
    );

    return response.data;
  },

  create: async (
    leaseData: CreateLeaseRequest
  ): Promise<Lease> => {
    const response = await apiClient.post<Lease>(
      '/api/leases',
      leaseData
    );

    return response.data;
  },

  update: async (
    id: number,
    leaseData: UpdateLeaseRequest
  ): Promise<Lease> => {
    const response = await apiClient.put<Lease>(
      `/api/leases/${id}`,
      leaseData
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/leases/${id}`);
  },
};