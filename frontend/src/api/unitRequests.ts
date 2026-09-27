import apiClient from './client';

export interface CreateUnitRequestRequest {
  unitId: number;
  message?: string | null;
}

export interface UnitRequestResponse {
  id: number;
  tenantId: number;
  tenantName: string;
  tenantEmail: string;
  unitId: number;
  unitNumber: string;
  buildingName: string;
  targetRent: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  message?: string | null;
  rejectionReason?: string | null;
  createdAtUtc: string;
  reviewedAtUtc?: string | null;
  reviewedByName?: string | null;
}

export interface RejectUnitRequestRequest {
  rejectionReason?: string | null;
}

export const unitRequestsApi = {
  create: async (
    request: CreateUnitRequestRequest
  ): Promise<UnitRequestResponse> => {
    const response = await apiClient.post<UnitRequestResponse>(
      '/api/UnitRequests',
      request
    );

    return response.data;
  },

  getMy: async (): Promise<UnitRequestResponse[]> => {
    const response = await apiClient.get<UnitRequestResponse[]>(
      '/api/UnitRequests/my'
    );

    return response.data;
  },

  getAll: async (): Promise<UnitRequestResponse[]> => {
    const response = await apiClient.get<UnitRequestResponse[]>(
      '/api/UnitRequests'
    );

    return response.data;
  },

  approve: async (
    id: number
  ): Promise<UnitRequestResponse> => {
    const response = await apiClient.put<UnitRequestResponse>(
      `/api/UnitRequests/${id}/approve`
    );

    return response.data;
  },

  reject: async (
    id: number,
    request: RejectUnitRequestRequest
  ): Promise<UnitRequestResponse> => {
    const response = await apiClient.put<UnitRequestResponse>(
      `/api/UnitRequests/${id}/reject`,
      request
    );

    return response.data;
  },
};