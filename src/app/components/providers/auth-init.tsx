"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/app/store/auth-store"

/**
 * Client component to initialize auth state on app startup
 * Fetches current user from /users/me if token exists
 */
export function AuthInit() {
  const { token, isInitialized, hydrate } = useAuthStore()

  useEffect(() => {
    // Ensure Zustand store is hydrated from localStorage
    useAuthStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    // If token exists and user data not yet loaded, fetch from /users/me
    if (token && !isInitialized) {
      hydrate()
    }
  }, [token, isInitialized, hydrate])

  return null
}
