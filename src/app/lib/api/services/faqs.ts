import { apiClient } from "../client"
import { FAQ, CreateFAQRequest, UpdateFAQRequest } from "../types"
import { API_ENDPOINTS } from "../config"

export const faqsService = {
  /**
   * Create FAQ (Admin/Management only)
   */
  create: async (data: CreateFAQRequest): Promise<FAQ> => {
    const response = await apiClient.post<FAQ>(API_ENDPOINTS.FAQS_CREATE, data)
    return response.data
  },

  /**
   * Get all global FAQs
   */
  getAll: async (): Promise<{ data: FAQ[]; pagination: unknown }> => {
      const response = await apiClient.get<{ data: FAQ[]; pagination: unknown }>(API_ENDPOINTS.FAQS_GET)
      return response.data;
    },

  /**
   * Get FAQ by ID
   */
  getById: async (id: string): Promise<FAQ> => {
    const endpoint = API_ENDPOINTS.FAQS_GET_ONE?.replace("{id}", id) || `/faqs/${id}`
    const response = await apiClient.get<FAQ>(endpoint)
    return response.data
  },

  /**
   * Get FAQs by category
   */
  getByCategory: async (category: string, page = 1, limit = 20): Promise<{ data: FAQ[]; pagination: unknown }> => {
    try {
      const response = await apiClient.get<{ data: FAQ[]; pagination: unknown }>(API_ENDPOINTS.FAQS_GET_BY_CATEGORY || "/faqs/category", {
        params: { category, page, limit },
      })
      return response.data
    } catch (error) {
      // Return empty FAQ list if endpoint fails - UI will show default FAQs
      return { data: [], pagination: {} }
    }
  },

  /**
   * Get FAQs by product
   */
  getByProduct: async (productId: string): Promise<FAQ[]> => {
    const response = await apiClient.get<FAQ[]>(API_ENDPOINTS.FAQS_GET_BY_PRODUCT || "/faqs/product", {
      params: { productId },
    })
    return response.data
  },

  /**
   * Get all published FAQs
   */
  getPublished: async (): Promise<FAQ[]> => {
    const response = await apiClient.get<FAQ[]>(API_ENDPOINTS.FAQS_GET_PUBLISHED || "/faqs/published")
    return response.data
  },

  /**
   * Update FAQ (Admin/Management only)
   */
  update: async (id: string, data: UpdateFAQRequest): Promise<FAQ> => {
    const endpoint = API_ENDPOINTS.FAQS_UPDATE?.replace("{id}", id) || `/faqs/${id}`
    const response = await apiClient.patch<FAQ>(endpoint, data)
    return response.data
  },

  /**
   * Delete FAQ (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.FAQS_DELETE?.replace("{id}", id) || `/faqs/${id}`
    await apiClient.delete(endpoint)
  },

  /**
   * Search FAQs
   */
  search: async (query: string, page = 1, limit = 20): Promise<{ data: FAQ[]; pagination: unknown }> => {
    const response = await apiClient.get<{ data: FAQ[]; pagination: unknown }>(API_ENDPOINTS.FAQS_SEARCH || "/faqs/search", {
      params: { query, page, limit },
    })
    return response.data
  },
}

export default faqsService
