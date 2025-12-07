/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPrice } from "../../lib/utils/format";

interface Product {
  id?: string | number;
  name?: string;
  sku?: string;
  slug?: string;
  productType?: string;
  price?: number;
  comparePrice?: number;
  description?: string;
  productCode?: string;
  warranty?: string;
  rewardPoints?: string | number;
  minBookingPrice?: number | string;
  
  // Categories & Brands (multiple)
  categoryIds?: string[];
  categories?: { id?: string; name?: string; slug?: string }[];
  brandIds?: string[];
  brands?: { id?: string; name?: string; slug?: string; logo?: string }[];
  
  // Images
  images?: { id?: string; url?: string; isThumbnail?: boolean; altText?: string }[];
  
  // Status flags
  isActive?: string | boolean;
  isOnline?: string | boolean;
  isPos?: string | boolean;
  isPreOrder?: string | boolean;
  isOfficial?: string | boolean;
  freeShipping?: string | boolean;
  isEmi?: string | boolean;
  
  // SEO
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string | null;
  };
  
  // Tags
  tags?: string[];
  
  // Price range
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  
  // Stock
  totalStock?: number;
  stockQuantity?: number | string;
  lowStockAlert?: number | string;
  
  // For Basic Products - Direct Colors
  directColors?: Array<{
    id?: string;
    name?: string;
    image?: string;
    hasStorage?: boolean;
    regularPrice?: number;
    discountPrice?: number;
    stockQuantity?: number;
    features?: string | null;
  }>;
  
  // For Network Products
  networks?: Array<{
    id?: string;
    name?: string;
    priceAdjustment?: number | null;
    isDefault?: boolean;
    defaultStorages?: Array<{
      id?: string;
      size?: string;
      price?: {
        regular?: number;
        compare?: number;
        discount?: number;
        discountPercent?: number;
        final?: number;
      };
      stock?: number;
      inStock?: boolean;
    }>;
    colors?: Array<{
      id?: string;
      name?: string;
      image?: string;
      hasStorage?: boolean;
      useDefaultStorages?: boolean;
      regularPrice?: number | null;
      discountPrice?: number | null;
      stockQuantity?: number | null;
      features?: string | null;
    }>;
  }>;
  
  // For Region Products
  regions?: Array<{
    id?: string;
    name?: string;
    isDefault?: boolean;
    defaultStorages?: Array<{
      id?: string;
      size?: string;
      price?: {
        regular?: number;
        compare?: number;
        discount?: number;
        discountPercent?: number;
        final?: number;
      };
      stock?: number;
      inStock?: boolean;
    }>;
    colors?: Array<{
      id?: string;
      name?: string;
      image?: string;
      hasStorage?: boolean;
      useDefaultStorages?: boolean;
      regularPrice?: number | null;
      discountPrice?: number | null;
      stockQuantity?: number | null;
      features?: string | null;
    }>;
  }>;
  
  // Specifications
  specifications?: Array<{
    key?: string;
    value?: string;
    displayOrder?: number;
  }>;
  
  // Videos
  videos?: Array<{
    id?: string;
    url?: string;
    thumbnail?: string;
  }>;
  
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
}

interface ViewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  loading?: boolean;
}

export function ViewProductModal({
  open,
  onOpenChange,
  product,
  loading = false,
}: ViewProductModalProps) {

  const getThumbnailImage = () => {
    const thumbnail = product.images?.find((img) => img.isThumbnail);
    return thumbnail?.url || product.images?.[0]?.url || "/placeholder.svg";
  };

  const getGalleryImages = () => {
    return product.images?.filter((img) => !img.isThumbnail) || [];
  };

  const formatBoolean = (val: any) => {
    if (val === true || val === "true") return "Yes";
    if (val === false || val === "false") return "No";
    return "N/A";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-4 text-xs pt-2">
            <span>ID: {product.id}</span>
            <span>SKU: {product.sku || "N/A"}</span>
            <span>Type: {product.productType?.toUpperCase() || "N/A"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Main Image */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Product Image</h3>
                  <div className="relative rounded-lg bg-muted p-4 flex items-center justify-center min-h-80">
                    <Image
                      src={getThumbnailImage()}
                      alt={product.name ?? "Product"}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Product Name
                    </label>
                    <p className="mt-1 text-lg font-semibold">{product.name}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      URL Slug
                    </label>
                    <p className="mt-1 font-mono text-sm">
                      {product.slug || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Categories
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.categories && product.categories.length > 0 ? (
                        product.categories.map((cat) => (
                          <Badge key={cat.id} variant="secondary">
                            {cat.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Brands
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.brands && product.brands.length > 0 ? (
                        product.brands.map((brand) => (
                          <Badge key={brand.id} variant="secondary">
                            {brand.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Product Code
                      </label>
                      <p className="mt-1 text-sm">
                        {product.productCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Warranty
                      </label>
                      <p className="mt-1 text-sm">
                        {product.warranty || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Reward Points
                    </label>
                    <p className="mt-1 text-sm">
                      {product.rewardPoints || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Description
                  </label>
                  <p className="mt-2 text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Tags
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Images */}
              {getGalleryImages().length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Gallery Images ({getGalleryImages().length})
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {getGalleryImages().map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="rounded-lg border bg-muted p-2 flex items-center justify-center aspect-square"
                        title={img.altText}
                      >
                        <Image
                          src={img.url || "/placeholder.svg"}
                          alt={img.altText || `Gallery ${idx + 1}`}
                          width={150}
                          height={150}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Min Price
                      </label>
                      <p className="mt-2 text-xl font-bold">
                        {product.priceRange?.min !== undefined
                          ? formatPrice(product.priceRange.min)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Max Price
                      </label>
                      <p className="mt-2 text-xl font-bold">
                        {product.priceRange?.max !== undefined
                          ? formatPrice(product.priceRange.max)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Currency
                      </label>
                      <p className="mt-2 text-lg font-semibold">
                        {product.priceRange?.currency || "BDT"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {product.minBookingPrice && (
                <Card>
                  <CardHeader>
                    <CardTitle>Min Booking Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatPrice(Number(product.minBookingPrice))}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-4">
              {/* Direct Colors (Basic Products) */}
              {product.directColors && product.directColors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {product.directColors.map((color) => (
                        <div
                          key={color.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{color.name}</h4>
                              {color.image && (
                                <div className="mt-2 w-16 h-16">
                                  <Image
                                    src={color.image}
                                    alt={color.name || "Color"}
                                    width={64}
                                    height={64}
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {color.regularPrice !== undefined && (
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  Regular Price
                                </span>
                                <p className="font-semibold">
                                  {formatPrice(color.regularPrice)}
                                </p>
                              </div>
                            )}
                            {color.discountPrice !== undefined &&
                              color.discountPrice !== null && (
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Discount Price
                                  </span>
                                  <p className="font-semibold">
                                    {formatPrice(color.discountPrice)}
                                  </p>
                                </div>
                              )}
                            {color.stockQuantity !== undefined && (
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  Stock
                                </span>
                                <p className="font-semibold">
                                  {color.stockQuantity}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Networks (Network Products) */}
              {product.networks && product.networks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Networks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.networks.map((network) => (
                        <div
                          key={network.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{network.name}</h4>
                            {network.isDefault && (
                              <Badge>Default</Badge>
                            )}
                          </div>

                          {/* Storages */}
                          {network.defaultStorages &&
                            network.defaultStorages.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2">
                                  Storages
                                </p>
                                <div className="space-y-2">
                                  {network.defaultStorages.map((storage) => (
                                    <div
                                      key={storage.id}
                                      className="bg-muted p-2 rounded text-sm"
                                    >
                                      <div className="font-medium">
                                        {storage.size}
                                      </div>
                                      <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
                                        <div>
                                          Regular:{" "}
                                          {formatPrice(
                                            storage.price?.regular || 0
                                          )}
                                        </div>
                                        <div>
                                          Discount:{" "}
                                          {formatPrice(
                                            storage.price?.discount || 0
                                          )}
                                        </div>
                                        <div>
                                          ({storage.price?.discountPercent}%)
                                        </div>
                                        <div>Stock: {storage.stock || 0}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Colors */}
                          {network.colors && network.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">
                                Colors
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {network.colors.map((color) => (
                                  <div
                                    key={color.id}
                                    className="text-center"
                                  >
                                    {color.image && (
                                      <div className="w-12 h-12 mb-1">
                                        <Image
                                          src={color.image}
                                          alt={color.name || "Color"}
                                          width={48}
                                          height={48}
                                          className="object-cover rounded"
                                        />
                                      </div>
                                    )}
                                    <span className="text-xs">
                                      {color.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Regions (Region Products) */}
              {product.regions && product.regions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Regions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.regions.map((region) => (
                        <div
                          key={region.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{region.name}</h4>
                            {region.isDefault && (
                              <Badge>Default</Badge>
                            )}
                          </div>

                          {/* Storages */}
                          {region.defaultStorages &&
                            region.defaultStorages.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2">
                                  Storages
                                </p>
                                <div className="space-y-2">
                                  {region.defaultStorages.map((storage) => (
                                    <div
                                      key={storage.id}
                                      className="bg-muted p-2 rounded text-sm"
                                    >
                                      <div className="font-medium">
                                        {storage.size}
                                      </div>
                                      <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
                                        <div>
                                          Regular:{" "}
                                          {formatPrice(
                                            storage.price?.regular || 0
                                          )}
                                        </div>
                                        <div>
                                          Discount:{" "}
                                          {formatPrice(
                                            storage.price?.discount || 0
                                          )}
                                        </div>
                                        <div>
                                          ({storage.price?.discountPercent}%)
                                        </div>
                                        <div>Stock: {storage.stock || 0}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Colors */}
                          {region.colors && region.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">
                                Colors
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {region.colors.map((color) => (
                                  <div
                                    key={color.id}
                                    className="text-center"
                                  >
                                    {color.image && (
                                      <div className="w-12 h-12 mb-1">
                                        <Image
                                          src={color.image}
                                          alt={color.name || "Color"}
                                          width={48}
                                          height={48}
                                          className="object-cover rounded"
                                        />
                                      </div>
                                    )}
                                    <span className="text-xs">
                                      {color.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Active
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.isActive === "true" || product.isActive === true ? "default" : "secondary"}>
                          {formatBoolean(product.isActive)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Online
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.isOnline === "true" || product.isOnline === true ? "default" : "secondary"}>
                          {formatBoolean(product.isOnline)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        POS
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.isPos === "true" || product.isPos === true ? "default" : "secondary"}>
                          {formatBoolean(product.isPos)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Pre-Order
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.isPreOrder === "true" || product.isPreOrder === true ? "default" : "secondary"}>
                          {formatBoolean(product.isPreOrder)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Official
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.isOfficial === "true" || product.isOfficial === true ? "default" : "secondary"}>
                          {formatBoolean(product.isOfficial)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Free Shipping
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.freeShipping === "true" || product.freeShipping === true ? "default" : "secondary"}>
                          {formatBoolean(product.freeShipping)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        EMI Available
                      </label>
                      <div className="mt-2">
                        <Badge variant={product.isEmi === "true" || product.isEmi === true ? "default" : "secondary"}>
                          {formatBoolean(product.isEmi)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Total Stock
                      </label>
                      <p className="mt-2 text-2xl font-bold">
                        {product.totalStock || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Low Stock Alert
                      </label>
                      <p className="mt-2 text-lg font-semibold">
                        {product.lowStockAlert || "Not set"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.seo?.title && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        SEO Title
                      </label>
                      <p className="mt-1 text-sm">{product.seo.title}</p>
                    </div>
                  )}

                  {product.seo?.description && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        SEO Description
                      </label>
                      <p className="mt-1 text-sm">{product.seo.description}</p>
                    </div>
                  )}

                  {product.seo?.keywords && product.seo.keywords.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Keywords
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.seo.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.seo?.canonical && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Canonical URL
                      </label>
                      <p className="mt-1 text-sm font-mono break-all">
                        {product.seo.canonical}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
                    <div>
                      Created:{" "}
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      Updated:{" "}
                      {product.updatedAt
                        ? new Date(product.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between border-b pb-2 last:border-0"
                        >
                          <span className="font-semibold text-sm">
                            {spec.key}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Array.isArray(spec.value)
                              ? spec.value.join(", ")
                              : spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
