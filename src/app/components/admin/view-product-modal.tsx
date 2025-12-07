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
    networkType?: string;
    name?: string;
    priceAdjustment?: number | null;
    isDefault?: boolean;
    defaultStorages?: Array<{
      id?: string;
      storageSize?: string;
      displayOrder?: number;
      price?: {
        id?: string;
        storageId?: string;
        regularPrice?: number;
        comparePrice?: number;
        discountPrice?: number;
        discountPercent?: number;
        campaignPrice?: number | null;
        campaignStart?: string | null;
        campaignEnd?: string | null;
        stockQuantity?: number;
        lowStockAlert?: number;
        createdAt?: string;
        updatedAt?: string;
      };
    }>;
    colors?: Array<{
      id?: string;
      colorName?: string;
      name?: string;
      colorImage?: string;
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
    regionName?: string;
    name?: string;
    isDefault?: boolean;
    displayOrder?: number;
    defaultStorages?: Array<{
      id?: string;
      regionId?: string;
      storageSize?: string;
      displayOrder?: number;
      price?: {
        id?: string;
        storageId?: string;
        regularPrice?: number;
        comparePrice?: number;
        discountPrice?: number;
        discountPercent?: number;
        campaignPrice?: number | null;
        campaignStart?: string | null;
        campaignEnd?: string | null;
        stockQuantity?: number;
        lowStockAlert?: number;
        createdAt?: string;
        updatedAt?: string;
      };
    }>;
    colors?: Array<{
      id?: string;
      regionId?: string;
      colorName?: string;
      name?: string;
      colorImage?: string;
      image?: string;
      hasStorage?: boolean;
      useDefaultStorages?: boolean;
      regularPrice?: number | null;
      discountPrice?: number | null;
      stockQuantity?: number | null;
      features?: string | null;
    }>;
    createdAt?: string;
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
  if (!product && !loading) return null;

  const getThumbnailImage = () => {
    const thumbnail = product?.images?.find((img) => img.isThumbnail);
    return thumbnail?.imageUrl || product?.images?.[0]?.imageUrl || "/placeholder.svg";
  };

  const getGalleryImages = () => {
    return product?.images?.filter((img) => !img.isThumbnail) || [];
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
          <DialogTitle className="text-2xl">
            {loading ? 'Loading...' : product?.name || 'Product'}
          </DialogTitle>
          {!loading && product && (
            <DialogDescription className="flex flex-wrap gap-4 text-xs pt-2">
              <span>ID: {product.id}</span>
              <span>SKU: {product.sku || "N/A"}</span>
              <span>Type: {product.productType?.toUpperCase() || "N/A"}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground">Loading product details...</p>
              </div>
            </div>
          ) : !product ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">No product data available</p>
            </div>
          ) : (
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
                          src={img.imageUrl || "/placeholder.svg"}
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

              {/* Basic Products - Direct Colors Pricing */}
              {product.directColors && product.directColors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Color Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-semibold">Color</th>
                            <th className="text-right py-2 px-2 font-semibold">Regular Price</th>
                            <th className="text-right py-2 px-2 font-semibold">Discount Price</th>
                            <th className="text-right py-2 px-2 font-semibold">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.directColors.map((color) => (
                            <tr key={color.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-2 font-medium">{color.name}</td>
                              <td className="text-right py-2 px-2">{formatPrice(color.regularPrice || 0)}</td>
                              <td className="text-right py-2 px-2 font-semibold">{formatPrice(color.discountPrice || 0)}</td>
                              <td className="text-right py-2 px-2">{color.stockQuantity || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Network Pricing Details */}
              {product.networks && product.networks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Network Pricing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.networks.map((network) => (
                        <div key={network.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{network.name}</h4>
                            {network.isDefault && <Badge>Default</Badge>}
                          </div>

                          {network.defaultStorages && network.defaultStorages.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-2 font-semibold">Storage</th>
                                    <th className="text-right py-2 px-2 font-semibold">Regular Price</th>
                                    <th className="text-right py-2 px-2 font-semibold">Discount Price</th>
                                    <th className="text-right py-2 px-2 font-semibold">Discount %</th>
                                    <th className="text-right py-2 px-2 font-semibold">Stock</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {network.defaultStorages.map((storage) => (
                                    <tr key={storage.id} className="border-b hover:bg-muted/50">
                                      <td className="py-2 px-2">{storage.storageSize}</td>
                                      <td className="text-right py-2 px-2">{formatPrice(storage.price?.regularPrice || 0)}</td>
                                      <td className="text-right py-2 px-2 font-semibold">{formatPrice(storage.price?.discountPrice || 0)}</td>
                                      <td className="text-right py-2 px-2">{storage.price?.discountPercent || 0}%</td>
                                      <td className="text-right py-2 px-2">{storage.price?.stockQuantity || 0}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Region Pricing Details */}
              {product.regions && product.regions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Region Pricing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.regions.map((region) => (
                        <div key={region.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{region.regionName || region.name}</h4>
                            {region.isDefault && <Badge>Default</Badge>}
                          </div>

                          {region.defaultStorages && region.defaultStorages.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-2 font-semibold">Storage</th>
                                    <th className="text-right py-2 px-2 font-semibold">Regular Price</th>
                                    <th className="text-right py-2 px-2 font-semibold">Discount Price</th>
                                    <th className="text-right py-2 px-2 font-semibold">Discount %</th>
                                    <th className="text-right py-2 px-2 font-semibold">Stock</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {region.defaultStorages.map((storage) => (
                                    <tr key={storage.id} className="border-b hover:bg-muted/50">
                                      <td className="py-2 px-2">{storage.storageSize}</td>
                                      <td className="text-right py-2 px-2">{formatPrice(storage.price?.regularPrice || 0)}</td>
                                      <td className="text-right py-2 px-2 font-semibold">{formatPrice(storage.price?.discountPrice || 0)}</td>
                                      <td className="text-right py-2 px-2">{storage.price?.discountPercent || 0}%</td>
                                      <td className="text-right py-2 px-2">{storage.price?.stockQuantity || 0}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
                    <CardTitle>Color Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.directColors.map((color) => (
                        <div
                          key={color.id}
                          className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                        >
                          {color.colorImage && (
                            <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={color.colorImage}
                                alt={color.name || "Color"}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-sm">{color.name}</h4>
                            <div className="mt-2 space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Regular:</span>
                                <span className="font-medium">{formatPrice(color.regularPrice || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount:</span>
                                <span className="font-medium">{formatPrice(color.discountPrice || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Stock:</span>
                                <span className="font-medium">{color.stockQuantity || 0}</span>
                              </div>
                            </div>
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
                    <CardTitle>Network Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.networks.map((network) => (
                        <div
                          key={network.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{network.networkType || network.name}</h4>
                            {network.isDefault && (
                              <Badge>Default</Badge>
                            )}
                          </div>

                          {/* Colors Grid */}
                          {network.colors && network.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-3">
                                Available Colors
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {network.colors.map((color) => (
                                  <div
                                    key={color.id}
                                    className="border rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                  >
                                    {color.colorImage && (
                                      <div className="w-full aspect-square mb-2 overflow-hidden rounded bg-muted">
                                        <Image
                                          src={color.colorImage}
                                          alt={color.colorName || color.name || "Color"}
                                          width={100}
                                          height={100}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <p className="text-xs font-medium">{color.colorName || color.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Storages */}
                          {network.defaultStorages &&
                            network.defaultStorages.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2">
                                  Storage Options
                                </p>
                                <div className="space-y-2">
                                  {network.defaultStorages.map((storage) => (
                                    <div
                                      key={storage.id}
                                      className="bg-muted p-3 rounded text-sm border"
                                    >
                                      <div className="font-medium mb-2">
                                        {storage.storageSize}
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Regular:</span>
                                          <div className="font-semibold">
                                            {formatPrice(
                                              storage.price?.regularPrice || 0
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Discount:</span>
                                          <div className="font-semibold">
                                            {formatPrice(
                                              storage.price?.discountPrice || 0
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Percent:</span>
                                          <div className="font-semibold">
                                            {storage.price?.discountPercent || 0}%
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Stock:</span>
                                          <div className="font-semibold">
                                            {storage.price?.stockQuantity || 0}
                                          </div>
                                        </div>
                                      </div>
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
                    <CardTitle>Region Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.regions.map((region) => (
                        <div
                          key={region.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{region.regionName || region.name}</h4>
                            {region.isDefault && (
                              <Badge>Default</Badge>
                            )}
                          </div>

                          {/* Colors Grid */}
                          {region.colors && region.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-3">
                                Available Colors
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {region.colors.map((color) => (
                                  <div
                                    key={color.id}
                                    className="border rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                  >
                                    {color.colorImage && (
                                      <div className="w-full aspect-square mb-2 overflow-hidden rounded bg-muted">
                                        <Image
                                          src={color.colorImage}
                                          alt={color.colorName || color.name || "Color"}
                                          width={100}
                                          height={100}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <p className="text-xs font-medium">{color.colorName || color.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Storages */}
                          {region.defaultStorages &&
                            region.defaultStorages.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2">
                                  Storage Options
                                </p>
                                <div className="space-y-2">
                                  {region.defaultStorages.map((storage) => (
                                    <div
                                      key={storage.id}
                                      className="bg-muted p-3 rounded text-sm border"
                                    >
                                      <div className="font-medium mb-2">
                                        {storage.storageSize}
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Regular:</span>
                                          <div className="font-semibold">
                                            {formatPrice(
                                              storage.price?.regularPrice || 0
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Discount:</span>
                                          <div className="font-semibold">
                                            {formatPrice(
                                              storage.price?.discountPrice || 0
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Percent:</span>
                                          <div className="font-semibold">
                                            {storage.price?.discountPercent || 0}%
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Stock:</span>
                                          <div className="font-semibold">
                                            {storage.price?.stockQuantity || 0}
                                          </div>
                                        </div>
                                      </div>
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
              {/* Basic Products - Color Stock */}
              {product.directColors && product.directColors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stock by Color</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-semibold">Color</th>
                            <th className="text-right py-2 px-2 font-semibold">Stock Quantity</th>
                            <th className="text-center py-2 px-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.directColors.map((color) => {
                            const stock = color.stockQuantity || 0;
                            let status = 'In Stock';
                            if (stock === 0) status = 'Out of Stock';
                            else if (stock <= 5) status = 'Low Stock';

                            return (
                              <tr key={color.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-2 font-medium">{color.name}</td>
                                <td className="text-right py-2 px-2 font-semibold">{stock}</td>
                                <td className="text-center py-2 px-2">
                                  <Badge
                                    variant={status === 'Out of Stock' ? 'secondary' : 'default'}
                                    className={
                                      status === 'Out of Stock'
                                        ? 'bg-red-500/10 text-red-600'
                                        : status === 'Low Stock'
                                        ? 'bg-yellow-500/10 text-yellow-600'
                                        : 'bg-green-500/10 text-green-600'
                                    }
                                  >
                                    {status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Network Inventory Details */}
              {product.networks && product.networks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Network Inventory Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.networks.map((network) => (
                        <div key={network.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{network.name}</h4>
                            {network.isDefault && <Badge>Default</Badge>}
                          </div>

                          {network.defaultStorages && network.defaultStorages.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-2 font-semibold">Storage</th>
                                    <th className="text-right py-2 px-2 font-semibold">Stock Quantity</th>
                                    <th className="text-right py-2 px-2 font-semibold">Low Stock Alert</th>
                                    <th className="text-center py-2 px-2 font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {network.defaultStorages.map((storage) => {
                                    const stock = storage.price?.stockQuantity || 0;
                                    const lowStock = storage.price?.lowStockAlert || 5;
                                    let status = 'In Stock';
                                    if (stock === 0) status = 'Out of Stock';
                                    else if (stock <= lowStock) status = 'Low Stock';

                                    return (
                                      <tr key={storage.id} className="border-b hover:bg-muted/50">
                                        <td className="py-2 px-2">{storage.storageSize}</td>
                                        <td className="text-right py-2 px-2 font-semibold">{stock}</td>
                                        <td className="text-right py-2 px-2">{lowStock}</td>
                                        <td className="text-center py-2 px-2">
                                          <Badge
                                            variant={status === 'Out of Stock' ? 'secondary' : 'default'}
                                            className={
                                              status === 'Out of Stock'
                                                ? 'bg-red-500/10 text-red-600'
                                                : status === 'Low Stock'
                                                ? 'bg-yellow-500/10 text-yellow-600'
                                                : 'bg-green-500/10 text-green-600'
                                            }
                                          >
                                            {status}
                                          </Badge>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Region Inventory Details */}
              {product.regions && product.regions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Region Inventory Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {product.regions.map((region) => (
                        <div key={region.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{region.regionName || region.name}</h4>
                            {region.isDefault && <Badge>Default</Badge>}
                          </div>

                          {region.defaultStorages && region.defaultStorages.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-2 font-semibold">Storage</th>
                                    <th className="text-right py-2 px-2 font-semibold">Stock Quantity</th>
                                    <th className="text-right py-2 px-2 font-semibold">Low Stock Alert</th>
                                    <th className="text-center py-2 px-2 font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {region.defaultStorages.map((storage) => {
                                    const stock = storage.price?.stockQuantity || 0;
                                    const lowStock = storage.price?.lowStockAlert || 5;
                                    let status = 'In Stock';
                                    if (stock === 0) status = 'Out of Stock';
                                    else if (stock <= lowStock) status = 'Low Stock';

                                    return (
                                      <tr key={storage.id} className="border-b hover:bg-muted/50">
                                        <td className="py-2 px-2">{storage.storageSize}</td>
                                        <td className="text-right py-2 px-2 font-semibold">{stock}</td>
                                        <td className="text-right py-2 px-2">{lowStock}</td>
                                        <td className="text-center py-2 px-2">
                                          <Badge
                                            variant={status === 'Out of Stock' ? 'secondary' : 'default'}
                                            className={
                                              status === 'Out of Stock'
                                                ? 'bg-red-500/10 text-red-600'
                                                : status === 'Low Stock'
                                                ? 'bg-yellow-500/10 text-yellow-600'
                                                : 'bg-green-500/10 text-green-600'
                                            }
                                          >
                                            {status}
                                          </Badge>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
          )}
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
