import apiClient from './client';
import type { Property, CreatePropertyRequest, UpdatePropertyRequest } from '../types';

export const propertiesApi = {
  getAll: async (): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/api/properties');
    return response.data;
  },

  getById: async (id: number): Promise<Property> => {
    const response = await apiClient.get<Property>(`/api/properties/${id}`);
    return response.data;
  },

  create: async (propertyData: CreatePropertyRequest): Promise<Property> => {
    const response = await apiClient.post<Property>('/api/properties', propertyData);
    return response.data;
  },

  update: async (id: number, propertyData: UpdatePropertyRequest): Promise<Property> => {
    const response = await apiClient.put<Property>(`/api/properties/${id}`, propertyData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/properties/${id}`);
  },
};
