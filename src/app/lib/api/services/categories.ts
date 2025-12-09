/* eslint-disable @typescript-eslint/no-explicit-any */
// Helper to normalize API category objects to the app's Category type
interface ApiCategory {
  id?: string | number;
  name?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  parentId?: string;
  productCount?: number;
  banner?: string;
  priority?: string | number;
  children?: ApiCategory[];
}

function normalizeCategory(raw: ApiCategory): Category {
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: raw.slug ? String(raw.slug) : "",
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
    ...(raw.image && { image: raw.image }),
    ...(raw.parentId && { parentId: raw.parentId }),
    ...(raw.productCount && { productCount: raw.productCount }),
    ...(raw.banner && { banner: raw.banner }),
    ...(raw.priority !== undefined && { priority: Number(raw.priority) }),
    ...(raw.children && Array.isArray(raw.children)
      ? { children: raw.children.map(normalizeCategory) }
      : {}),
  };
}
import { apiClient } from '../client';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryProductsResponse,
  ProductFilters,
  Subcategory,
} from '../types';
import { API_ENDPOINTS } from '../config';

type CreateCategoryWithFile = Omit<CreateCategoryRequest, 'banner'> & {
  banner?: File | string;
};

type UpdateCategoryWithFile = Omit<UpdateCategoryRequest, 'banner'> & {
  banner?: File | string;
};

export const categoriesService = {
    /**
     * Get products in category by slug (no pagination/filter)
     */
    getProductsBySlug: async (slug: string): Promise<any[]> => {
      const endpoint = API_ENDPOINTS.CATEGORIES_PRODUCTS.replace('{slug}', slug);
      const response = await apiClient.get(endpoint);
      // If response.data is an array, return it; if it's an object with data, return data
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  /**
   * ✅ Create Category (Admin only) — Brand style
   */
  create: async (data: CreateCategoryWithFile): Promise<Category> => {
    const formData = new FormData();

    formData.append('name', data.name);
    if (data.slug !== undefined) {
      formData.append('slug', data.slug);
    }

    if (data.priority !== undefined) {
      formData.append('priority', String(data.priority));
    }

    if (data.banner instanceof File) {
      formData.append('banner', data.banner); // ✅ REAL FILE
    } else if (typeof data.banner === 'string' && data.banner) {
      formData.append('banner', data.banner); // ✅ OLD IMAGE URL
    }

    const response = await apiClient.post<Category>(
      API_ENDPOINTS.CATEGORIES_CREATE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return response.data;
  },

  /**
   * ✅ Get all categories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(
      API_ENDPOINTS.CATEGORIES_GET,
    );
    const data = response.data;
    return Array.isArray(data) ? data.map(normalizeCategory) : [];
  },

  /**
   * ✅ Get featured categories
   */
  getFeatured: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(
      API_ENDPOINTS.CATEGORIES_FEATURED,
    );
    const data = response.data;
    return Array.isArray(data) ? data.map(normalizeCategory) : [];
  },

  /**
   * ✅ Get category by slug
   */
  getBySlug: async (slug: string): Promise<Category> => {
    const endpoint = API_ENDPOINTS.CATEGORIES_SLUG.replace('{slug}', slug);
    const response = await apiClient.get<Category>(endpoint);
    return normalizeCategory(response.data);
  },


  /**
   * ✅ Get products in category
   */
  getProducts: async (
    slug: string,
    filters?: ProductFilters,
    page = 1,
    limit = 20,
  ): Promise<CategoryProductsResponse> => {
    const endpoint = API_ENDPOINTS.CATEGORIES_PRODUCTS.replace('{slug}', slug);
    const response = await apiClient.get<CategoryProductsResponse>(endpoint, {
      params: {
        page,
        limit,
        includeRelations: 'true',
        ...filters,
      },
    });
    return response.data;
  },

  /**
   * ✅ Update Category (Admin only) — Brand style
   */
  update: async (
    id: string,
    data: UpdateCategoryWithFile,
  ): Promise<Category> => {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.slug) formData.append('slug', data.slug);
    if (data.priority !== undefined)
      formData.append('priority', String(data.priority));

    if (data.banner instanceof File) {
      formData.append('banner', data.banner);
    } else if (typeof data.banner === 'string' && data.banner) {
      formData.append('banner', data.banner);
    }

    const endpoint = API_ENDPOINTS.CATEGORIES_UPDATE.replace('{id}', id);

    const response = await apiClient.patch<Category>(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  /**
   * ✅ Delete category
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.CATEGORIES_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },

  /**
   * ✅ Create Subcategory
   */
  createSubcategory: async (
    categoryId: string,
    data: { name: string; categoryId?: string },
  ): Promise<Subcategory> => {
    const endpoint = API_ENDPOINTS.SUBCATEGORIES_CREATE.replace(
      '{categoryId}',
      categoryId,
    );
    const response = await apiClient.post<Subcategory>(endpoint, data);
    return response.data;
  },

  /**
   * ✅ Get All Subcategories
   */
  getSubcategories: async (categoryId: string): Promise<Subcategory[]> => {
    const endpoint = API_ENDPOINTS.SUBCATEGORIES_GET_ALL.replace(
      '{categoryId}',
      categoryId,
    );
    const response = await apiClient.get<Subcategory[]>(endpoint);
    return response.data;
  },

  /**
   * ✅ Update Subcategory
   */
  updateSubcategory: async (
    id: string,
    data: { name?: string; categoryId?: string },
  ): Promise<Subcategory> => {
    const endpoint = API_ENDPOINTS.SUBCATEGORIES_UPDATE.replace('{id}', id);
    const response = await apiClient.patch<Subcategory>(endpoint, data);
    return response.data;
  },

  // getById
  getById: async (id: string): Promise<Category> => {
    const endpoint = API_ENDPOINTS.CATEGORIES_GET_ONE.replace('{id}', id);
    const response = await apiClient.get<Category>(endpoint);
    return normalizeCategory(response.data);
  },

  /**
   * ✅ Get Subcategory by ID
   */
  getSubcategoryById: async (id: string): Promise<Subcategory> => {
    const endpoint = API_ENDPOINTS.SUBCATEGORIES_GET_ONE.replace('{id}', id);
    const response = await apiClient.get<Subcategory>(endpoint);
    return response.data;
  },
};

export default categoriesService;
