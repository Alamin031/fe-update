/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {brandsService} from '@/app/lib/api/services/brands';
import {CategoryProducts} from '@/app/components/category/category-products';
import type {Product, Brand} from '@/app/types';

interface BrandPageProps {
  params: Promise<{slug: string}>;
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const {slug} = await params;
  let brand: Brand | null = null;
  try {
    brand = await brandsService.getBySlug(slug);
  } catch {
    notFound();
  }
  if (!brand) notFound();
  return {
    title: brand.name,
    description: `Explore all products from ${brand.name}.`,
  };
}

export default async function BrandPage({params}: BrandPageProps) {
  const {slug} = await params;
  let brand: Brand | null = null;
  let products: Product[] = [];
  try {
    // Parallelize API calls for better performance
    const [brandData, productsRes] = await Promise.all([
      brandsService.getBySlug(slug),
      brandsService.getProducts(slug, 1, 100).catch(() => null),
    ]);

    brand = brandData;

    // Process products response
    if (Array.isArray(productsRes)) {
      products = productsRes as Product[];
    } else if (productsRes && Array.isArray((productsRes as any).products)) {
      products = (productsRes as any).products as Product[];
    }
  } catch {
    notFound();
  }
  if (!brand) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        {brand.logo && (
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-12 w-12 object-contain"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {brand.name}
        </h1>
      </div>
      <CategoryProducts products={products} />
    </div>
  );
}
