"use client"

import React, { useEffect, useState, ComponentType } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export type UserRole = "user" | "admin" | "management"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface ProtectedRouteOptions {
  requiredRoles?: UserRole[]
  fallbackTo?: string
  showLoader?: boolean
}

interface ProtectedRouteProps {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  hasRequiredRole: boolean
}

/**
 * Higher-Order Component to protect routes
 * Usage:
 * export default withProtectedRoute(MyComponent, { requiredRoles: ['admin'] })
 */
export function withProtectedRoute<P extends object>(
  Component: ComponentType<P>,
  options: ProtectedRouteOptions = {},
): ComponentType<P> {
  return function ProtectedRouteComponent(props: P) {
    const router = useRouter()
    const { user, token, isAuthenticated } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)
    const [hasRequiredRole, setHasRequiredRole] = useState(true)

    const { requiredRoles = [], fallbackTo = "/login", showLoader = true } = options

    useEffect(() => {
      setIsLoading(true)

      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        router.push(`${fallbackTo}?from=${typeof window !== "undefined" ? window.location.pathname : ""}`)
        return
      }

      // Check if user has required role
      if (requiredRoles.length > 0 && user) {
        const hasRole = requiredRoles.includes(user.role)
        setHasRequiredRole(hasRole)

        if (!hasRole) {
          router.push("/403")
          return
        }
      }

      setIsLoading(false)
    }, [isAuthenticated, token, user, router, fallbackTo, requiredRoles])

    if (isLoading) {
      if (showLoader) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        )
      }
      return null
    }

    if (!isAuthenticated || !hasRequiredRole) {
      return null
    }

    return <Component {...props} />
  }
}

/**
 * Hook to check if user is authenticated and has required role
 */
export function useProtectedRoute(requiredRoles?: UserRole[]) {
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      if (!isAuthenticated || !token) {
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      let authorized = true

      if (requiredRoles && requiredRoles.length > 0 && user) {
        authorized = requiredRoles.includes(user.role)
      }

      setIsAuthorized(authorized)
      setIsLoading(false)
    }

    checkAuth()
  }, [isAuthenticated, token, user, requiredRoles])

  const requireAuth = (fallbackTo: string = "/login") => {
    if (!isLoading && !isAuthorized) {
      router.push(fallbackTo)
    }
  }

  return {
    isLoading,
    isAuthorized,
    user,
    requireAuth,
  }
}

/**
 * Component to conditionally render content based on authentication and role
 */
interface ProtectedContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredRoles?: UserRole[]
}

export function ProtectedContent({
  children,
  fallback = null,
  requiredRoles = [],
}: ProtectedContentProps) {
  const { user, token, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !token) {
    return fallback
  }

  if (requiredRoles.length > 0 && user) {
    const hasRole = requiredRoles.includes(user.role)
    if (!hasRole) {
      return fallback
    }
  }

  return <>{children}</>
}

/**
 * Redirect component for post-login redirects
 */
interface AuthRedirectProps {
  from?: string
  defaultTo?: string
}

export function AuthRedirect({ from, defaultTo = "/" }: AuthRedirectProps) {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      const redirectTo = from || defaultTo
      router.replace(redirectTo)
    }
  }, [isAuthenticated, token, from, defaultTo, router])

  return null
}
