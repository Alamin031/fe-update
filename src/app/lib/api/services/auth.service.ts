import apiClient from "../client"
import { API_ENDPOINTS } from "../config"
import { TokenManager } from "../token-manager"
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
  User,
  ApiResponse,
} from "../types"

export class AuthService {
  /**
   * Register a new user
   */
   async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH_REGISTER,
        data
      )

      if (response.data.data) {
        const { token, refreshToken } = response.data.data
        TokenManager.setTokens(token, refreshToken)
      }

      return response.data.data!
    } catch (error) {
      // Auto-clear on register error
      TokenManager.clearTokens()
      throw error
    }
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, data);

      // Handle both possible response shapes
      const resData =
        response.data?.data ??
        (response.data && response.data.access_token && response.data.user
          ? response.data
          : undefined);

      if (resData) {
        const { token, access_token, refreshToken } = resData;
        TokenManager.setTokens(token ?? access_token, refreshToken);
        return resData;
      }

      throw new Error("Invalid login response from server");
    } catch (error) {
      // Auto-clear on login error
      TokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Login with social provider
   */
   async socialLogin(data: SocialLoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH_SOCIAL_LOGIN,
        data
      )

      if (response.data.data) {
        const { token, refreshToken } = response.data.data
        TokenManager.setTokens(token, refreshToken)
      }

      return response.data.data!
    } catch (error) {
      // Auto-clear on social login error
      TokenManager.clearTokens()
      throw error
    }
  }

  /**
   * Refresh access token
   */
   async refreshToken(): Promise<string> {
    try {
      const refreshToken = TokenManager.getRefreshToken()
      if (!refreshToken) {
        TokenManager.clearTokens()
        throw new Error("No refresh token available")
      }

      const response = await apiClient.post<ApiResponse<{ token: string; refreshToken?: string }>>(
        API_ENDPOINTS.AUTH_REFRESH,
        { refreshToken }
      )

      if (response.data.data) {
        const { token, refreshToken: newRefreshToken } = response.data.data
        TokenManager.setTokens(token, newRefreshToken || refreshToken)
        return token
      }

      throw new Error("Failed to refresh token")
    } catch (error) {
      // Auto-clear on token refresh error
      TokenManager.clearTokens()
      throw error
    }
  }

  /**
   * Logout user
   */
   async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT)
    } catch (error) {
      // Still clear tokens even if logout API fails
      TokenManager.clearTokens()
      console.error("Logout API error (but tokens cleared):", error)
      throw error
    } finally {
      TokenManager.clearTokens()
    }
  }

  /**
   * Get current user info from /users/me endpoint
   */
   async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.USERS_ME)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Check if user is authenticated
   */
   isAuthenticated(): boolean {
    return TokenManager.hasToken() && !TokenManager.isTokenExpired()
  }

  /**
   * Get authentication token
   */
   getToken(): string | null {
    return TokenManager.getToken()
  }

  /**
   * Get user role from token
   */
   getUserRole(): string | null {
    return TokenManager.getUserRole()
  }

  /**
   * Check if user is admin
   */
   isAdmin(): boolean {
    const role = this.getUserRole()
    return role === "admin"
  }

  /**
   * Check if user is manager
   */
   isManager(): boolean {
    const role = this.getUserRole()
    return role === "manager" || role === "admin"
  }

  /**
   * Decode token using backend endpoint
   * POST /auth/decode/{token}
   */
  async decodeToken(token: string): Promise<Record<string, unknown>> {
    try {
      const endpoint = API_ENDPOINTS.AUTH_DECODE.replace("{token}", token)
      const response = await apiClient.post<Record<string, unknown>>(endpoint)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default AuthService
