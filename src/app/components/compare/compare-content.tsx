"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, ArrowLeftRight, ArrowRight, Search } from "lucide-react"
import { Button } from "../ui/button"
import { useCompareStore } from "@/app/store/compare-store"
import { formatPrice } from "@/app/lib/utils/format"
import { useCartStore } from "@/app/store/cart-store"
import { getDefaultProductPrice } from "@/app/lib/utils/product"

const getProductImageUrl = (image: any): string => {
  if (!image || image === "") return "/placeholder.svg?height=128&width=128"
  if (typeof image === "string") return image
  if (typeof image === "object") {
    const url = image.imageUrl || image.url || ""
    return url && url !== "" ? url : "/placeholder.svg?height=128&width=128"
  }
  return "/placeholder.svg?height=128&width=128"
}

export function CompareContent() {
  const { items, removeItem, clearCompare } = useCompareStore()
  const addToCart = useCartStore((state) => state.addItem)
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ArrowLeftRight className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">No products to compare</h2>
        <p className="mt-2 text-muted-foreground">
          Add products to compare by clicking the compare icon on any product.
        </p>
        <Link href="/">
          <Button className="mt-6 gap-2">
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  const allSpecs = new Map<string, number>()
  items.forEach((product) => {
    if (Array.isArray(product.specifications)) {
      product.specifications.forEach((spec: any) => {
        const displayOrder = spec.displayOrder ?? 999
        if (!allSpecs.has(spec.specKey)) {
          allSpecs.set(spec.specKey, displayOrder)
        }
      })
    }
  })
  const sortedSpecKeys = Array.from(allSpecs.entries())
    .sort(([, orderA], [, orderB]) => orderA - orderB)
    .map(([key]) => key)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Comparing {items.length} {items.length === 1 ? "product" : "products"} (max 4)
        </p>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearCompare}>
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {/* Product Cards */}
        {items.map((product) => (
          <div key={product.id} className="flex flex-col rounded-lg border border-border bg-card">
            {/* Search Bar */}
            <div className="relative border-b border-border p-4">
              <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQueries[product.id] || ""}
                onChange={(e) =>
                  setSearchQueries((prev) => ({
                    ...prev,
                    [product.id]: e.target.value,
                  }))
                }
                className="w-full bg-transparent pl-8 pr-3 py-2 text-sm placeholder-muted-foreground outline-none"
              />
            </div>

            {/* Product Image & Details */}
            <div className="relative flex flex-col items-center border-b border-border p-4">
              <button
                onClick={() => removeItem(product.id)}
                className="absolute -right-2 -top-2 rounded-full bg-muted p-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <Link href={`/product/${product.slug}`}>
                <div className="mb-3 h-32 w-32 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={getProductImageUrl(
                      Array.isArray(product.images) && product.images.length > 0
                        ? product.images[0]
                        : null
                    )}
                    alt={product.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="line-clamp-2 text-center text-sm font-medium hover:underline">
                  {product.name}
                </p>
              </Link>
            </div>

            {/* Price Section */}
            <div className="border-b border-border p-4">
              {(() => {
                const priceInfo = getDefaultProductPrice(product);
                return (
                  <>
                    <p className="text-center text-lg font-bold">{formatPrice(priceInfo.discountPrice)}</p>
                    {priceInfo.hasDiscount && (
                      <p className="text-center text-xs text-muted-foreground line-through">
                        {formatPrice(priceInfo.regularPrice)}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Specifications */}
            <div className="flex-1 space-y-3 p-4">
              {sortedSpecKeys.length > 0 ? (
                sortedSpecKeys.map((specKey) => {
                  const specItem = Array.isArray(product.specifications)
                    ? product.specifications.find((s: any) => s.specKey === specKey)
                    : null
                  const displayValue = specItem?.specValue || "N/A"
                  return (
                    <div key={specKey} className="border-b border-border pb-3 last:border-b-0">
                      <p className="text-xs font-medium text-muted-foreground">{specKey}</p>
                      <p className="text-sm font-medium">
                        {displayValue}
                      </p>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-muted-foreground">No specifications available</p>
              )}
            </div>

            {/* Action Button */}
            <div className="border-t border-border p-4">
              <Button
                size="sm"
                onClick={() => addToCart(product)}
                className="w-full"
              >
                Shop Now
              </Button>
            </div>
          </div>
        ))}

        {/* Empty Placeholder Cards */}
        {[...Array(Math.min(3, 4 - items.length))].map((_, index) => (
          <div key={`empty-${index}`} className="flex flex-col rounded-lg border border-border bg-muted/30">
            {/* Search Bar */}
            <div className="relative border-b border-border p-4">
              <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent pl-8 pr-3 py-2 text-sm placeholder-muted-foreground outline-none"
              />
            </div>

            {/* Empty Product Area */}
            <div className="flex flex-1 flex-col items-center justify-center border-b border-border p-8 text-center">
              <div className="mb-3 h-32 w-32 rounded-lg bg-muted" />
              <p className="text-xs text-muted-foreground">Add a product to compare</p>
            </div>

            {/* Empty Specs Area */}
            <div className="space-y-3 p-4">
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
            </div>

            {/* Disabled Button */}
            <div className="border-t border-border p-4">
              <Button
                size="sm"
                disabled
                className="w-full"
              >
                Shop Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
