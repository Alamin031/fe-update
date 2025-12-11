/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoriesService } from "@/app/lib/api/services/categories";
import { productsService } from "@/app/lib/api/services/products";
import { CategoryProductsClient } from "@/app/components/category/category-products-client";
import { CategoryFAQ } from "@/app/components/category/category-faq";
import type { Category, Product } from "@/app/types/index";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Move RawCategory type outside of functions
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

// Metadata generator
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoriesRaw = await categoriesService.getAll();
  const categories: Category[] = (
    categoriesRaw as unknown as RawCategory[]
  ).map((c: RawCategory) => ({
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
  }));
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }
  return {
    title: category.name ?? slug,
    description: `Explore our premium collection of ${
      category.name ?? slug
    }. Official products with warranty and competitive prices.`,
    // Add more metadata fields as needed
  };
}

export default async function Page({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Parallelize API calls for better performance
  const [categoriesRaw, productsRaw] = await Promise.all([
    categoriesService.getAll(),
    productsService.getAll({}, 1, 1000).catch(() => null),
  ]);

  const categories: Category[] = (
    categoriesRaw as unknown as RawCategory[]
  ).map((c: RawCategory) => ({
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
  }));
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }

  // Process products
  let products: Product[] = [];
  if (productsRaw && typeof productsRaw === "object") {
    let allProducts: Product[] = [];
    if (Array.isArray((productsRaw as { data?: unknown[] }).data)) {
      allProducts = (productsRaw as { data?: unknown[] }).data as Product[];
    } else if (Array.isArray((productsRaw as { items?: unknown[] }).items)) {
      allProducts = (productsRaw as { items?: unknown[] }).items as Product[];
    } else if (Array.isArray(productsRaw)) {
      allProducts = productsRaw as Product[];
    }

    // Filter products for this category
    products = allProducts.filter((p: any) => {
      if (Array.isArray(p.categoryIds)) {
        return p.categoryIds.includes(category.id);
      }
      return p.categoryId === category.id;
    });
  } else if (Array.isArray(productsRaw)) {
    products = productsRaw as Product[];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">{category?.name ?? slug}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {category?.name ?? slug}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore our premium collection of{" "}
          {category?.name?.toLowerCase() ?? slug}. Official products with
          warranty and competitive prices.
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Products Grid */}
        <main className="flex-1">
          <CategoryProductsClient
            categoryId={category.id}
            categorySlug={slug}
            initialProducts={products.slice(0, 20)}
            totalProducts={products.length}
          />
        </main>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <CategoryFAQ categoryId={category.id} />
      </div>
    </div>
  );
}
