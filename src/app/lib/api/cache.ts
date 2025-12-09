/**
 * Cache utility for storing and retrieving data with Time-To-Live (TTL)
 * Uses localStorage to persist cached data across page reloads
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // in milliseconds
}

export class CacheManager {
  private static readonly PREFIX = "__cache__"

  /**
   * Generate cache key with prefix
   */
  private static getKey(key: string): string {
    return `${this.PREFIX}${key}`
  }

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes = 300000ms)
   */
  static set<T>(key: string, data: T, ttl: number = 300000): void {
    if (typeof window === "undefined") return

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      localStorage.setItem(this.getKey(key), JSON.stringify(entry))
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  /**
   * Get data from cache if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null

    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()
      const age = now - entry.timestamp

      // Check if cache expired
      if (age > entry.ttl) {
        this.remove(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  /**
   * Remove specific cache entry
   */
  static remove(key: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error("Cache remove error:", error)
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    if (typeof window === "undefined") return

    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error("Cache clear error:", error)
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  static isValid(key: string): boolean {
    if (typeof window === "undefined") return false

    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return false

      const entry: CacheEntry<unknown> = JSON.parse(item)
      const now = Date.now()
      const age = now - entry.timestamp

      return age <= entry.ttl
    } catch (error) {
      return false
    }
  }

  /**
   * Get cache age in milliseconds
   */
  static getAge(key: string): number | null {
    if (typeof window === "undefined") return null

    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const entry: CacheEntry<unknown> = JSON.parse(item)
      return Date.now() - entry.timestamp
    } catch (error) {
      return null
    }
  }
}
