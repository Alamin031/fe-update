import { useAuthStore } from "@/app/store/auth-store";
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || " https://friends-be-production.up.railway.app/api"

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 (Unauthorized) and 403 (Forbidden) errors
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const authStore = useAuthStore.getState()
        // Clear everything on auth error
        authStore.logout()

        if (typeof window !== "undefined") {
          // Force hard reload to clear middleware cache and trigger auth checks
          window.location.href = "/login?session-expired=true"
        }
      } catch (logoutError) {
        const authStore = useAuthStore.getState()
        authStore.logout()
        if (typeof window !== "undefined") {
          window.location.href = "/login?session-expired=true"
        }
        return Promise.reject(logoutError)
      }
    }

    // Handle network errors and other API errors
    if (error.message === "Network Error" || !error.response) {
      console.error("Network or API error:", error)
      // Still try to clear on network errors to be safe
      try {
        const authStore = useAuthStore.getState()
        if (authStore.token) {
          authStore.logout()
        }
      } catch (e) {
        console.error("Error clearing auth on network error:", e)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
