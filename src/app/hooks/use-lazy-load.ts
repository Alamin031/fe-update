import { useEffect, useRef, useState, useCallback } from "react"

interface UseLazyLoadOptions {
  threshold?: number | number[]
  rootMargin?: string
  onLoad?: () => void
}

/**
 * Hook for lazy loading elements with Intersection Observer API
 * Useful for deferring heavy operations until element is visible
 */
export function useLazyLoad(
  options: UseLazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "100px",
    onLoad,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            setHasLoaded(true)
            onLoad?.()
            // Unobserve after first intersection
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, onLoad])

  const reset = useCallback(() => {
    setIsVisible(false)
    setHasLoaded(false)
  }, [])

  return {
    ref,
    isVisible,
    hasLoaded,
    reset,
  }
}

/**
 * Hook for infinite scroll / load more functionality
 */
export function useInfiniteScroll(
  options: UseLazyLoadOptions & { onLoadMore?: () => void } = {}
) {
  const { onLoadMore, ...lazyLoadOptions } = options
  const { ref, isVisible, hasLoaded } = useLazyLoad({
    ...lazyLoadOptions,
    onLoad: onLoadMore,
  })

  return {
    ref,
    isVisible,
    hasLoaded,
  }
}
