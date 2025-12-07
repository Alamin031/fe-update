"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, BarChart3, ShoppingCart, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useCartStore } from "@/app/store/cart-store";
import { useWishlistStore } from "@/app/store/wishlist-store";
import { useCompareStore } from "@/app/store/compare-store";
import {
  formatPrice,
  calculateDiscount,
  formatEMI,
} from "@/app/lib/utils/format";
import { cn } from "@/app/lib/utils";
import { Product } from "@/app/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addToCart = useCartStore((state) => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const {
    addItem: addToCompare,
    removeItem: removeFromCompare,
    isInCompare,
  } = useCompareStore();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount
    ? calculateDiscount(product.originalPrice!, product.price)
    : 0;
  const isOutOfStock = product.stock === 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  // Extract image URL from product images array
  const getImageUrl = (img: any): string => {
    if (!img) return "/placeholder.svg";
    if (typeof img === "string") return img;
    if (typeof img === "object") {
      return img.imageUrl || img.url || "/placeholder.svg";
    }
    return "/placeholder.svg";
  };

  const primaryImage = getImageUrl(
    Array.isArray(product.images) && product.images[0] ? product.images[0] : null
  );

  const secondaryImage =
    Array.isArray(product.images) && product.images.length > 1
      ? getImageUrl(product.images[1])
      : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              isHovered && "scale-105",
              !imageLoaded && "blur-sm"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Second image on hover */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={product.name}
              fill
              className={cn(
                "absolute inset-0 object-cover transition-opacity duration-500",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge className="bg-[oklch(0.55_0.2_25)] text-[oklch(1_0_0)] hover:bg-[oklch(0.55_0.2_25)]">
              -{discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-foreground text-background hover:bg-foreground">
              New
            </Badge>
          )}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="bg-muted-foreground text-background"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
          )}
        >
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full shadow-md",
              inWishlist &&
                "bg-[oklch(0.55_0.2_25)] text-[oklch(1_0_0)] hover:bg-[oklch(0.55_0.2_25)]/90"
            )}
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full shadow-md",
              inCompare &&
                "bg-foreground text-background hover:bg-foreground/90"
            )}
            onClick={handleCompareToggle}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Link href={`/product/${product.slug}`}>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-md"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Add to Cart Button */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300",
            isHovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          )}
        >
          <Button
            className="w-full gap-2 shadow-md"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        {product.brand && product.brand.slug && product.brand.name && (
          <Link
            href={`/brand/${product.brand.slug}`}
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {product.brand.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium transition-colors hover:text-muted-foreground">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(product.rating)
                      ? "fill-[oklch(0.75_0.15_85)] text-[oklch(0.75_0.15_85)]"
                      : "fill-muted text-muted"
                  )}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            EMI: {formatEMI(product.price)}
          </p>
        </div>

        {/* Stock Indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="mt-2 text-xs text-[oklch(0.55_0.2_25)]">
            Only {product.stock} left in stock
          </p>
        )}
      </div>
    </div>
  );
}
