import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface Herobanner {
    id: string
    img: string
    createdAt: string
    updatedAt: string
}

export interface CreateHerobannerRequest {
    img: File | string
}

export interface UpdateHerobannerRequest {
    img?: File | string
}

export const herobannerService = {
    /**
     * Create a new hero banner (with image upload)
     */
    create: async (data: CreateHerobannerRequest): Promise<Herobanner> => {
        const formData = new FormData()
        if (data.img instanceof File) {
            formData.append("img", data.img)
        } else if (typeof data.img === "string") {
            formData.append("img", data.img)
        }
        const response = await apiClient.post<Herobanner>(API_ENDPOINTS.HEROBANNER_CREATE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    /**
     * Get all hero banners
     */
    findAll: async (): Promise<Herobanner[]> => {
        const response = await apiClient.get<Herobanner[]>(API_ENDPOINTS.HEROBANNER_GET_ALL)
        return response.data
    },

    /**
     * Get a single hero banner by id
     */
    findOne: async (id: string): Promise<Herobanner> => {
        const endpoint = API_ENDPOINTS.HEROBANNER_GET_ONE.replace("{id}", id)
        const response = await apiClient.get<Herobanner>(endpoint)
        return response.data
    },

    /**
     * Update a hero banner (with image upload)
     */
    update: async (id: string, data: UpdateHerobannerRequest): Promise<Herobanner> => {
        const formData = new FormData()
        if (data.img instanceof File) {
            formData.append("img", data.img)
        } else if (typeof data.img === "string" && data.img) {
            formData.append("img", data.img)
        }
        const endpoint = API_ENDPOINTS.HEROBANNER_UPDATE.replace("{id}", id)
        const response = await apiClient.patch<Herobanner>(endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    /**
     * Delete a hero banner
     */
    remove: async (id: string): Promise<void> => {
        const endpoint = API_ENDPOINTS.HEROBANNER_DELETE.replace("{id}", id)
        await apiClient.delete(endpoint)
    },

    /**
     * Create a new bottom hero banner (with image upload)
     */
    createBottom: async (data: CreateHerobannerRequest): Promise<Herobanner> => {
        const formData = new FormData()
        if (data.img instanceof File) {
            formData.append("img", data.img)
        } else if (typeof data.img === "string") {
            formData.append("img", data.img)
        }
        const response = await apiClient.post<Herobanner>(API_ENDPOINTS.HEROBANNER_BOTTOM_CREATE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    /**
     * Get all bottom hero banners
     */
    findAllBottom: async (): Promise<Herobanner[]> => {
        const response = await apiClient.get<Herobanner[]>(API_ENDPOINTS.HEROBANNER_BOTTOM_GET_ALL)
        return response.data
    },

    /**
     * Get a single bottom hero banner by id
     */
    findOneBottom: async (id: string): Promise<Herobanner> => {
        const endpoint = API_ENDPOINTS.HEROBANNER_BOTTOM_GET_ONE.replace("{id}", id)
        const response = await apiClient.get<Herobanner>(endpoint)
        return response.data
    },

    /**
     * Update a bottom hero banner (with image upload)
     */
    updateBottom: async (id: string, data: UpdateHerobannerRequest): Promise<Herobanner> => {
        const formData = new FormData()
        if (data.img instanceof File) {
            formData.append("img", data.img)
        } else if (typeof data.img === "string" && data.img) {
            formData.append("img", data.img)
        }
        const endpoint = API_ENDPOINTS.HEROBANNER_BOTTOM_UPDATE.replace("{id}", id)
        const response = await apiClient.patch<Herobanner>(endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    /**
     * Delete a bottom hero banner
     */
    removeBottom: async (id: string): Promise<void> => {
        const endpoint = API_ENDPOINTS.HEROBANNER_BOTTOM_DELETE.replace("{id}", id)
        await apiClient.delete(endpoint)
    },

    /**
     * Create a new middle hero banner (with image upload)
     */
    createMiddle: async (data: CreateHerobannerRequest): Promise<Herobanner> => {
        const formData = new FormData()
        if (data.img instanceof File) {
            formData.append("img", data.img)
        } else if (typeof data.img === "string") {
            formData.append("img", data.img)
        }
        const response = await apiClient.post<Herobanner>(API_ENDPOINTS.HEROBANNER_MIDDLE_CREATE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    /**
     * Get all middle hero banners
     */
    findAllMiddle: async (): Promise<Herobanner[]> => {
        const response = await apiClient.get<Herobanner[]>(API_ENDPOINTS.HEROBANNER_MIDDLE_GET_ALL)
        return response.data
    },

    /**
     * Get a single middle hero banner by id
     */
    findOneMiddle: async (id: string): Promise<Herobanner> => {
        const endpoint = API_ENDPOINTS.HEROBANNER_MIDDLE_GET_ONE.replace("{id}", id)
        const response = await apiClient.get<Herobanner>(endpoint)
        return response.data
    },

    /**
     * Update a middle hero banner (with image upload)
     */
    updateMiddle: async (id: string, data: UpdateHerobannerRequest): Promise<Herobanner> => {
        const formData = new FormData()
        if (data.img instanceof File) {
            formData.append("img", data.img)
        } else if (typeof data.img === "string" && data.img) {
            formData.append("img", data.img)
        }
        const endpoint = API_ENDPOINTS.HEROBANNER_MIDDLE_UPDATE.replace("{id}", id)
        const response = await apiClient.patch<Herobanner>(endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    /**
     * Delete a middle hero banner
     */
    removeMiddle: async (id: string): Promise<void> => {
        const endpoint = API_ENDPOINTS.HEROBANNER_MIDDLE_DELETE.replace("{id}", id)
        await apiClient.delete(endpoint)
    },
}

export default herobannerService
