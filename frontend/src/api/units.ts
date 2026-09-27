import apiClient from './client';
import type {
  Unit,
  CreateUnitRequest,
  UpdateUnitRequest,
} from '../types';

export interface AvailableUnit {
  id: number;
  buildingId: number;
  buildingName: string;
  propertyId: number;
  propertyName: string;
  unitNumber: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number | null;
  targetRent: number;
}

export const unitsApi = {
  getAll: async (): Promise<Unit[]> => {
    const response = await apiClient.get<Unit[]>('/api/units');

    return response.data;
  },

  getMy: async (): Promise<Unit[]> => {
    const response = await apiClient.get<Unit[]>('/api/units/my');

    return response.data;
  },

  getAvailable: async (): Promise<AvailableUnit[]> => {
    const response = await apiClient.get<AvailableUnit[]>(
      '/api/units/available'
    );

    return response.data;
  },

  getByBuilding: async (buildingId: number): Promise<Unit[]> => {
    const response = await apiClient.get<Unit[]>(
      `/api/units/by-building/${buildingId}`
    );

    return response.data;
  },

  getById: async (id: number): Promise<Unit> => {
    const response = await apiClient.get<Unit>(
      `/api/units/${id}`
    );

    return response.data;
  },

  create: async (
    unitData: CreateUnitRequest
  ): Promise<Unit> => {
    const response = await apiClient.post<Unit>(
      '/api/units',
      unitData
    );

    return response.data;
  },

  update: async (
    id: number,
    unitData: UpdateUnitRequest
  ): Promise<Unit> => {
    const response = await apiClient.put<Unit>(
      `/api/units/${id}`,
      unitData
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/units/${id}`);
  },
};