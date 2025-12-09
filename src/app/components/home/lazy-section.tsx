"use client"

import { ReactNode } from "react"
import { useLazyLoad } from "@/app/hooks/use-lazy-load"

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  id?: string
  className?: string
}

/**
 * Component that defers rendering of children until visible in viewport
 * Useful for sections below the fold on home page
 */
export function LazySection({
  children,
  fallback,
  id,
  className = "",
}: LazySectionProps) {
  const { ref, hasLoaded } = useLazyLoad({
    threshold: 0.1,
    rootMargin: "200px",
  })

  return (
    <div ref={ref} id={id} className={className}>
      {hasLoaded ? (
        children
      ) : (
        fallback || (
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
