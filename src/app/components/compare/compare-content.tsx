"use client"

import Link from "next/link"
import Image from "next/image"
import { X, BarChart3, ArrowRight, Minus } from "lucide-react"
import { Button } from "../ui/button"
import { useCompareStore } from "@/app/store/compare-store"
import { formatPrice } from "@/app/lib/utils/format"
import { useCartStore } from "@/app/store/cart-store"

export function CompareContent() {
  const { items, removeItem, clearCompare } = useCompareStore()
  const addToCart = useCartStore((state) => state.addItem)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
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

  const allSpecs = new Set<string>()
  items.forEach((product) => {
    Object.keys(product.specifications).forEach((key) => allSpecs.add(key))
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          Comparing {items.length} {items.length === 1 ? "product" : "products"} (max 4)
        </p>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearCompare}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="w-40 border-b border-border p-4 text-left font-medium text-muted-foreground">Product</th>
              {items.map((product) => (
                <th key={product.id} className="border-b border-border p-4 text-center">
                  <div className="relative">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute -right-2 -top-2 rounded-full bg-muted p-1 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Link href={`/product/${product.slug}`}>
                      <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=128&width=128"}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="line-clamp-2 text-sm font-medium hover:underline">{product.name}</p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-muted/50">
              <td className="border-b border-border p-4 font-medium">Price</td>
              {items.map((product) => (
                <td key={product.id} className="border-b border-border p-4 text-center">
                  <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-4 font-medium">Brand</td>
              {items.map((product) => (
                <td key={product.id} className="border-b border-border p-4 text-center">
                  {product.brand ? product.brand.name : "N/A"}
                </td>
              ))}
            </tr>
            <tr className="bg-muted/50">
              <td className="border-b border-border p-4 font-medium">Rating</td>
              {items.map((product) => (
                <td key={product.id} className="border-b border-border p-4 text-center">
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground"> ({product.reviewCount})</span>
                </td>
              ))}
            </tr>
            {Array.from(allSpecs).map((spec, index) => (
              <tr key={spec} className={index % 2 === 0 ? "" : "bg-muted/50"}>
                <td className="border-b border-border p-4 font-medium">{spec}</td>
                {items.map((product) => (
                  <td key={product.id} className="border-b border-border p-4 text-center">
                    {product.specifications[spec] || <Minus className="mx-auto h-4 w-4 text-muted-foreground" />}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="border-b border-border p-4 font-medium">Action</td>
              {items.map((product) => (
                <td key={product.id} className="border-b border-border p-4 text-center">
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
