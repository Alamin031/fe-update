/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next"
import { getProductBySlug, getRelatedProducts } from "../../../lib/mock-data"
import { ProductGallery } from "../../../components/product/product-gallery"
import { ProductInfo } from "../../../components/product/product-info"
import { ProductTabs } from "../../../components/product/product-tabs"
import { ProductSection } from "../../../components/home/product-section"
import NotFound from "../../not-found"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return { title: "Product Not Found" }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">
          Home
        </a>
        <span>/</span>
        <a href={`/category/${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </a>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
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
  )
}
