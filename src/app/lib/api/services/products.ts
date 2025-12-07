/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../client"
import {
  Product,
  ProductListResponse,
  ProductSearchResponse,
  ProductFilters,
} from "../types"
import { API_ENDPOINTS } from "../config"

export const productsService = {
  /**
   * Get all products with optional filters (lightweight version for admin list)
   * Only fetches essential fields for better performance
   */
  getAllLite: async (filters?: ProductFilters, page = 1, limit = 20): Promise<ProductListResponse> => {
    const offset = (page - 1) * limit;
    const response = await apiClient.get<ProductListResponse>(API_ENDPOINTS.PRODUCTS_GET, {
      params: {
        offset,
        limit,
        fields: 'id,name,sku,categoryId,price,stockQuantity,isActive,lowStockAlert,images,productType,totalStock',
        ...filters,
      },
    })
    return response.data
  },

  /**
   * Get all products with optional filters
   */
  getAll: async (filters?: ProductFilters, page = 1, limit = 20): Promise<ProductListResponse> => {
    const offset = (page - 1) * limit;
    const response = await apiClient.get<ProductListResponse>(API_ENDPOINTS.PRODUCTS_GET, {
      params: {
        offset,
        limit,
        ...filters,
      },
    })
    return response.data
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 10): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS_FEATURED, {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get new products
   */
  getNew: async (limit = 10): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS_NEW, {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get hot products
   */
  getHot: async (limit = 10): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS_HOT, {
      params: { limit },
    })
    return response.data
  },

  /**
   * Search products
   */
  search: async (query: string): Promise<ProductSearchResponse> => {
    const response = await apiClient.get<ProductSearchResponse>(API_ENDPOINTS.PRODUCTS_SEARCH, {
      params: { q: query },
    })
    return response.data
  },

  /**
   * Get product by slug
   */
  getBySlug: async (slug: string): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_SLUG.replace("{slug}", slug)
    const response = await apiClient.get<Product>(endpoint)
    return response.data
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_GET_ONE.replace("{id}", id)
    const response = await apiClient.get<Product>(endpoint)
    return response.data
  },

  /**
   * Get specific variant price
   */
  getVariantPrice: async (productId: string, params: { regionId?: string; colorId?: string; storageId?: string }) => {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS_GET}/${productId}/variant-price`, {
      params,
    });
    return response.data;
  },

  /**
   * Update product (Admin/Management only)
   * Supports file uploads (image, gallery, etc.) using FormData
   */
  update: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE.replace("{id}", id)

    // Check if data contains files (File objects)
    const hasFiles = (obj: any): boolean => {
      if (obj instanceof File) return true
      if (Array.isArray(obj)) return obj.some(item => item instanceof File)
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).some(val => hasFiles(val))
      }
      return false
    }

    // If data contains files, use FormData; otherwise use JSON
    if (hasFiles(data)) {
      const formData = new FormData();

      // Status
      if (typeof data.status !== 'undefined') formData.append('status', String(data.status));
      // Basic fields
      if (data.name) formData.append('name', data.name);
      if (data.slug) formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      if (data.categoryId) formData.append('categoryId', data.categoryId);
      if (data.brandId) formData.append('brandId', data.brandId);
      if (data.productCode) formData.append('productCode', data.productCode);
      if (data.sku) formData.append('sku', data.sku);
      if (typeof data.averageRating !== 'undefined') formData.append('averageRating', String(data.averageRating));
      if (typeof data.rewardsPoints !== 'undefined') formData.append('rewardsPoints', String(data.rewardsPoints));
      if (typeof data.price !== 'undefined') formData.append('price', String(data.price));
      if (typeof data.discountPrice !== 'undefined') formData.append('discountPrice', String(data.discountPrice));
      if (typeof data.discountPercent !== 'undefined') formData.append('discountPercent', String(data.discountPercent));
      if (typeof data.emiAvailable !== 'undefined') formData.append('emiAvailable', String(data.emiAvailable));
      if (typeof data.stock !== 'undefined') formData.append('stock', String(data.stock));
      if (typeof data.lowStock !== 'undefined') formData.append('lowStock', String(data.lowStock));
      if (typeof data.trackStock !== 'undefined') formData.append('trackStock', String(data.trackStock));
      if (typeof data.allowBackorder !== 'undefined') formData.append('allowBackorder', String(data.allowBackorder));
      if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
      if (data.metaDescription) formData.append('metaDescription', data.metaDescription);
      if (data.metaKeywords) {
        if (Array.isArray(data.metaKeywords)) {
          formData.append('metaKeywords', JSON.stringify(data.metaKeywords));
        } else {
          formData.append('metaKeywords', data.metaKeywords);
        }
      }
      if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
      if (data.seoDescription) formData.append('seoDescription', data.seoDescription);
      if (data.seoKeywords) {
        if (Array.isArray(data.seoKeywords)) {
          formData.append('seoKeywords', JSON.stringify(data.seoKeywords));
        } else {
          formData.append('seoKeywords', data.seoKeywords);
        }
      }
      if (data.model) formData.append('model', data.model);
      if (typeof data.minBookingPrice !== 'undefined' && data.minBookingPrice !== null) formData.append('minBookingPrice', String(data.minBookingPrice));
      if (data.highlights) {
        if (Array.isArray(data.highlights)) {
          formData.append('highlights', JSON.stringify(data.highlights));
        } else {
          formData.append('highlights', data.highlights);
        }
      }

      // Main image (can be File, string URL, or array)
      if (Array.isArray(data.image)) {
        data.image.forEach((img: any) => {
          if (img instanceof File) {
            formData.append('image', img);
          } else if (typeof img === 'string' && img) {
            formData.append('image', img);
          }
        });
      } else if (data.image instanceof File) {
        formData.append('image', data.image);
      } else if (typeof data.image === 'string' && data.image) {
        formData.append('image', data.image);
      }

      // Gallery images
      if (Array.isArray(data.gallery)) {
        data.gallery.forEach((img: any) => {
          if (img instanceof File) {
            formData.append('gallery', img);
          } else if (typeof img === 'string' && img) {
            formData.append('gallery', img);
          }
        });
      }

      // Status flags
      if (typeof data.isActive !== 'undefined') formData.append('isActive', String(data.isActive));
      if (typeof data.isOnline !== 'undefined') formData.append('isOnline', String(data.isOnline));
      if (typeof data.isPos !== 'undefined') formData.append('isPos', String(data.isPos));
      if (typeof data.isPreOrder !== 'undefined') formData.append('isPreOrder', String(data.isPreOrder));
      if (typeof data.isOfficial !== 'undefined') formData.append('isOfficial', String(data.isOfficial));
      if (typeof data.freeShipping !== 'undefined') formData.append('freeShipping', String(data.freeShipping));
      if (typeof data.isEmi !== 'undefined') formData.append('isEmi', String(data.isEmi));
      
      // Base price
      if (typeof data.basePrice !== 'undefined') formData.append('basePrice', String(data.basePrice));
      if (typeof data.baseComparePrice !== 'undefined') formData.append('baseComparePrice', String(data.baseComparePrice));
      
      // Regions
      if (data.regions) formData.append('regions', typeof data.regions === 'string' ? data.regions : JSON.stringify(data.regions));
      // Colors
      if (data.colors) formData.append('colors', typeof data.colors === 'string' ? data.colors : JSON.stringify(data.colors));
      // Networks
      if (data.networks) formData.append('networks', typeof data.networks === 'string' ? data.networks : JSON.stringify(data.networks));
      // Sizes
      if (data.sizes) formData.append('sizes', typeof data.sizes === 'string' ? data.sizes : JSON.stringify(data.sizes));
      // Plugs
      if (data.plugs) formData.append('plugs', typeof data.plugs === 'string' ? data.plugs : JSON.stringify(data.plugs));
      // Variants
      if (data.variants) formData.append('variants', typeof data.variants === 'string' ? data.variants : JSON.stringify(data.variants));
      // Specifications
      if (data.specifications) formData.append('specifications', typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications));

      const response = await apiClient.patch<Product>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } else {
      const response = await apiClient.patch<Product>(endpoint, data)
      return response.data
    }
  },

  /**
   * Delete product (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_DELETE.replace("{id}", id)
    await apiClient.delete(endpoint)
  },

  /**
   * Create basic product with variants, pricing, images, and specs
   */
  createBasic: async (data: any): Promise<Product> => {
    const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS_CREATE_BASIC, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Create network-based product
   */
  createNetwork: async (data: any): Promise<Product> => {
    const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS_CREATE_NETWORK, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Create region-based product
   */
  createRegion: async (data: any): Promise<Product> => {
    const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS_CREATE_REGION, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update basic product
   */
  updateBasic: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE_BASIC.replace("{id}", id);
    const response = await apiClient.patch<Product>(endpoint, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update network product
   */
  updateNetwork: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE_NETWORK.replace("{id}", id);
    const response = await apiClient.patch<Product>(endpoint, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update region product
   */
  updateRegion: async (id: string, data: any): Promise<Product> => {
    const endpoint = API_ENDPOINTS.PRODUCTS_UPDATE_REGION.replace("{id}", id);
    const response = await apiClient.patch<Product>(endpoint, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
}

export default productsService
