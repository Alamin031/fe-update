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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPrice } from "../../lib/utils/format";

interface Product {
  id?: string | number;
  name?: string;
  sku?: string;
  slug?: string;
  productType?: string;
  description?: string;
  productCode?: string;
  warranty?: string;
  rewardPoints?: string | number;
  minBookingPrice?: number | string;
  
  // Categories & Brands
  categories?: { id?: string; name?: string }[];
  brands?: { id?: string; name?: string }[];
  
  // Images
  images?: { id?: string; imageUrl?: string; url?: string; isThumbnail?: boolean; altText?: string }[];
  
  // Status flags
  isActive?: boolean;
  isOnline?: boolean;
  isPos?: boolean;
  isPreOrder?: boolean;
  isOfficial?: boolean;
  freeShipping?: boolean;
  isEmi?: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoCanonical?: string | null;
  
  // Tags
  tags?: string[];
  
  // Stock
  totalStock?: number;
  stockQuantity?: number | string;
  lowStockAlert?: number | string;
  
  // Region Product Specific
  regions?: Array<{
    id?: string;
    regionName?: string;
    isDefault?: boolean;
    defaultStorages?: Array<{
      id?: string;
      storageSize?: string;
      price?: {
        regularPrice?: number;
        discountPrice?: number;
        discountPercent?: number;
        stockQuantity?: number;
      };
    }>;
    colors?: Array<{
      id?: string;
      colorName?: string;
      colorImage?: string;
      image?: string;
      hasStorage?: boolean;
      useDefaultStorages?: boolean;
      singlePrice?: number;
      singleComparePrice?: number;
      singleStockQuantity?: number;
      storages?: Array<{
        id?: string;
        storageSize?: string;
        price?: {
          regularPrice?: number;
          discountPrice?: number;
          discountPercent?: number;
          stockQuantity?: number;
        };
      }>;
    }>;
  }>;
  
  // Specifications
  specifications?: Array<{
    key?: string;
    value?: string;
    specKey?: string;
    specValue?: string;
  }>;
  ratingPoint?: number | string;
}

interface ViewProductModalRegionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  loading?: boolean;
}

export function ViewProductModalRegion({
  open,
  onOpenChange,
  product,
  loading = false,
}: ViewProductModalRegionProps) {
  if (!product && !loading) return null;

  const getThumbnailImage = () => {
    const thumbnail = product?.images?.find((img) => img.isThumbnail);
    return thumbnail?.imageUrl || thumbnail?.url || product?.images?.[0]?.imageUrl || product?.images?.[0]?.url || "/placeholder.svg";
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
      <DialogContent className="w-full sm:max-w-[1100px] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {loading ? 'Loading...' : product?.name || 'Product'}
          </DialogTitle>
          {!loading && product && (
            <DialogDescription className="flex flex-wrap gap-4 text-xs pt-2">
              <span>ID: {product.id}</span>
              <span>SKU: {product.sku || "N/A"}</span>
              <span>Type: Region</span>
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
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Product Name</label>
                    <p className="mt-1 text-lg font-semibold">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">URL Slug</label>
                    <p className="mt-1 font-mono text-sm">{product.slug || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Categories</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.categories && product.categories.length > 0 ? (
                        product.categories.map((cat) => (
                          <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
                        ))
                      ) : <span className="text-sm text-muted-foreground">N/A</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Brands</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.brands && product.brands.length > 0 ? (
                        product.brands.map((brand) => (
                          <Badge key={brand.id} variant="secondary">{brand.name}</Badge>
                        ))
                      ) : <span className="text-sm text-muted-foreground">N/A</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Product Code</label>
                      <p className="mt-1 text-sm">{product.productCode || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Warranty</label>
                      <p className="mt-1 text-sm">{product.warranty || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Reward Points</label>
                    <p className="mt-1 text-sm">{product.rewardPoints || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Rating Point</label>
                    <p className="mt-1 text-sm">{product.ratingPoint !== undefined ? product.ratingPoint : "N/A"}</p>
                  </div>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Tags</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Active</label><p className="mt-1 font-medium">{formatBoolean(product.isActive)}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Online</label><p className="mt-1 font-medium">{formatBoolean(product.isOnline)}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">POS Available</label><p className="mt-1 font-medium">{formatBoolean(product.isPos)}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Pre-Order</label><p className="mt-1 font-medium">{formatBoolean(product.isPreOrder)}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Official</label><p className="mt-1 font-medium">{formatBoolean(product.isOfficial)}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Free Shipping</label><p className="mt-1 font-medium">{formatBoolean(product.freeShipping)}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">EMI Available</label><p className="mt-1 font-medium">{formatBoolean(product.isEmi)}</p></div>
                  </div>
                </CardContent>
              </Card>

              {/* Media (Gallery Images) */}
              {getGalleryImages().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Images ({getGalleryImages().length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {getGalleryImages().map((img, idx) => (
                      <div key={img.id || idx} className="rounded-lg border bg-muted p-2 flex items-center justify-center aspect-square" title={img.altText}>
                        <Image
                          src={img.imageUrl || img.url || "/placeholder.svg"}
                          alt={img.altText || `Gallery ${idx + 1}`}
                          width={150}
                          height={150}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              )}
              
              {/* SEO Information */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div><label className="text-xs font-semibold text-muted-foreground uppercase">SEO Title</label><p className="mt-1 text-sm">{product.seoTitle || "N/A"}</p></div>
                  <div><label className="text-xs font-semibold text-muted-foreground uppercase">SEO Description</label><p className="mt-1 text-sm">{product.seoDescription || "N/A"}</p></div>
                  <div><label className="text-xs font-semibold text-muted-foreground uppercase">Keywords</label><div className="mt-2 flex flex-wrap gap-2">{product.seoKeywords && product.seoKeywords.length > 0 ? product.seoKeywords.map((kw, i) => <Badge key={i} variant="outline">{kw}</Badge>) : <span className="text-sm text-muted-foreground">N/A</span>}</div></div>
                  <div><label className="text-xs font-semibold text-muted-foreground uppercase">Canonical URL</label><p className="mt-1 text-sm font-mono">{product.seoCanonical || "N/A"}</p></div>
                </CardContent>
              </Card>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y">
                        {product.specifications.map((spec, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-4 py-2 font-medium bg-muted/30 w-1/3">{spec.specKey || spec.key}</td>
                            <td className="px-4 py-2">{spec.specValue || spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.minBookingPrice && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Min Booking Price</label>
                      <p className="mt-1 text-2xl font-bold">{formatPrice(Number(product.minBookingPrice))}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Total Stock</label><p className="mt-1 text-2xl font-bold">{product.totalStock || product.stockQuantity || 0}</p></div>
                    <div><label className="text-xs font-semibold text-muted-foreground uppercase">Low Stock Alert</label><p className="mt-1 text-2xl font-bold">{product.lowStockAlert || 5}</p></div>
                  </div>
                </CardContent>
              </Card>

              {/* Regions & Colors */}
              {product.regions && product.regions.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Regions & Colors</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {product.regions.map((region) => (
                        <div key={region.id} className="border rounded-lg p-4 space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{region.regionName}</h4>
                            {region.isDefault && <Badge>Default</Badge>}
                          </div>

                          {/* Default Storages Pricing */}
                          {region.defaultStorages && region.defaultStorages.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Default Storage Pricing</h5>
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
                            </div>
                          )}

                          {/* Color Variants */}
                          {region.colors && region.colors.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Color Variants</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {region.colors.map((color) => (
                                  <div key={color.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                                    {(color.colorImage || color.image) && (
                                      <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted">
                                        <Image
                                          src={color.colorImage || color.image || "/placeholder.svg"}
                                          alt={color.colorName || "Color"}
                                          width={200}
                                          height={200}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-semibold text-sm">{color.colorName}</h4>
                                      {color.hasStorage && !color.useDefaultStorages && color.storages && (
                                        <div className="mt-2 space-y-1 text-xs">
                                          <p className="font-medium text-muted-foreground mb-1">Custom Storages:</p>
                                          {color.storages.map(s => (
                                            <div key={s.id} className="flex justify-between border-b border-dashed pb-1 mb-1 last:border-0">
                                              <span>{s.storageSize}</span>
                                              <span className="font-medium">{formatPrice(s.price?.discountPrice || 0)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {color.hasStorage && color.useDefaultStorages && (
                                        <p className="mt-2 text-xs text-muted-foreground">Uses default storages</p>
                                      )}
                                      {!color.hasStorage && (
                                        <div className="mt-2 space-y-1 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price:</span>
                                            <span className="font-medium">{formatPrice(color.singlePrice || 0)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Stock:</span>
                                            <span className="font-medium">{color.singleStockQuantity || 0}</span>
                                          </div>
                                        </div>
                                      )}
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
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
