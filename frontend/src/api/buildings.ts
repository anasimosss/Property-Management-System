import apiClient from './client';
import type {
  Building,
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from '../types';

export const buildingsApi = {
  getByProperty: async (propertyId: number): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>(
      `/api/buildings/by-property/${propertyId}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<Building> => {
    const response = await apiClient.get<Building>(
      `/api/buildings/${id}`
    );
    return response.data;
  },

  create: async (
    buildingData: CreateBuildingRequest
  ): Promise<Building> => {
    const response = await apiClient.post<Building>(
      '/api/buildings',
      buildingData
    );
    return response.data;
  },

  update: async (
    id: number,
    buildingData: UpdateBuildingRequest
  ): Promise<Building> => {
    const response = await apiClient.put<Building>(
      `/api/buildings/${id}`,
      buildingData
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/buildings/${id}`);
  },
};