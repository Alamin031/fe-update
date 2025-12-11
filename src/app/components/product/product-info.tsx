'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {
  Heart,
  ArrowLeftRight,
  ShoppingCart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Separator} from '../ui/separator';
import {useCartStore} from '@/app/store/cart-store';
import {useWishlistStore} from '@/app/store/wishlist-store';
import {useCompareStore} from '@/app/store/compare-store';
import {formatPrice} from '@/app/lib/utils/format';
import {cn} from '@/app/lib/utils';
import {NotifyProductDialog} from './notify-product-dialog';
import type {Product} from '@/app/types';
import {getDefaultProductPrice} from '@/app/lib/utils/product';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({product}: ProductInfoProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [carePlusSelected, setCarePlusSelected] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);

  const addToCart = useCartStore(state => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const {addItem: addToCompare, isInCompare} = useCompareStore();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  // Extract default variant prices based on product type
  const priceInfo = getDefaultProductPrice(product);
  const regularPrice = priceInfo.regularPrice;
  const salePrice = priceInfo.discountPrice;
  const hasDiscount = priceInfo.hasDiscount;
  const discount = priceInfo.discount;
  const isOutOfStock = priceInfo.stockQuantity === 0;

  // Group variants by type
  const variantsByType = product.variants.reduce((acc, variant) => {
    if (!acc[variant.type]) {
      acc[variant.type] = [];
    }
    acc[variant.type].push(variant);
    return acc;
  }, {} as Record<string, typeof product.variants>);

  // Calculate total price with variants and care+
  const variantPriceModifier = Object.entries(selectedVariants).reduce(
    (total, [type, value]) => {
      const variant = product.variants.find(
        v => v.type === type && v.value === value,
      );
      return total + (variant?.priceModifier || 0);
    },
    0,
  );

  const carePlusPrice = carePlusSelected ? Math.round(salePrice * 0.08) : 0;
  const totalPrice = salePrice + variantPriceModifier + carePlusPrice;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity, selectedVariants);
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCompareAndNavigate = () => {
    addToCompare(product);
    router.push('/compare');
  };

  return (
    <div className="flex flex-col">
      {/* Add to Compare Button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleAddToCompareAndNavigate}>
          <ArrowLeftRight className="h-4 w-4" />
          Add to Compare
        </Button>
      </div>

      {/* Brand */}
      {product.brand && (
        <Link
          href={`/brand/${product.brand.slug}`}
          className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
          {product.brand.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        {product.name}
      </h1>

      {/* Rating & SKU */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({length: 5}).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(product.rating)
                      ? 'fill-[oklch(0.75_0.15_85)] text-[oklch(0.75_0.15_85)]'
                      : 'fill-muted text-muted',
                  )}
                  viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount} reviews)
            </span>
          </div>
        )}
        <span className="text-sm text-muted-foreground">
          SKU: {product.sku}
        </span>
      </div>

      <Separator className="my-6" />

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{formatPrice(totalPrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(regularPrice)}
              </span>
              <Badge className="bg-[oklch(0.55_0.2_25)] text-[oklch(1_0_0)] hover:bg-[oklch(0.55_0.2_25)]">
                Save {discount}%
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <div className="mt-4">
        {isOutOfStock ? (
          <Badge
            variant="secondary"
            className="bg-muted-foreground/10 text-muted-foreground">
            Out of Stock
          </Badge>
        ) : product.stock <= 10 ? (
          <Badge className="bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.55_0.2_25)]/10">
            Only {product.stock} left in stock
          </Badge>
        ) : (
          <Badge className="bg-[oklch(0.55_0.2_145)]/10 text-[oklch(0.45_0.2_145)] hover:bg-[oklch(0.55_0.2_145)]/10">
            <Check className="mr-1 h-3 w-3" /> In Stock
          </Badge>
        )}
      </div>

      <Separator className="my-6" />

      {/* Variants */}
      {Object.entries(variantsByType).map(([type, variants]) => (
        <div key={type} className="mb-6">
          <h3 className="mb-3 text-sm font-medium capitalize">
            {type}: {selectedVariants[type] || 'Select'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <button
                key={variant.id || variant.value || index}
                onClick={() =>
                  setSelectedVariants(prev => ({
                    ...prev,
                    [type]: variant.value,
                  }))
                }
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                  selectedVariants[type] === variant.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground/50',
                )}>
                {type === 'color' && (
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{backgroundColor: variant.value}}
                  />
                )}
                {variant.name}
                {variant.priceModifier > 0 && (
                  <span className="text-xs opacity-70">
                    +{formatPrice(variant.priceModifier)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Separator className="my-6" />

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Quantity */}
        <div className="flex items-center rounded-lg border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 text-lg font-medium transition-colors hover:bg-muted disabled:opacity-50"
            disabled={quantity <= 1}>
            −
          </button>
          <span className="min-w-[3rem] text-center font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-4 py-3 text-lg font-medium transition-colors hover:bg-muted disabled:opacity-50"
            disabled={quantity >= product.stock}>
            +
          </button>
        </div>

        {/* Add to Cart */}
        <Button
          size="lg"
          className="flex-1 gap-2"
          disabled={isOutOfStock}
          onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        {/* Wishlist & Compare */}
        <Button
          variant="outline"
          size="lg"
          className={cn(
            inWishlist &&
              'border-[oklch(0.55_0.2_25)] text-[oklch(0.55_0.2_25)]',
          )}
          onClick={handleWishlistToggle}>
          <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            inCompare && 'border-foreground bg-foreground text-background',
          )}
          onClick={() => addToCompare(product)}>
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Buy Now */}
      <Button
        variant="secondary"
        size="lg"
        className="mt-4 w-full"
        disabled={isOutOfStock}>
        Buy Now
      </Button>

      {/* Notify Product Button */}
      <Button
        variant="outline"
        size="lg"
        className="mt-3 w-full gap-2"
        onClick={() => setNotifyDialogOpen(true)}>
        <AlertCircle className="h-5 w-5" />
        Notify About Product
      </Button>

      <Separator className="my-6" />

      {/* Highlights */}
      <div>
        <h3 className="mb-3 font-semibold">Highlights</h3>
        <ul className="space-y-2">
          {product.highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.2_145)]" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <Separator className="my-6" />

      {/* Warranty & Delivery Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
          <Shield className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Warranty</p>
            <p className="text-xs text-muted-foreground">{product.warranty}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
          <Truck className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Free Delivery</p>
            <p className="text-xs text-muted-foreground">2-5 business days</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
          <RotateCcw className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Easy Returns</p>
            <p className="text-xs text-muted-foreground">7-day return policy</p>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-sm font-medium">Share:</span>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Notify Product Dialog */}
      <NotifyProductDialog
        product={product}
        open={notifyDialogOpen}
        onOpenChange={setNotifyDialogOpen}
      />
    </div>
  );
}
