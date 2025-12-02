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

interface ViewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export function ViewProductModal({
  open,
  onOpenChange,
  product,
}: ViewProductModalProps) {
  if (!product) return null;

  const parseJSON = (val: any, fallback: any = null) => {
    if (!val) return fallback;
    try {
      return typeof val === "string" ? JSON.parse(val) : val;
    } catch {
      return fallback;
    }
  };

  const getStatusBadgeColor = (status: any) => {
    if (typeof status === "string") {
      if (status === "Active" || status === true || status === "true")
        return "bg-green-500/10 text-green-600";
      if (status === "Out of Stock")
        return "bg-red-500/10 text-red-600";
      if (status === "Low Stock")
        return "bg-yellow-500/10 text-yellow-600";
    }
    return "bg-gray-500/10 text-gray-600";
  };

  const mainImage = product.image || product.images?.[0] || product.thumbnail || "/placeholder.svg";
  const galleryImages = product.gallery || product.images?.slice(1) || [];
  const price = product.price || product.basePrice || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Product ID: {product.id} • SKU: {product.sku || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="meta">Meta Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Main Image */}
              <div className="space-y-2">
                <h3 className="font-semibold">Product Image</h3>
                <div className="relative rounded-lg bg-muted p-4 flex items-center justify-center min-h-80">
                  <Image
                    src={mainImage}
                    alt={product.name}
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
                  <p className="mt-1 font-mono text-sm">{product.slug || "N/A"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Category
                    </label>
                    <p className="mt-1 text-sm">{product.category?.name || product.categoryId || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Brand
                    </label>
                    <p className="mt-1 text-sm">{product.brand?.name || product.brandId || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Product Code
                    </label>
                    <p className="mt-1 text-sm">{product.productCode || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SKU
                    </label>
                    <p className="mt-1 text-sm">{product.sku || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Rating
                    </label>
                    <p className="mt-1 text-sm">
                      {product.averageRating || product.rating ? `${product.averageRating || product.rating}/5` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Reward Points
                    </label>
                    <p className="mt-1 text-sm">{product.rewardsPoints || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={getStatusBadgeColor(product.status)}
                    >
                      {product.status === true || product.status === "true" || product.isActive ? "Published" : "Unpublished"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Description
                </label>
                <p className="mt-2 text-sm whitespace-pre-wrap">{String(product.description)}</p>
              </div>
            )}

            {/* Highlights */}
            {(() => {
              const highlights = parseJSON(product.highlights, null);
              if (Array.isArray(highlights) && highlights.length > 0) {
                return (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Highlights
                    </label>
                    <ul className="mt-2 space-y-1">
                      {highlights.map((highlight: string, idx: number) => (
                        <li key={idx} className="text-sm">• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}

            {/* Gallery Images */}
            {galleryImages && galleryImages.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Gallery Images
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {galleryImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border bg-muted p-2 flex items-center justify-center aspect-square"
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
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
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Selling Price
                    </label>
                    <p className="mt-2 text-2xl font-bold">
                      {formatPrice(price)}
                    </p>
                  </div>
                  {product.discountPrice && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Discount Price
                      </label>
                      <p className="mt-2 text-2xl font-bold">
                        {formatPrice(product.discountPrice)}
                      </p>
                    </div>
                  )}
                  {product.discountPercent && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Discount Percent
                      </label>
                      <p className="mt-2 text-xl font-bold">{product.discountPercent}%</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    EMI Available
                  </label>
                  <p className="mt-1">
                    <Badge
                      variant={product.emiAvailable ? "default" : "secondary"}
                    >
                      {product.emiAvailable ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>

                {product.minBookingPrice && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Min Booking Price
                    </label>
                    <p className="mt-1 text-sm">{formatPrice(product.minBookingPrice)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Variants */}
            {(() => {
              const variants = parseJSON(product.variants, []);
              return variants && variants.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {variants.map((variant: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border rounded p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Price: {formatPrice(variant.price || 0)} • Stock: {variant.stock || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes" className="space-y-4">
            {/* Regions */}
            {(() => {
              const regions = parseJSON(product.regions, []);
              return regions && regions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Regions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {regions.map((region: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border rounded p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{region.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Price: {formatPrice(region.price || 0)} • Stock: {region.stock || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}

            {/* Colors */}
            {(() => {
              const colors = parseJSON(product.colors, []);
              return colors && colors.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {colors.map((color: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center">
                          <span
                            className="inline-block w-10 h-10 rounded-full border-2 mb-1"
                            style={{
                              backgroundColor: color.code || "#000000",
                              borderColor: "#bbb",
                            }}
                            title={color.name}
                          />
                          <span className="text-xs text-muted-foreground">
                            {color.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}

            {/* Networks, Sizes, Plugs */}
            <div className="grid gap-4 sm:grid-cols-3">
              {(() => {
                const networks = parseJSON(product.networks, []);
                return networks && networks.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Networks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {networks.map((network: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {network}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {(() => {
                const sizes = parseJSON(product.sizes, []);
                return sizes && sizes.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sizes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {(() => {
                const plugs = parseJSON(product.plugs, []);
                return plugs && plugs.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Plugs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {plugs.map((plug: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {plug}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </div>

            {/* Specifications */}
            {(() => {
              const specifications = parseJSON(product.specifications, []);
              return specifications && specifications.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-2 bg-muted font-semibold p-3 rounded-t-lg gap-4">
                        <div>Key</div>
                        <div>Value</div>
                      </div>
                      {specifications.map((spec: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-4 border-t p-3"
                        >
                          <div className="font-medium text-sm">{spec.key}</div>
                          <div className="text-sm">{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}
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
                      Stock Quantity
                    </label>
                    <p className="mt-2 text-lg font-semibold">{product.stock || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Low Stock Alert
                    </label>
                    <p className="mt-2 text-lg font-semibold">{product.lowStock || "Not set"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Track Stock
                    </label>
                    <p className="mt-1">
                      <Badge
                        variant={product.trackStock !== false ? "default" : "secondary"}
                      >
                        {product.trackStock !== false ? "Yes" : "No"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Allow Backorder
                    </label>
                    <p className="mt-1">
                      <Badge
                        variant={product.allowBackorder ? "default" : "secondary"}
                      >
                        {product.allowBackorder ? "Yes" : "No"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meta Info Tab */}
          <TabsContent value="meta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meta & SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.metaTitle && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Meta Title
                    </label>
                    <p className="mt-1 text-sm">{product.metaTitle}</p>
                  </div>
                )}

                {product.metaDescription && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Meta Description
                    </label>
                    <p className="mt-1 text-sm">{product.metaDescription}</p>
                  </div>
                )}

                {product.metaKeywords && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Meta Keywords
                    </label>
                    <p className="mt-1 text-sm">
                      {Array.isArray(product.metaKeywords)
                        ? product.metaKeywords.join(", ")
                        : String(product.metaKeywords)}
                    </p>
                  </div>
                )}

                {product.seoTitle && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SEO Title
                    </label>
                    <p className="mt-1 text-sm">{product.seoTitle}</p>
                  </div>
                )}

                {product.seoDescription && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SEO Description
                    </label>
                    <p className="mt-1 text-sm">{product.seoDescription}</p>
                  </div>
                )}

                {product.seoKeywords && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SEO Keywords
                    </label>
                    <p className="mt-1 text-sm">
                      {Array.isArray(product.seoKeywords)
                        ? product.seoKeywords.join(", ")
                        : String(product.seoKeywords)}
                    </p>
                  </div>
                )}

                {product.model && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Model
                    </label>
                    <p className="mt-1 text-sm">{product.model}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Created
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
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
