/* eslint-disable @typescript-eslint/no-explicit-any */
import {apiClient} from '../client';
import {
  Product,
  ProductListResponse,
  ProductSearchResponse,
  ProductFilters,
} from '../types';
import {API_ENDPOINTS} from '../config';

export const productsService = {
  /**
   * Get all products with optional filters (lightweight version for admin list)
   * Only fetches essential fields for better performance
   */
  getAllLite: async (
    filters?: ProductFilters,
    page = 1,
    limit = 20,
  ): Promise<ProductListResponse> => {
    const offset = (page - 1) * limit;
    const response = await apiClient.get<ProductListResponse>(
      API_ENDPOINTS.PRODUCTS_GET,
      {
        params: {
          offset,
          limit,
          fields:
            'id,name,sku,categoryIds,price,stockQuantity,isActive,lowStockAlert,images,productType,totalStock,slug,productCode',
          ...filters,
        },
      },
    );
    return response.data;
  },

  /**
   * Get all products with optional filters
   */
  getAll: async (
    filters?: ProductFilters,
    page = 1,
    limit = 20,
  ): Promise<ProductListResponse> => {
    const offset = (page - 1) * limit;
    const response = await apiClient.get<ProductListResponse>(
      API_ENDPOINTS.PRODUCTS_GET,
      {
        params: {
          offset,
          limit,
          includeRelations: 'true', // Include nested regions, networks, directColors
          ...filters,
        },
      },
    );
    return response.data;
  },

  /**
   * Search products
   */
  search: async (query: string): Promise<ProductSearchResponse> => {
    const response = await apiClient.get<ProductSearchResponse>(
      API_ENDPOINTS.PRODUCTS_SEARCH,
      {
        params: {q: query},
      },
    );
    return response.data;
  },

  /**
   * Get product by slug
   */
  getBySlug: async (slug: string): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_SLUG.replace('{slug}', slug);
    const response = await apiClient.get<Product>(endpoint, {
      params: {
        relations: 'true',
        networks: 'true',
        regions: 'true',
        colors: 'true',
        storages: 'true',
      },
    });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_GET_ONE.replace('{id}', id);
    const response = await apiClient.get<Product>(endpoint);
    return response.data;
  },

  /**
   * Get specific variant price
   */
  getVariantPrice: async (
    productId: string,
    params: {regionId?: string; colorId?: string; storageId?: string},
  ) => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.PRODUCTS_GET}/${productId}/variant-price`,
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * Delete product (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },

  /**
   * Create basic product with variants, pricing, images, and specs
   */
  createBasic: async (data: any): Promise<Product> => {
    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS_CREATE_BASIC,
      data,
      {
        headers: {'Content-Type': 'multipart/form-data'},
      },
    );
    return response.data;
  },

  /**
   * Create network-based product
   */
  createNetwork: async (data: any): Promise<Product> => {
    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS_CREATE_NETWORK,
      data,
      {
        headers: {'Content-Type': 'multipart/form-data'},
      },
    );
    return response.data;
  },

  /**
   * Create region-based product
   */
  createRegion: async (data: any): Promise<Product> => {
    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS_CREATE_REGION,
      data,
      {
        headers: {'Content-Type': 'multipart/form-data'},
      },
    );
    return response.data;
  },

  /**
   * Update basic product
   */
  updateBasic: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE_BASIC.replace('{id}', id);
    const response = await apiClient.patch<Product>(endpoint, data, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
  },

  /**
   * Update network product
   */
  updateNetwork: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE_NETWORK.replace('{id}', id);
    const response = await apiClient.patch<Product>(endpoint, data, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
  },

  /**
   * Update region product
   */
  updateRegion: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE_REGION.replace('{id}', id);
    const response = await apiClient.patch<Product>(endpoint, data, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
  },
};

export default productsService;
