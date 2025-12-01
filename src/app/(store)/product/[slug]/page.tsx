/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next"
import { productsService } from "../../../lib/api/services/products"
import { ProductGallery } from "../../../components/product/product-gallery"
import { ProductInfo } from "../../../components/product/product-info"
import { ProductTabs } from "../../../components/product/product-tabs"
import { ProductSection } from "../../../components/home/product-section"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import type { Product } from "../../../types"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const product = await productsService.getBySlug(slug)

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images,
      },
    }
  } catch (error) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params
    const product = await productsService.getBySlug(slug)

    let relatedProducts: Product[] = []
    try {
      const response = await productsService.getAll(
        { categoryId: product.category.id },
        1,
        10
      )
      relatedProducts = (response.items || [])
        .filter((p) => p.id !== product.id)
        .slice(0, 5)
    } catch (error) {
      relatedProducts = []
    }

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
  } catch (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-2 text-9xl font-bold text-muted-foreground/20">404</h1>
        <h2 className="mb-4 text-2xl font-bold">Product Not Found</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Sorry, the product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/category/smartphones">
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }
}
