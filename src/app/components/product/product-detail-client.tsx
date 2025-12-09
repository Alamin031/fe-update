"use client"

import { useState, useEffect } from "react"
import { ProductGallery } from "./product-gallery"
import { ProductInfoRegion } from "./product-info-region"
import type { Product } from "@/app/types"

interface ProductDetailClientProps {
  product: Product & {
    rawProduct?: {
      regions?: any[]
      networks?: any[]
      [key: string]: any
    }
    productType?: string
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedColorImage, setSelectedColorImage] = useState<string | null>(null)
  const rawProduct = product.rawProduct

  // Determine if this is a network product
  const isNetworkProduct = rawProduct?.productType === "network"
  const isBasicProduct = rawProduct?.productType === "basic"

  const networks = isNetworkProduct ? (rawProduct?.networks || []) : []
  let regions = isNetworkProduct
    ? networks.map((n: any) => ({
        id: n.id,
        name: n.networkType,
        colors: n.colors || [],
        defaultStorages: n.defaultStorages || [],
      }))
    : (rawProduct?.regions || [])

  // For basic products, convert directColors to a default region structure
  if (isBasicProduct && (!regions || regions.length === 0) && rawProduct?.directColors) {
    regions = [{
      id: "default",
      name: "Default",
      colors: rawProduct.directColors.map((color: any) => ({
        id: color.id,
        name: color.colorName,
        colorName: color.colorName,
        colorImage: color.colorImage,
        image: color.colorImage,
        regularPrice: color.regularPrice,
        discountPrice: color.discountPrice,
        stockQuantity: color.stockQuantity,
      })),
      defaultStorages: [{
        id: "default-storage",
        size: "Standard",
        storageSize: "Standard",
        price: {
          regularPrice: rawProduct.directColors[0]?.regularPrice || 0,
          discountPrice: rawProduct.directColors[0]?.discountPrice || 0,
          stockQuantity: rawProduct.directColors[0]?.stockQuantity || 0,
        }
      }]
    }]
  }

  // Get first region and first color image
  useEffect(() => {
    if (regions && regions.length > 0) {
      const firstRegion = regions[0]
      if (firstRegion.colors && firstRegion.colors.length > 0) {
        const firstColor = firstRegion.colors[0]
        const colorImage = firstColor?.colorImage || firstColor?.image
        if (colorImage) {
          setSelectedColorImage(colorImage)
        }
      }
    }
  }, [regions])

  return (
    <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 mb-12">
      <div className="flex justify-center">
        <ProductGallery
          images={product.images ?? []}
          name={product.name ?? ""}
          isEmi={!!rawProduct?.isEmi}
          isCare={!!rawProduct?.isCare}
          selectedColorImage={selectedColorImage}
        />
      </div>
      <div className="flex items-start">
        <ProductInfoRegion product={product} onColorChange={setSelectedColorImage} />
      </div>
    </div>
  )
}
