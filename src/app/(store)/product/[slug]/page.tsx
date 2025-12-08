/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-html-link-for-pages */
import type {Metadata} from 'next';
import {productsService} from '../../../lib/api/services/products';
import {ProductGallery} from '../../../components/product/product-gallery';
import {ProductInfoRegion} from '../../../components/product/product-info-region';
import {ProductTabs} from '../../../components/product/product-tabs';
import {ProductSection} from '../../../components/home/product-section';
import type {Product} from '../../../types';
import {notFound} from 'next/navigation';

interface ProductPageProps {
  params: Promise<{slug: string}>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const {slug} = await params;
    const product = await productsService.getBySlug(slug);

    const images = product.images && Array.isArray(product.images)
      ? product.images.map((img: any) => img.url || img)
      : [];

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: images.slice(0, 3),
      },
    };
  } catch {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist',
    };
  }
}

export default async function ProductPage({params}: ProductPageProps) {
  const {slug} = await params;

  let apiProduct;
  try {
    apiProduct = await productsService.getBySlug(slug);
  } catch (error) {
    console.error('Product fetch error:', error);
    notFound();
  }

  if (!apiProduct || !apiProduct.slug || !apiProduct.name) {
    notFound();
  }

  const parseJSON = (val: any, fallback: any) => {
    try {
      return typeof val === 'string' ? JSON.parse(val) : val ?? fallback;
    } catch {
      return fallback;
    }
  };

  // Extract images from the new API format
  const images = (() => {
    if (apiProduct.images && Array.isArray(apiProduct.images)) {
      return apiProduct.images.map((img: any) => img.url || img);
    }
    return [];
  })();

  // Extract specifications
  const specifications = (() => {
    if (apiProduct.specifications && Array.isArray(apiProduct.specifications)) {
      return Object.fromEntries(apiProduct.specifications.map((s: any) => [s.key, s.value]));
    }
    if (typeof apiProduct.specifications === 'object' && apiProduct.specifications !== null) {
      return apiProduct.specifications;
    }
    return {};
  })();

  // Get category from categories array
  const category = apiProduct.categories?.[0] || apiProduct.category;

  const product: Product = {
    id: apiProduct.id,
    name: apiProduct.name ?? '',
    slug: apiProduct.slug ?? '',
    description: apiProduct.description ?? '',
    price: Number(apiProduct.price) || 0,
    images: images,
    category: category
      ? {...category, slug: category.slug ?? ''}
      : {id: '', name: '', slug: '', createdAt: '', updatedAt: ''},
    brand: apiProduct.brands?.[0] || apiProduct.brand || {id: '', name: '', slug: '', logo: ''},
    variants: parseJSON(apiProduct.variants, []),
    highlights: parseJSON(apiProduct.highlights, []),
    specifications: specifications,
    stock: Number(apiProduct.stock) || Number(apiProduct.totalStock) || 0,
    sku: apiProduct.sku ?? '',
    warranty: apiProduct.warranty ?? '',
    rating: Number(apiProduct.rating) || 0,
    reviewCount: Number(apiProduct.reviewCount) || 0,
    isFeatured: apiProduct.isFeatured,
    isNew: apiProduct.isNew,
    createdAt: apiProduct.createdAt ?? '',
    updatedAt: apiProduct.updatedAt ?? '',
  };

  // Attach raw API product for region-based rendering
  (product as any).rawProduct = apiProduct;
  (product as any).productType = apiProduct.productType;

  let relatedProducts: Product[] = [];
  try {
    if (category?.id) {
      const response = await productsService.getAll(
        {categoryId: category.id},
        1,
        10,
      );
      relatedProducts = (response.data || [])
        .filter(p => p.id !== product.id && typeof p.slug === 'string')
        .map(p => ({
          id: p.id,
          name: p.name ?? '',
          slug: p.slug ?? '',
          description: p.description ?? '',
          price: typeof p.price === 'number' ? p.price : 0,
          images: Array.isArray(p.images) ? p.images.map((img: any) => img.url || img) : Array.isArray(p.image) ? p.image : [],
          category: p.category
            ? {
                ...p.category,
                slug: p.category.slug ?? '',
              }
            : {
                id: '',
                name: '',
                slug: '',
                createdAt: '',
                updatedAt: '',
              },
          brand: p.brand ?? {id: '', name: '', slug: '', logo: ''},
          variants: Array.isArray(p.variants)
            ? p.variants.map((v: any) => ({
                id: v.id ?? '',
                name: v.name ?? '',
                type: v.type ?? '',
                value: v.value ?? '',
                priceModifier:
                  typeof v.priceModifier === 'number' ? v.priceModifier : 0,
                stock: typeof v.stock === 'number' ? v.stock : 0,
              }))
            : [],
          highlights: Array.isArray(p.highlights) ? p.highlights : [],
          specifications:
            typeof p.specifications === 'object' && p.specifications !== null
              ? p.specifications
              : {},
          stock: typeof p.stock === 'number' ? p.stock : 0,
          sku: p.sku ?? '',
          warranty: p.warranty ?? '',
          rating: typeof p.rating === 'number' ? p.rating : 0,
          reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          createdAt: p.createdAt ?? '',
          updatedAt: p.updatedAt ?? '',
        }))
        .slice(0, 5);
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">
          Home
        </a>
        <span>/</span>
        {product.category?.name && (
          <>
            <a
              href={`/category/${product.category.slug}`}
              className="hover:text-foreground">
              {product.category.name}
            </a>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery
          images={product.images ?? []}
          name={product.name ?? ''}
        />
        <ProductInfoRegion product={product} />
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <ProductTabs product={product} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <ProductSection
            title="Related Products"
            subtitle="You might also like"
            products={relatedProducts}
            viewAllLink={`/category/${product.category.slug}`}
          />
        </div>
      )}
    </div>
  );
}
