import { useEffect, useState, useCallback } from "react"
import { CacheManager } from "@/app/lib/api/cache"

interface UseSWRCacheOptions {
  ttl?: number // Cache time-to-live in milliseconds (default: 5 minutes)
  revalidateOnFocus?: boolean
  revalidateOnMount?: boolean
  dedupingInterval?: number // Deduplicate requests within this interval (ms)
}

interface UseSWRCacheState<T, E> {
  data: T | undefined
  error: E | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: (data?: T) => Promise<T | undefined>
}

// Track in-flight requests to avoid duplicate API calls
const inflightRequests = new Map<string, Promise<unknown>>()
const lastRequestTime = new Map<string, number>()

/**
 * Custom SWR hook with localStorage caching
 * @param key Cache and request key
 * @param fetcher Async function that fetches the data
 * @param options Configuration options
 * @returns { data, error, isLoading, isValidating, mutate }
 */
export function useSWRCache<T = unknown, E = Error>(
  key: string | null,
  fetcher?: () => Promise<T>,
  options: UseSWRCacheOptions = {}
): UseSWRCacheState<T, E> {
  const {
    ttl = 300000, // 5 minutes default
    revalidateOnFocus = true,
    revalidateOnMount = true,
    dedupingInterval = 2000, // 2 seconds
  } = options

  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<E | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

  // Validate input
  if (!key || !fetcher) {
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: async () => undefined,
    }
  }

  // Check if request is already in-flight
  const getInflightRequest = useCallback(() => {
    return inflightRequests.get(key)
  }, [key])

  // Check if we should skip request due to deduplication
  const shouldSkipRequest = useCallback(() => {
    const lastTime = lastRequestTime.get(key)
    if (!lastTime) return false

    const now = Date.now()
    return now - lastTime < dedupingInterval
  }, [key, dedupingInterval])

  // Main fetching logic
  const performFetch = useCallback(async () => {
    if (!key || !fetcher) return

    // Check cache first
    const cached = CacheManager.get<T>(key)
    if (cached) {
      setData(cached)
      setError(undefined)
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }

    // Check if request is already in-flight
    const inFlight = getInflightRequest()
    if (inFlight) {
      try {
        const result = (await inFlight) as T
        setData(result)
        setError(undefined)
      } catch (err) {
        setError(err as E)
      } finally {
        setIsLoading(false)
        setIsValidating(false)
      }
      return
    }

    // Check deduplication interval
    if (shouldSkipRequest()) {
      setIsLoading(false)
      return
    }

    // Start new request
    setIsValidating(true)
    const fetchPromise = fetcher()
    inflightRequests.set(key, fetchPromise)
    lastRequestTime.set(key, Date.now())

    try {
      const result = await fetchPromise
      setData(result)
      setError(undefined)
      // Cache the result
      CacheManager.set(key, result, ttl)
    } catch (err) {
      setError(err as E)
    } finally {
      setIsLoading(false)
      setIsValidating(false)
      inflightRequests.delete(key)
    }
  }, [key, fetcher, ttl, getInflightRequest, shouldSkipRequest])

  // Initial load
  useEffect(() => {
    if (revalidateOnMount) {
      performFetch()
    }
  }, [revalidateOnMount, key])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      // Only revalidate if cache is expired
      if (!CacheManager.isValid(key)) {
        performFetch()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [revalidateOnFocus, key, performFetch])

  // Manual mutation (update cache and trigger refetch)
  const mutate = useCallback(
    async (newData?: T) => {
      if (newData !== undefined) {
        setData(newData)
        CacheManager.set(key, newData, ttl)
        return newData
      } else {
        // Force refetch
        CacheManager.remove(key)
        inflightRequests.delete(key)
        lastRequestTime.delete(key)
        await performFetch()
        return data
      }
    },
    [key, ttl, data, performFetch]
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}
