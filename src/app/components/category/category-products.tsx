"use client";

import { useState } from "react";
import { Grid3X3, List, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ProductCard } from "../product/product-card";
import { Product } from "@/app/types";
import { cn } from "@/app/lib/utils";
import { getProductDisplayPrice } from "@/app/lib/utils/product";

interface CategoryProductsProps {
  products: Product[]
  isLoading?: boolean
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export function CategoryProducts({ products, isLoading = false }: CategoryProductsProps) {
  const [sortBy, setSortBy] = useState<string>(sortOptions[0].value);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Make products per page dynamic in the future if needed
  const productsPerPage = 12;

  // Dynamic sorting
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return getProductDisplayPrice(a) - getProductDisplayPrice(b);
      case "price-high":
        return getProductDisplayPrice(b) - getProductDisplayPrice(a);
      case "popular":
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  // Dynamic pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / productsPerPage)
  );
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {sortedProducts.length > 0
            ? `Showing ${paginatedProducts.length} of ${sortedProducts.length} products`
            : "No products available"}
        </p>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
                Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(sortBy === option.value && "bg-accent")}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="hidden items-center rounded-lg border border-border sm:flex">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}
      >
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-muted animate-pulse rounded-lg"
            />
          ))
        ) : (
          paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="mt-1 text-muted-foreground">
            Try adjusting your filters, search, or check back later.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="h-9 w-9 p-0"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
