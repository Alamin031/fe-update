/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { categoriesService } from "@/app/lib/api/services/categories";
import { productsService } from "@/app/lib/api/services/products";
import { CategoryProducts } from "@/app/components/category/category-products";
import { ProductsListClient } from "@/app/components/all-products/products-list-client";
import type { Category, Brand, Product } from "@/app/types/index";

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type RawCategory = {
  id: string;
  name?: string;
  slug?: string;
  image?: string | null;
  parentId?: string | null;
  children?: RawCategory[];
  productCount?: number;
  banner?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Explore our complete collection of products. Find the perfect tech devices with warranty and competitive prices.",
};

export default async function Page({ searchParams }: AllProductsPageProps) {
  // Await searchParams
  const params = await searchParams;

  // Fetch all categories
  const categoriesRaw = await categoriesService.getAll();
  const categories: Category[] = (categoriesRaw as unknown as RawCategory[]).map(
    (c: RawCategory) => ({
      id: c.id,
      name: c.name ?? "",
      slug: c.slug ?? "",
      image: c.image ?? undefined,
      parentId: c.parentId ?? undefined,
      children: Array.isArray(c.children)
        ? (c.children as RawCategory[]).map((child) => ({
            id: child.id,
            name: child.name ?? "",
            slug: child.slug ?? "",
            image: child.image ?? undefined,
            parentId: child.parentId ?? undefined,
            children: undefined,
            productCount: child.productCount ?? 0,
            banner: child.banner ?? undefined,
            createdAt: child.createdAt ?? "",
            updatedAt: child.updatedAt ?? "",
          }))
        : undefined,
      productCount: c.productCount ?? 0,
      banner: c.banner ?? undefined,
      createdAt: c.createdAt ?? "",
      updatedAt: c.updatedAt ?? "",
    })
  );

  // Fetch all brands
  let brands: Brand[] = [];
  try {
    brands = await brandsService.findAll();
  } catch {
    brands = [];
  }

  // Extract search params
  const selectedCategories = Array.isArray(params.categories)
    ? params.categories
    : params.categories
    ? [params.categories]
    : [];

  const selectedBrands = Array.isArray(params.brands)
    ? params.brands
    : params.brands
    ? [params.brands]
    : [];

  // Fetch all products first
  let allProducts: Product[] = [];
  try {
    const allRes = await productsService.getAll({}, 1, 1000);
    if (allRes && typeof allRes === "object") {
      if (Array.isArray((allRes as { data?: unknown[] }).data)) {
        allProducts = (allRes as { data?: unknown[] }).data as Product[];
      } else if (Array.isArray((allRes as { items?: unknown[] }).items)) {
        allProducts = (allRes as { items?: unknown[] }).items as Product[];
      } else if (Array.isArray(allRes)) {
        allProducts = allRes as Product[];
      }
    } else if (Array.isArray(allRes)) {
      allProducts = allRes as Product[];
    }
  } catch (error) {
    console.error("Failed to fetch all products:", error);
  }

  // Filter products based on selected categories and brands
  let products: Product[] = allProducts;

  if (selectedCategories.length > 0) {
    const categorySlug = selectedCategories[0];
    const category = categories.find(c => c.slug === categorySlug);
    if (category) {
      products = products.filter((p: any) => {
        // Check if product has this category in categoryIds array
        if (Array.isArray(p.categoryIds)) {
          return p.categoryIds.includes(category.id);
        }
        // Fallback to single categoryId
        return p.categoryId === category.id;
      });
    }
  }

  if (selectedBrands.length > 0) {
    const brandSlug = selectedBrands[0];
    const brand = brands.find(b => b.slug === brandSlug);
    if (brand) {
      products = products.filter((p: any) => {
        // Check if product has this brand in brandIds array
        if (Array.isArray(p.brandIds)) {
          return p.brandIds.includes(brand.id);
        }
        // Fallback to single brandId
        return p.brandId === brand.id;
      });
    }
  }

  // Calculate product count for each category
  categories.forEach(cat => {
    const categoryProducts = allProducts.filter((p: any) => {
      // Check if product has this category in categoryIds array
      if (Array.isArray(p.categoryIds)) {
        return p.categoryIds.includes(cat.id);
      }
      // Fallback to single categoryId
      return p.categoryId === cat.id;
    });
    cat.productCount = categoryProducts.length;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">All Products</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          All Products
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore our complete collection of products. Find the perfect tech
          devices with warranty and competitive prices.
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Products Grid */}
        <main className="flex-1">
          <ProductsListClient
            initialProducts={products.slice(0, 20)}
            totalProducts={products.length}
          />
        </main>
      </div>
    </div>
  );
}
