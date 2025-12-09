"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "../product/product-card"
import { Button } from "../ui/button"
import type { Product } from "@/app/types"
interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
  badge?: string
  badgeColor?: string
  isLoading?: boolean
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  badge,
  badgeColor = "bg-foreground",
  isLoading = false,
}: ProductSectionProps) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`rounded-full ${badgeColor} px-3 py-1 text-xs font-medium text-background`}>
                {badge}
              </span>
            )}
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="ghost" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  )
}
