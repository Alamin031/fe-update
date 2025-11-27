/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    console.log("Token in request interceptor:", authStore.token); // DEBUG
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const authStore = useAuthStore.getState()

        // Attempt to refresh token if refresh token exists
        if (authStore.token) {
          // Clear auth state
          authStore.logout()

          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }
      } catch (refreshError) {
        const authStore = useAuthStore.getState()
        authStore.logout()

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login"
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const message = (error.response.data as any)?.error?.message || "Access denied"
      console.error("Access Denied:", message)
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const message = (error.response.data as any)?.error?.message || "Resource not found"
      console.error("Not Found:", message)
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      const message = (error.response.data as any)?.error?.message || "Server error"
      console.error("Server Error:", message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
