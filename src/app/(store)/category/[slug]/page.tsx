import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoriesService } from "@/app/lib/api/services/categories";
import { productsService } from "@/app/lib/api/services/products";
import { CategoryFilters } from "@/app/components/category/category-filters";
import { CategoryProducts } from "@/app/components/category/category-products";
import { CategoryFAQ } from "@/app/components/category/category-faq";
import type { Category, Product } from "@/app/types/index";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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
  // Fetch products for this category from API
  let products: Product[] = [];
  try {
    const res = await productsService.getAll({ categoryId: slug }, 1, 100);
    // Guard access to `items` at runtime and cast to Product[]
    if (
      res &&
      typeof res === "object" &&
      Array.isArray((res as { items?: unknown[] }).items)
    ) {
      products = (res as { items?: unknown[] }).items as Product[];
    } else if (Array.isArray(res)) {
      products = res as Product[];
    } else {
      products = [];
    }
  } catch {
    products = [];
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
        {/* Filters - Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <CategoryFilters />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <CategoryProducts products={products} />
        </main>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <CategoryFAQ categoryName={category?.name ?? slug} categorySlug={slug} />
      </div>
    </div>
  );
}
