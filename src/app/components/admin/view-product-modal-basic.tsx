/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {Badge} from '../ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {formatPrice} from '../../lib/utils/format';
import {Button} from '../ui/button';

interface Product {
  id?: string | number;
  name?: string;
  sku?: string;
  slug?: string;
  productType?: string;
  description?: string;
  shortDescription?: string;
  productCode?: string;
  warranty?: string;
  rewardPoints?: string | number;
  minBookingPrice?: number | string;

  // Categories & Brands
  categories?: {id?: string; name?: string}[];
  brands?: {id?: string; name?: string}[];

  // Images
  images?: {
    id?: string;
    imageUrl?: string;
    url?: string;
    isThumbnail?: boolean;
    altText?: string;
  }[];

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

  // Rating
  ratingPoint?: number;

  // Basic Product Specific - Colors array (matching create form structure)
  colors?: Array<{
    id?: string;
    colorName?: string;
    colorImage?: string;
    image?: string;
    regularPrice?: number;
    discountPrice?: number;
    discountPercent?: number;
    stockQuantity?: number;
    displayOrder?: number;
  }>;

  // Legacy support
  directColors?: Array<{
    id?: string;
    name?: string;
    colorName?: string;
    image?: string;
    colorImage?: string;
    regularPrice?: number;
    discountPrice?: number;
    discountPercent?: number;
    stockQuantity?: number;
  }>;

  // Specifications
  specifications?: Array<{
    key?: string;
    value?: string;
    specKey?: string;
    specValue?: string;
    displayOrder?: number;
  }>;

  // Videos
  videos?: Array<{
    id?: string;
    videoUrl?: string;
    videoType?: string;
    displayOrder?: number;
  }>;
}

interface ViewProductModalBasicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  loading?: boolean;
}

export function ViewProductModalBasic({
  open,
  onOpenChange,
  product,
  loading = false,
}: ViewProductModalBasicProps) {
  if (!product && !loading) return null;

  const getThumbnailImage = () => {
    const thumbnail = product?.images?.find(img => img.isThumbnail);
    return (
      thumbnail?.imageUrl ||
      thumbnail?.url ||
      product?.images?.[0]?.imageUrl ||
      product?.images?.[0]?.url ||
      '/placeholder.svg'
    );
  };

  const getGalleryImages = () => {
    return product?.images?.filter(img => !img.isThumbnail) || [];
  };

  const formatBoolean = (val: any) => {
    if (val === true || val === 'true') return 'Yes';
    if (val === false || val === 'false') return 'No';
    return 'N/A';
  };

  // Get colors array - support both new 'colors' and legacy 'directColors'
  const getColors = () => {
    return product?.colors || product?.directColors || [];
  };

  const calculateDiscount = (regularPrice?: number, discountPrice?: number) => {
    if (!regularPrice || !discountPrice || regularPrice === 0) return 0;
    return Math.round(((regularPrice - discountPrice) / regularPrice) * 100);
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
              <span>SKU: {product.sku || 'N/A'}</span>
              <span>Product Type: {product.productType || 'Basic'}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground">
                  Loading product details...
                </p>
              </div>
            </div>
          ) : !product ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">No product data available</p>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Product Name
                      </label>
                      <p className="mt-1 text-base font-medium">
                        {product.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        URL Slug
                      </label>
                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        {product.slug || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {product.description && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Description
                      </label>
                      <div className="mt-2 text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                        {product.description}
                      </div>
                    </div>
                  )}

                  {product.shortDescription && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Short Description
                      </label>
                      <div
                        className="mt-2 text-sm bg-muted/30 p-3 rounded-lg"
                        dangerouslySetInnerHTML={{
                          __html: product.shortDescription,
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Categories
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.categories && product.categories.length > 0 ? (
                          product.categories.map(cat => (
                            <Badge key={cat.id} variant="secondary">
                              {cat.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Brands
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.brands && product.brands.length > 0 ? (
                          product.brands.map(brand => (
                            <Badge key={brand.id} variant="secondary">
                              {brand.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Product Code
                      </label>
                      <p className="mt-1 text-sm">
                        {product.productCode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        SKU
                      </label>
                      <p className="mt-1 text-sm">{product.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Warranty
                      </label>
                      <p className="mt-1 text-sm">
                        {product.warranty || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">Active</label>
                      <Badge
                        variant={product.isActive ? 'default' : 'secondary'}>
                        {formatBoolean(product.isActive)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">Online</label>
                      <Badge
                        variant={product.isOnline ? 'default' : 'secondary'}>
                        {formatBoolean(product.isOnline)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">POS</label>
                      <Badge variant={product.isPos ? 'default' : 'secondary'}>
                        {formatBoolean(product.isPos)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">Pre-Order</label>
                      <Badge
                        variant={product.isPreOrder ? 'default' : 'secondary'}>
                        {formatBoolean(product.isPreOrder)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">Official</label>
                      <Badge
                        variant={product.isOfficial ? 'default' : 'secondary'}>
                        {formatBoolean(product.isOfficial)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">
                        Free Shipping
                      </label>
                      <Badge
                        variant={
                          product.freeShipping ? 'default' : 'secondary'
                        }>
                        {formatBoolean(product.freeShipping)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <label className="text-sm font-medium">EMI</label>
                      <Badge variant={product.isEmi ? 'default' : 'secondary'}>
                        {formatBoolean(product.isEmi)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Thumbnail */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                      Thumbnail Image
                    </label>
                    <div className="w-32 h-32 rounded-lg border bg-muted p-2 flex items-center justify-center">
                      <Image
                        src={getThumbnailImage()}
                        alt="Thumbnail"
                        width={128}
                        height={128}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Gallery */}
                  {getGalleryImages().length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                        Gallery Images
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {getGalleryImages().map((img, idx) => (
                          <div
                            key={img.id || idx}
                            className="rounded-lg border bg-muted p-2 flex items-center justify-center aspect-square"
                            title={img.altText}>
                            <Image
                              src={
                                img.imageUrl || img.url || '/placeholder.svg'
                              }
                              alt={img.altText || `Gallery ${idx + 1}`}
                              width={100}
                              height={100}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Videos */}
              {product.videos && product.videos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.videos.map((video, idx) => (
                        <div
                          key={video.id || idx}
                          className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30">
                          <Badge variant="outline">
                            {video.videoType || 'youtube'}
                          </Badge>
                          <span className="text-sm font-mono truncate flex-1">
                            {video.videoUrl}
                          </span>
                          {video.videoUrl && (
                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline">
                              Open
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SEO Title
                    </label>
                    <p className="mt-1 text-sm">{product.seoTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SEO Description
                    </label>
                    <p className="mt-1 text-sm">
                      {product.seoDescription || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      SEO Keywords
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.seoKeywords && product.seoKeywords.length > 0 ? (
                        product.seoKeywords.map((kw, i) => (
                          <Badge key={i} variant="outline">
                            {kw}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Canonical URL
                    </label>
                    <p className="mt-1 text-sm font-mono">
                      {product.seoCanonical || 'N/A'}
                    </p>
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
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="text-left px-4 py-3 font-semibold">
                              Key
                            </th>
                            <th className="text-left px-4 py-3 font-semibold">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {product.specifications.map((spec, idx) => (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="px-4 py-2 font-medium">
                                {spec.specKey || spec.key}
                              </td>
                              <td className="px-4 py-2">
                                {spec.specValue || spec.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Reward Points
                      </label>
                      <p className="mt-1 text-sm">
                        {product.rewardPoints || '0'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Min Booking Price
                      </label>
                      <p className="mt-1 text-sm">
                        {product.minBookingPrice
                          ? formatPrice(Number(product.minBookingPrice))
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Rating Point
                      </label>
                      <p className="mt-1 text-sm">
                        {product.ratingPoint !== undefined
                          ? product.ratingPoint
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4">
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
                </CardContent>
              </Card>

              {/* Colors */}
              {getColors().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getColors().map((color, idx) => (
                        <div
                          key={color.id || idx}
                          className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Color Image */}
                            <div className="flex flex-col items-center">
                              {color.colorImage || color.image ? (
                                <div className="w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                                  <Image
                                    src={
                                      color.colorImage ||
                                      color.image ||
                                      '/placeholder.svg'
                                    }
                                    alt={color.colorName || 'Color'}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-24 h-24 rounded-lg border bg-muted flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Color Details */}
                            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">
                                  Color Name
                                </label>
                                <p className="mt-1 text-sm font-medium">
                                  {color.colorName ||
                                    (color as any).name ||
                                    'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">
                                  Regular Price
                                </label>
                                <p className="mt-1 text-sm">
                                  {formatPrice(color.regularPrice || 0)}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">
                                  Discount Price
                                </label>
                                <p className="mt-1 text-sm font-semibold text-green-600">
                                  {formatPrice(color.discountPrice || 0)}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">
                                  Discount %
                                </label>
                                <p className="mt-1 text-sm">
                                  {(color as any).discountPercent
                                    ? `${(color as any).discountPercent}%`
                                    : `${calculateDiscount(
                                        color.regularPrice,
                                        color.discountPrice,
                                      )}%`}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">
                                  Stock Quantity
                                </label>
                                <p className="mt-1">
                                  <Badge
                                    variant={
                                      (color.stockQuantity || 0) > 10
                                        ? 'default'
                                        : (color.stockQuantity || 0) > 0
                                        ? 'secondary'
                                        : 'destructive'
                                    }>
                                    {color.stockQuantity || 0} units
                                  </Badge>
                                </p>
                              </div>
                            </div>
                          </div>
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
