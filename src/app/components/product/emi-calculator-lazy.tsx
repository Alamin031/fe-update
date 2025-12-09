"use client"

import { useLazyLoad } from "@/app/hooks/use-lazy-load"
import { EMICalculator } from "@/app/components/product/emi-calculator"
import type { Product } from "@/app/types"

interface EMICalculatorLazyProps {
  product: Product
  price: number
}

/**
 * Lazy-loaded EMI Calculator that renders only when user scrolls to it
 * Defers EMI API calls until component is visible
 */
export function EMICalculatorLazy({
  product,
  price,
}: EMICalculatorLazyProps) {
  const { ref, hasLoaded } = useLazyLoad({
    threshold: 0.1,
    rootMargin: "300px",
    onLoad: () => {
      // Optional: You can trigger analytics or other actions here
      console.log("EMI Calculator loaded")
    },
  })

  return (
    <div ref={ref}>
      {hasLoaded ? (
        <EMICalculator product={product} price={price} />
      ) : (
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      )}
    </div>
  )
}
