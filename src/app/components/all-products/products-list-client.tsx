/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo } from "react"
import { useSWRCache } from "@/app/hooks/use-swr-cache"
import { usePagination } from "@/app/hooks/use-pagination"
import { productsService } from "@/app/lib/api/services/products"
import { CategoryProducts } from "@/app/components/category/category-products"
import { Button } from "@/app/components/ui/button"
import type { Product } from "@/app/types"
import { ProductListResponse } from "@/app/lib/api"

interface ProductsListClientProps {
  initialProducts?: Product[]
  totalProducts?: number
  selectedCategories?: string[]
  selectedBrands?: string[]
  allProducts?: Product[]
}

const PAGE_SIZE = 20

export function ProductsListClient({
  initialProducts = [],
  totalProducts = 0,
  selectedCategories = [],
  selectedBrands = [],
  allProducts = [],
}: ProductsListClientProps) {
  // Filter products based on selected categories and brands
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.length > 0 ? allProducts : initialProducts

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category?.slug)
      )
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand?.slug)
      )
    }

    return filtered
  }, [allProducts, initialProducts, selectedCategories, selectedBrands])

  const {
    currentPage,
    totalPages,
    pageSize,
    offset,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination({
    pageSize: PAGE_SIZE,
    totalItems: filteredProducts.length,
  })

  // Generate cache key based on current page
  const cacheKey = `products_list_page_${currentPage}`

  // Fetch products for current page
  const { data: paginatedData, isLoading, error } = useSWRCache<ProductListResponse>(
    cacheKey,
    async () => {
      const response = await productsService.getAll({}, currentPage, PAGE_SIZE)
      return response
    },
    {
      ttl: 300000, // 5 minutes
      revalidateOnMount: true,
      dedupingInterval: 2000,
    }
  )

  // Use either fetched data or initial data
  const products = useMemo(() => {
    const mapToAppProduct = (product: any): Product => ({
      ...product,
      images: product.images ?? [],
    })

    if (paginatedData?.data && paginatedData.data.length > 0) {
      return paginatedData.data.map(mapToAppProduct)
    }
    return currentPage === 1 ? filteredProducts.map(mapToAppProduct) : []
  }, [paginatedData, filteredProducts, currentPage])

  const displayTotalProducts = useMemo(() => {
    return filteredProducts.length
  }, [filteredProducts])

  const displayTotalPages = useMemo(() => {
    if (displayTotalProducts > 0) {
      return Math.ceil(displayTotalProducts / PAGE_SIZE)
    }
    return totalPages
  }, [displayTotalProducts, totalPages])

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 mb-4">Failed to load products</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Product Count Info */}
      <div className="text-sm text-muted-foreground">
        Showing {offset + 1}-{Math.min(offset + PAGE_SIZE, displayTotalProducts)} of{" "}
        {displayTotalProducts} products
      </div>

      {/* Products Grid */}
      <CategoryProducts products={products} isLoading={isLoading} />

      {/* Pagination Controls */}
      {displayTotalPages > 1 && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!hasPrevPage || isLoading}
              onClick={prevPage}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(displayTotalPages, 5) }, (_, i) => {
                let pageNum: number
                if (displayTotalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= displayTotalPages - 2) {
                  pageNum = displayTotalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              disabled={!hasNextPage || isLoading}
              onClick={nextPage}
            >
              Next
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {displayTotalPages}
          </div>
        </div>
      )}
    </div>
  )
}
