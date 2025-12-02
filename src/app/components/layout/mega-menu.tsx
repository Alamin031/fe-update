"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { cn } from "@/app/lib/utils"
import type { Category, Brand } from "@/app/types"

const trendingData = [
  { name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max" },
  { name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra" },
  { name: "MacBook Pro M3", slug: "macbook-pro-m3" },
  { name: "AirPods Pro 2", slug: "airpods-pro-2" },
]

const dealsData = [
  { name: "Flash Sale - Up to 50% Off", slug: "flash-sale" },
  { name: "Bundle Deals", slug: "bundle-deals" },
  { name: "Clearance Sale", slug: "clearance" },
]

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  brands: Brand[]
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <div
      ref={menuRef}
      onMouseLeave={onClose}
      className={cn(
        "absolute left-0 right-0 z-40 border-b border-border bg-background shadow-lg transition-all duration-200",
        isOpen ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h3>
            <div className="space-y-1">
              {megaMenuData.categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top Brands</h3>
            <div className="grid grid-cols-2 gap-2">
              {megaMenuData.brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brand/${brand.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded bg-muted">
                    <Image
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="text-sm font-medium">{brand.name}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/brands"
              onClick={onClose}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View All Brands
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trending */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trending Now</h3>
            <div className="space-y-1">
              {megaMenuData.trending.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  onClick={onClose}
                  className="block rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Hot Deals */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[oklch(0.55_0.2_25)]">Hot Deals</h3>
            <div className="space-y-2">
              {megaMenuData.deals.map((deal) => (
                <Link
                  key={deal.slug}
                  href={`/deals/${deal.slug}`}
                  onClick={onClose}
                  className="block rounded-lg border border-[oklch(0.55_0.2_25)]/20 bg-[oklch(0.55_0.2_25)]/5 p-3 text-sm font-medium transition-colors hover:bg-[oklch(0.55_0.2_25)]/10"
                >
                  {deal.name}
                </Link>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-foreground p-4 text-background">
              <p className="text-xs uppercase tracking-wider">Limited Time</p>
              <p className="mt-1 text-lg font-bold">Flash Sale</p>
              <p className="text-sm opacity-80">Up to 50% off selected items</p>
              <Link
                href="/deals/flash-sale"
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
