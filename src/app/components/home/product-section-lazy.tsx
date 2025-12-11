/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSWRCache } from "@/app/hooks/use-swr-cache"
import { ProductSection } from "@/app/components/home/product-section"
import { LazySection } from "@/app/components/home/lazy-section"
import { productsService } from "@/app/lib/api/services/products"
import type { Product } from "@/app/types"

interface ProductSectionLazyProps {
  title: string
  subtitle?: string
  viewAllLink?: string
  productIds?: string[]
  categoryId?: string
  brandId?: string
  limit?: number
  products?: Product[] | undefined
}

export function ProductSectionLazy({
  title,
  subtitle,
  viewAllLink,
  productIds,
  categoryId,
  brandId,
  limit = 10,
  products: productsProp,
}: ProductSectionLazyProps) {
  const cacheKey = `products_section_${title
    .toLowerCase()
    .replace(/\s+/g, "_")}_${productIds?.join(",") || categoryId || brandId || "all"}`;
  const { data: response, isLoading: swrLoading } = useSWRCache<{ data?: Product[] | Product[] }>(
    cacheKey,
    async () => {
      let products: Product[] = [];
      if (productIds && productIds.length > 0) {
        try {
          const res = await productsService.getAll(
            { ids: productIds } as any,
            1,
            productIds.length
          );
          products = Array.isArray((res as any).items)
            ? (res as any).items
            : Array.isArray((res as any).data)
            ? (res as any).data
            : Array.isArray(res)
            ? (res as Product[])
            : [];
        } catch {
          // Fallback: fetch all and filter
          const allRes = await productsService.getAll({}, 1, 1000);
          const allProducts = Array.isArray((allRes as any).items)
            ? (allRes as any).items
            : Array.isArray((allRes as any).data)
            ? (allRes as any).data
            : Array.isArray(allRes)
            ? (allRes as Product[])
            : [];
          products = allProducts.filter((p: Product) =>
            productIds.includes(p.id)
          );
        }
      } else if (categoryId || brandId) {
        const res = await productsService.getAll(
          {
            categoryId: categoryId,
            brandId: brandId,
          },
          1,
          limit
        );
        products = Array.isArray((res as any).items)
          ? (res as any).items
          : Array.isArray((res as any).data)
          ? (res as any).data
          : Array.isArray(res)
          ? (res as Product[])
          : [];
      } else {
        const res = await productsService.getAll({}, 1, limit);
        products = Array.isArray((res as any).items)
          ? (res as any).items
          : Array.isArray((res as any).data)
          ? (res as any).data
          : Array.isArray(res)
          ? (res as Product[])
          : [];
      }
      return { data: products };
    },
    {
      ttl: 600000, // 10 minutes for home page sections
      revalidateOnMount: false, // Only load when visible
      revalidateOnFocus: false,
    }
  );
  const products = productsProp ?? response?.data ?? [];
  const isLoading = productsProp ? false : swrLoading;

  return (
    <ProductSection
      title={title}
      subtitle={subtitle}
      products={products}
      viewAllLink={viewAllLink}
      isLoading={isLoading}
    />
  );
}
