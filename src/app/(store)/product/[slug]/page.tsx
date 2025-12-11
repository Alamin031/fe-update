/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-html-link-for-pages */
import type {Metadata} from 'next';
import {productsService, faqsService} from '../../../lib/api/services';
import {ProductDetailClient} from '../../../components/product/product-detail-client';
import {ProductTabs} from '../../../components/product/product-tabs';
import {ProductSection} from '../../../components/home/product-section';
import type {Product} from '../../../types';
import type {FAQ} from '../../../lib/api/types';
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
    const productAny = product as any;

    const images = productAny.images && Array.isArray(productAny.images)
      ? productAny.images.map((img: any) => img.url || img)
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
    if (apiProduct && (apiProduct as any).rawProduct) {
      console.log('apiProduct.rawProduct:', (apiProduct as any).rawProduct);
    }
  } catch {
    notFound();
  }

  if (!apiProduct || !apiProduct.slug || !apiProduct.name) {
    notFound();
  }

  // Fetch FAQs using product ID
  let productFaqs: FAQ[] = [];
  try {
    if (apiProduct.id) {
      productFaqs = await faqsService.getByProduct(apiProduct.id);
    }
  } catch {
    productFaqs = [];
  }

  const parseJSON = (val: any, fallback: any) => {
    try {
      return typeof val === 'string' ? JSON.parse(val) : val ?? fallback;
    } catch {
      return fallback;
    }
  };

  // Extract images from the new API format
  const apiProductAny = apiProduct as any;
  const images = (() => {
    if (apiProductAny.images && Array.isArray(apiProductAny.images)) {
      return apiProductAny.images.map((img: any) => {
        if (typeof img === 'string') return img;
        return img.imageUrl || img.url || img;
      });
    }
    return [];
  })();

  // Extract specifications
  const specifications = (() => {
    if (apiProduct.specifications && Array.isArray(apiProduct.specifications)) {
      // Support both {key, value} and {specKey, specValue}
      return Object.fromEntries(
        apiProduct.specifications.map((s: any) => [s.key || s.specKey, s.value || s.specValue])
      );
    }
    if (typeof apiProduct.specifications === 'object' && apiProduct.specifications !== null) {
      return apiProduct.specifications;
    }
    return {};
  })();

  // Get category from categories array
  const category = apiProductAny.categories?.[0] || apiProduct.category;

  // Region product price/stock extraction
  let price = Number(apiProduct.price) || 0;
  let stock = Number(apiProduct.stock) || Number(apiProductAny.totalStock) || 0;
  const regionPrices: any[] = [];
  const regionStocks: any[] = [];
  if (apiProduct.productType === 'region' && Array.isArray(apiProductAny.regions)) {
    apiProductAny.regions.forEach((region: any) => {
      if (Array.isArray(region.defaultStorages)) {
        region.defaultStorages.forEach((storage: any) => {
          if (storage.price) {
            regionPrices.push({
              regionName: region.regionName,
              storageSize: storage.storageSize,
              regularPrice: storage.price.regularPrice,
              discountPrice: storage.price.discountPrice,
              comparePrice: storage.price.comparePrice,
            });
            regionStocks.push({
              regionName: region.regionName,
              storageSize: storage.storageSize,
              stockQuantity: storage.price.stockQuantity,
            });
          }
        });
      }
    });
    // Use first region's first storage as main price/stock fallback
    if (regionPrices.length > 0) {
      price = regionPrices[0].regularPrice || 0;
    }
    if (regionStocks.length > 0) {
      stock = regionStocks[0].stockQuantity || 0;
    }
  }

  const product: Product = {
    id: apiProduct.id,
    name: apiProduct.name ?? '',
    slug: apiProduct.slug ?? '',
    description: apiProduct.description ?? '',
    price,
    images: images,
    category: category
      ? {...category, slug: category.slug ?? ''}
      : {id: '', name: '', slug: '', createdAt: '', updatedAt: ''},
    brand: apiProductAny.brands?.[0] || apiProduct.brand || {id: '', name: '', slug: '', logo: ''},
    variants: parseJSON(apiProduct.variants, []),
    highlights: parseJSON(apiProduct.highlights, []),
    specifications: specifications,
    stock,
    sku: apiProduct.sku ?? '',
    warranty: apiProduct.warranty ?? '',
    rating: Number(apiProduct.rating) || 0,
    reviewCount: Number(apiProduct.reviewCount) || 0,
    ratingPoint: Number(apiProduct.ratingPoint) || 0,
    isFeatured: apiProduct.isFeatured,
    isNew: apiProduct.isNew,
    createdAt: apiProduct.createdAt ?? '',
    updatedAt: apiProduct.updatedAt ?? '',
  };
  // Attach region price/stock info for UI
  (product as any).regionPrices = regionPrices;
  (product as any).regionStocks = regionStocks;

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
        .map(p => {
          const pAny = p as any;
          return {
          id: p.id,
          name: p.name ?? '',
          slug: p.slug ?? '',
          description: p.description ?? '',
          price: typeof p.price === 'number' ? p.price : 0,
          images: Array.isArray(pAny.images) ? pAny.images.map((img: any) => img.url || img) : Array.isArray(p.image) ? p.image : [],
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
            Array.isArray(p.specifications)
              ? p.specifications.map((s: any, idx: number) => ({
                  id: s.id ?? `${p.id}-spec-${idx}`,
                  productId: p.id,
                  specKey: s.key ?? s.specKey ?? '',
                  specValue: s.value ?? s.specValue ?? '',
                  displayOrder: typeof s.displayOrder === 'number' ? s.displayOrder : idx,
                  createdAt: s.createdAt ?? '',
                  updatedAt: s.updatedAt ?? '',
                }))
              : [],
          stock: typeof p.stock === 'number' ? p.stock : 0,
          sku: p.sku ?? '',
          warranty: p.warranty ?? '',
          rating: typeof p.rating === 'number' ? p.rating : 0,
          reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          createdAt: p.createdAt ?? '',
          updatedAt: p.updatedAt ?? '',
        };
        })
        .slice(0, 5);
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="transition-colors hover:text-foreground">
            Home
          </a>
          <span className="text-muted-foreground/60">/</span>
          {product.category?.name && (
            <>
              <a
                href={`/category/${product.category.slug}`}
                className="transition-colors hover:text-foreground">
                {product.category.name}
              </a>
              <span className="text-muted-foreground/60">/</span>
            </>
          )}
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <ProductDetailClient product={product} />



        {/* Divider */}
        <div className="border-t border-border/40 my-12" />

        {/* Product Tabs */}
        <div className="py-8">
          <ProductTabs product={product} faqs={productFaqs} />
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
    </div>
  );
}
