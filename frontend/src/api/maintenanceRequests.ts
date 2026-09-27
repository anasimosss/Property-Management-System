import apiClient from './client';
import type {
  MaintenanceRequest,
  CreateMaintenanceRequestRequest,
  UpdateMaintenanceRequestRequest,
} from '../types';

export const maintenanceRequestsApi = {
  getAll: async (): Promise<MaintenanceRequest[]> => {
    const response = await apiClient.get<MaintenanceRequest[]>(
      '/api/maintenanceRequests'
    );

    return response.data;
  },

  getById: async (id: number): Promise<MaintenanceRequest> => {
    const response = await apiClient.get<MaintenanceRequest>(
      '/api/maintenanceRequests/' + id
    );

    return response.data;
  },

  getByProperty: async (
    propertyId: number
  ): Promise<MaintenanceRequest[]> => {
    const response = await apiClient.get<MaintenanceRequest[]>(
      '/api/maintenanceRequests/by-property/' + propertyId
    );

    return response.data;
  },

  getByUnit: async (
    unitId: number
  ): Promise<MaintenanceRequest[]> => {
    const response = await apiClient.get<MaintenanceRequest[]>(
      '/api/maintenanceRequests/by-unit/' + unitId
    );

    return response.data;
  },

  create: async (
    requestData: CreateMaintenanceRequestRequest
  ): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>(
      '/api/maintenanceRequests',
      requestData
    );

    return response.data;
  },

  update: async (
  id: number,
  requestData: UpdateMaintenanceRequestRequest
): Promise<MaintenanceRequest> => {
  const response = await apiClient.put<MaintenanceRequest>(
    '/api/maintenanceRequests/' + id,
    requestData
  );

  return response.data;
},

delete: async (id: number): Promise<void> => {
  await apiClient.delete('/api/maintenanceRequests/' + id);
},
};