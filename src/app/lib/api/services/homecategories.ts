/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for Homecategory




export interface CreateHomecategoryRequest {
  name: string;
  description?: string;
  priority?: number;
  categoryIds?: string[];
  productIds?: string[];
}


export interface UpdateHomecategoryRequest {
  name?: string;
  description?: string;
  priority?: number;
  categoryIds?: string[];
  productIds?: string[];
}

export const homecategoriesService = {
  // Create Homecategory
  create: async (data: CreateHomecategoryRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HOMECATEGORY_CREATE, data);
    return response.data;
  },

  // Get all Homecategories
  list: async (): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.HOMECATEGORY_LIST);
    return response.data;
  },

  // Get Homecategory by id
  get: async (id: string): Promise<any> => {
    const endpoint = API_ENDPOINTS.HOMECATEGORY_GET.replace('{id}', id);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Update Homecategory by id
  update: async (id: string, data: UpdateHomecategoryRequest): Promise<any> => {
    const endpoint = API_ENDPOINTS.HOMECATEGORY_UPDATE.replace('{id}', id);
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },

  // Delete Homecategory by id
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.HOMECATEGORY_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};

export default homecategoriesService;
