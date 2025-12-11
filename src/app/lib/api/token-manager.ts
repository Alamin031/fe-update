import { STORAGE_KEYS } from "./config"
import AuthService from "./services/auth.service"

export class TokenManager {
  /**
   * Get the current access token
   */
  static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * Get the refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Set tokens in localStorage
   */
  static setTokens(token: string, refreshToken?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    }
      // Set cookies
      document.cookie = `access_token=${token}; path=/;`;
      if (refreshToken) {
        document.cookie = `refresh_token=${refreshToken}; path=/;`;
      }
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    if (typeof window === "undefined") return

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem("auth-storage") // Clear Zustand persist data

    // Remove cookies by setting expiry in past
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  /**
   * Check if token exists
   */
  static hasToken(): boolean {
    return !!this.getToken()
  }

  /**
   * Decode JWT token (without verification - frontend only)
   */
  static decodeToken(token?: string): Record<string, unknown> | null {
    try {
      const jwtToken = token || this.getToken()
      if (!jwtToken) return null

      const parts = jwtToken.split(".")
      if (parts.length !== 3) return null

      const payload = JSON.parse(atob(parts[1]))
      return payload
    } catch {
      return null
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token?: string): boolean {
    try {
      const payload = this.decodeToken(token)
      if (!payload || !payload.exp) return true

      const expirationTime = (payload.exp as number) * 1000
      return Date.now() >= expirationTime
    } catch {
      return true
    }
  }

  /**
   * Get time until token expiration (in seconds)
   */
  static getTimeUntilExpiration(token?: string): number {
    try {
      const payload = this.decodeToken(token)
      if (!payload || !payload.exp) return -1

      const expirationTime = (payload.exp as number) * 1000
      const timeUntilExpiration = Math.floor((expirationTime - Date.now()) / 1000)
      return Math.max(0, timeUntilExpiration)
    } catch {
      return -1
    }
  }

  /**
   * Get user ID from token
   */
  static getUserId(token?: string): string | null {
    try {
      const payload = this.decodeToken(token)
      return (payload?.sub || payload?.userId || payload?.id) as string | null
    } catch {
      return null
    }
  }

  /**
   * Get user role from token
   */
  static getUserRole(token?: string): string | null {
    try {
      const payload = this.decodeToken(token)
      if (!payload) return null

      const role = payload.role
      if (typeof role === "string" && role) return role

      const roles = payload.roles
      if (Array.isArray(roles) && roles.length > 0) {
        const first = roles[0]
        if (typeof first === "string") return first
      }

      return null
    } catch {
      return null
    }
  }

  /**
   * Check if token should be refreshed (if less than 5 minutes left)
   */
  static shouldRefreshToken(token?: string): boolean {
    const timeUntilExpiration = this.getTimeUntilExpiration(token)
    return timeUntilExpiration > 0 && timeUntilExpiration < 300 // 5 minutes
  }

  /**
   * Validate token using backend endpoint (POST /auth/decode/{token})
   * Returns decoded token payload if valid, null if invalid
   */
  static async validateTokenWithBackend(token: string): Promise<Record<string, unknown> | null> {
    try {
      const authService = new AuthService()
      const decoded = await authService.decodeToken(token)
      return decoded || null
    } catch {
      return null
    }
  }

  /**
   * Check if token is expired using backend validation
   * Falls back to local expiry check if backend validation fails
   */
  static async isTokenExpiredWithBackend(token?: string): Promise<boolean> {
    try {
      const jwtToken = token || this.getToken()
      if (!jwtToken) return true

      const decoded = await this.validateTokenWithBackend(jwtToken)
      if (!decoded || !decoded.exp) return true

      const expirationTime = (decoded.exp as number) * 1000
      return Date.now() >= expirationTime
    } catch {
      return this.isTokenExpired(token)
    }
  }

  /**
   * Get user info from decoded token (via backend)
   */
  static async getUserInfoFromToken(token?: string): Promise<{
    id: string | null
    email: string | null
    role: string | null
  }> {
    try {
      const jwtToken = token || this.getToken()
      if (!jwtToken) return { id: null, email: null, role: null }

      const decoded = await this.validateTokenWithBackend(jwtToken)
      if (!decoded) return { id: null, email: null, role: null }

      return {
        id: (decoded.sub || decoded.userId || decoded.id) as string | null,
        email: (decoded.email || null) as string | null,
        role: (decoded.role || null) as string | null,
      }
    } catch {
      return { id: null, email: null, role: null }
    }
  }
}
