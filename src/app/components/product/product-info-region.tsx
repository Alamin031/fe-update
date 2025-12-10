/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {useState, useMemo, useEffect} from "react"
import {useRouter} from "next/navigation"
import {Heart, BarChart3, ShoppingCart, Share2, Shield, Truck, RotateCcw, Check, AlertCircle} from "lucide-react"
import {Button} from "../ui/button"
import {Badge} from "../ui/badge"
import {Separator} from "../ui/separator"
import {useCartStore} from "@/app/store/cart-store"
import {useWishlistStore} from "@/app/store/wishlist-store"
import {useCompareStore} from "@/app/store/compare-store"
import {formatPrice} from "@/app/lib/utils/format"
import {cn} from "@/app/lib/utils"
import {CarePlusAddon} from "./care-plus-addon"
import {NotifyProductDialog} from "./notify-product-dialog"
import {EmiOptionsModal} from "./emi-options-modal"
import {CarePlansDisplay} from "./care-plans-display"
import {careService, type ProductCarePlan} from "@/app/lib/api/services/care"
import {emiService, type EmiPlan} from "@/app/lib/api/services/emi"
import type {Product} from "@/app/types"

type Region = {
  id: string;
  name: string;
  colors?: Array<{id: string; name?: string; colorName?: string; image?: string; colorImage?: string; regularPrice?: number; discountPrice?: number; stockQuantity?: number; hasStorage?: boolean; useDefaultStorages?: boolean; storages?: Array<{id: string; storageSize?: string; price?: any; stock?: number}>}>;
  defaultStorages?: Array<{id: string; size: string; storageSize?: string; price: any; stock?: number}>;
};

type Network = {
  id: string;
  networkType: string;
  colors?: Array<{id: string; colorName: string; colorImage?: string; regularPrice?: number; discountPrice?: number; stockQuantity?: number; hasStorage?: boolean; useDefaultStorages?: boolean; storages?: Array<{id: string; storageSize?: string; price?: any; stock?: number}>}>;
  defaultStorages?: Array<{id: string; storageSize: string; price: any; stock?: number; isDefault?: boolean}>;
};

type ProductInfoRegionProps = {
  product: Product & {rawProduct?: {regions?: Region[]; networks?: Network[]; [key: string]: any}; productType?: string};
  onColorChange?: (colorImage: string | null) => void;
};

export function ProductInfoRegion({product, onColorChange}: ProductInfoRegionProps) {
  const router = useRouter()
  const rawProduct = product.rawProduct

  const [quantity, setQuantity] = useState(1)
  const [carePlusSelected, setCarePlusSelected] = useState(false)
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false)
  const [emiModalOpen, setEmiModalOpen] = useState(false)
  const [selectedPriceType, setSelectedPriceType] = useState<'offer' | 'regular'>('offer')
  const [carePlans, setCarePlans] = useState<ProductCarePlan[]>([])
  const [selectedCarePlanId, setSelectedCarePlanId] = useState<string>("")
  const [loadingCarePlans, setLoadingCarePlans] = useState(false)
  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>([])
  const [loadingEmiPlans, setLoadingEmiPlans] = useState(false)

  // Region-based state
  const [selectedRegionId, setSelectedRegionId] = useState<string>('')
  const [selectedColorId, setSelectedColorId] = useState<string>('')
  const [selectedStorageId, setSelectedStorageId] = useState<string>('')

  const addToCart = useCartStore((state) => state.addItem)
  const {addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist} = useWishlistStore()
  const {addItem: addToCompare, isInCompare} = useCompareStore()

  // Fetch care plans if isCare is true
  useEffect(() => {
    const fetchCarePlans = async () => {
      if (rawProduct?.isCare && product.id) {
        try {
          setLoadingCarePlans(true)
          const plans = await careService.getByProduct(product.id)
          setCarePlans(plans)
          if (plans.length > 0) {
            setSelectedCarePlanId(plans[0].id)
          }
        } catch (error) {
          console.error("Error fetching care plans:", error)
        } finally {
          setLoadingCarePlans(false)
        }
      }
    }
    fetchCarePlans()
  }, [product.id, rawProduct?.isCare])

  // Fetch EMI plans if isEmi is true
  useEffect(() => {
    const fetchEmiPlans = async () => {
      if (rawProduct?.isEmi && emiPlans.length === 0) {
        try {
          setLoadingEmiPlans(true)
          const plans = await emiService.getPlans()
          console.log("Fetched EMI plans:", plans)
          setEmiPlans(plans)
        } catch (error) {
          console.error("Error fetching EMI plans:", error)
          setEmiPlans([])
        } finally {
          setLoadingEmiPlans(false)
        }
      }
    }
    fetchEmiPlans()
  }, [rawProduct?.isEmi, emiPlans.length])

  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  // Region/Network-based logic
  const isNetworkProduct = rawProduct?.productType === 'network';
  const isBasicProduct = rawProduct?.productType === 'basic';

  // Parse regions/networks data
  const regions: Region[] = useMemo(() => {
    if (isNetworkProduct && rawProduct?.networks) {
      // Network type: use networks array
      return rawProduct.networks.map((n: Network) => ({
        id: n.id,
        name: n.networkType?.trim() || 'Network',
        networkType: n.networkType?.trim() || '',
        colors: (n.colors || []).map((color: any) => ({
          id: color.id,
          name: color.colorName?.trim() || 'Color',
          colorName: color.colorName?.trim() || '',
          colorImage: color.colorImage,
          image: color.colorImage,
          regularPrice: color.regularPrice,
          discountPrice: color.discountPrice,
          stockQuantity: color.stockQuantity,
          hasStorage: color.hasStorage,
          useDefaultStorages: color.useDefaultStorages,
        })),
        defaultStorages: (n.defaultStorages || []).map((storage: any) => ({
          id: storage.id,
          size: storage.storageSize?.trim() || '',
          storageSize: storage.storageSize?.trim() || '',
          price: storage.price,
          stock: storage.price?.stockQuantity,
          isDefault: storage.isDefault,
        })),
      }));
    } else if (isBasicProduct && rawProduct?.directColors) {
      // Basic type: use directColors
      return [{
        id: "default",
        name: "Default",
        colors: rawProduct.directColors.map((color: any) => ({
          id: color.id,
          name: color.colorName?.trim() || 'Color',
          colorName: color.colorName?.trim() || '',
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
        }],
      }];
    } else if (rawProduct?.regions) {
      // Region type: use regions array
      return rawProduct.regions.map((r: any) => ({
        id: r.id,
        name: r.regionName?.trim() || r.name?.trim() || 'Region',
        colors: (r.colors || []).map((color: any) => ({
          id: color.id,
          name: color.colorName?.trim() || 'Color',
          colorName: color.colorName?.trim() || '',
          colorImage: color.colorImage,
          image: color.colorImage,
          regularPrice: color.regularPrice,
          discountPrice: color.discountPrice,
          stockQuantity: color.stockQuantity,
          hasStorage: color.hasStorage,
          useDefaultStorages: color.useDefaultStorages,
          storages: color.storages || [],
        })),
        defaultStorages: (r.defaultStorages || []).map((storage: any) => ({
          id: storage.id,
          size: storage.storageSize?.trim() || '',
          storageSize: storage.storageSize?.trim() || '',
          price: storage.price,
          stock: storage.stock,
          isDefault: storage.isDefault,
        })),
      }));
    }
    return [];
  }, [rawProduct, isNetworkProduct, isBasicProduct]);

  // Get selected region
  const selectedRegion = useMemo(() => {
    if (selectedRegionId) {
      return regions.find(r => r.id === selectedRegionId);
    }
    return regions[0] || null;
  }, [regions, selectedRegionId]);

  // Get colors for selected region
  const colors = useMemo(() => {
    if (!selectedRegion) return [];
    return (selectedRegion.colors || []).map((color: any) => {
      // Fix: prefer color.colorImage, fallback to color.image, and prefer color.colorName, fallback to color.name
      const colorImage = color.colorImage || color.image || null;
      const colorName = color.colorName && color.colorName.trim() ? color.colorName.trim() : (color.name && color.name.trim() ? color.name.trim() : 'Color');
      return {
        id: color.id,
        name: colorName,
        image: colorImage,
        regularPrice: color.regularPrice,
        discountPrice: color.discountPrice,
        stockQuantity: color.stockQuantity,
        hasStorage: color.hasStorage,
        useDefaultStorages: color.useDefaultStorages,
        storages: color.storages || [],
      };
    });
  }, [selectedRegion]);

  // Get selected color
  const selectedColor = useMemo(() => {
    if (selectedColorId) {
      return colors.find(c => c.id === selectedColorId);
    }
    return colors[0] || null;
  }, [colors, selectedColorId]);

  // Get storages for selected region
  const storages = useMemo(() => {
    if (!selectedRegion) return [];
    
    // Check if selected color has storage or uses default storages
    if (selectedColor) {
      if (selectedColor.hasStorage === false) {
        return []; // This color has no storage options
      }
      if (selectedColor.useDefaultStorages === false && selectedColor.storages) {
        // Use color-specific storages
        return (selectedColor.storages || []).map((storage: any) => ({
          id: storage.id,
          size: storage.storageSize?.trim() || '',
          price: storage.price,
          stock: storage.price?.stockQuantity,
        }));
      }
    }
    
    // Use region's default storages
    return (selectedRegion.defaultStorages || []).map((storage: any) => ({
      id: storage.id,
      size: storage.storageSize?.trim() || storage.size?.trim() || '',
      price: storage.price,
      stock: storage.stock || storage.price?.stockQuantity,
      isDefault: storage.isDefault,
    }));
  }, [selectedRegion, selectedColor]);

  // Get selected storage
  const selectedStorage = useMemo(() => {
    if (selectedStorageId) {
      return storages.find((s: { id: string }) => s.id === selectedStorageId);
    }
    
    // Try to find default storage
    const defaultStorage = storages.find((s: { id: string; isDefault?: boolean }) => s.isDefault);
    return defaultStorage || storages[0] || null;
  }, [storages, selectedStorageId]);

  // Price and stock calculation
  const priceData = useMemo(() => {
    let regular = 0;
    let discount = 0;
    let stock = 0;

    // First check storage price
    if (selectedStorage?.price) {
      const price = selectedStorage.price;
      regular = Number(price.regularPrice || price.regular) || 0;
      discount = Number(price.discountPrice || price.discount || price.final) || 0;
      stock = Number(price.stockQuantity || selectedStorage.stock) || 0;
    }
    // Fallback to color price
    else if (selectedColor) {
      regular = Number(selectedColor.regularPrice) || 0;
      discount = Number(selectedColor.discountPrice) || 0;
      stock = Number(selectedColor.stockQuantity) || 0;
    }
    // Fallback to product price
    else {
      regular = Number(product.price) || 0;
      discount = Number(product.comparePrice) || 0;
      stock = Number(product.stockQuantity) || 0;
    }

    const hasDiscount = regular > 0 && discount > 0 && discount < regular;
    const discountPercent = hasDiscount ? Math.round(((regular - discount) / regular) * 100) : 0;

    return {
      regularPrice: regular,
      discountPrice: discount,
      hasDiscount,
      discount: discountPercent,
      stock,
      inStock: stock > 0,
    };
  }, [selectedColor, selectedStorage, product]);

  const selectedPrice = selectedPriceType === 'regular' ? priceData.regularPrice : (priceData.discountPrice > 0 ? priceData.discountPrice : priceData.regularPrice)
  const carePlusPrice = carePlusSelected ? Math.round(selectedPrice * 0.08) : 0
  const isOutOfStock = !priceData.inStock

  // Initialize selections
  useEffect(() => {
    if (regions.length > 0 && !selectedRegionId) {
      setSelectedRegionId(regions[0].id);
    }
  }, [regions, selectedRegionId]);

  useEffect(() => {
    if (colors.length > 0 && !selectedColorId) {
      const defaultColor = colors.find(c => c.id === (selectedRegion?.colors?.[0]?.id || ''));
      setSelectedColorId(defaultColor?.id || colors[0].id);
    }
  }, [colors, selectedColorId, selectedRegion]);

  useEffect(() => {
    if (storages.length > 0 && !selectedStorageId) {
      const defaultStorage = storages.find((s: { id: string; isDefault?: boolean }) => s.isDefault);
      setSelectedStorageId(defaultStorage?.id || storages[0].id);
    }
  }, [storages, selectedStorageId]);

  // Handle color change and update image
  useEffect(() => {
    if (selectedColor?.image && onColorChange) {
      onColorChange(selectedColor.image);
    }
  }, [selectedColor, onColorChange]);

  const handleAddToCart = () => {
    if (!isOutOfStock && selectedRegion && selectedColor && selectedStorage) {
      addToCart(product, quantity, {
        region: selectedRegion.id,
        regionName: selectedRegion.name,
        color: selectedColor.id,
        colorName: selectedColor.name,
        storage: selectedStorage.id,
        storageName: selectedStorage.size,
        priceType: selectedPriceType,
      })
    }
  }

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleAddToCompareAndNavigate = () => {
    addToCompare(product)
    router.push("/compare")
  }

  // Debug logging
  useEffect(() => {
    console.log('Selected Region:', selectedRegion);
    console.log('Selected Color:', selectedColor);
    console.log('Selected Storage:', selectedStorage);
    console.log('Colors:', colors);
    console.log('Storages:', storages);
  }, [selectedRegion, selectedColor, selectedStorage, colors, storages]);

  return (
    <div className="flex flex-col space-y-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {product.brand && (
            <a
              href={`/brand/${product.brand.slug}`}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {product.brand.name}
            </a>
          )}
          <h1 className="text-4xl font-bold tracking-tight mt-2 leading-tight">{product.name}</h1>
          {rawProduct?.shortDescription && (
            <div
              className="mt-4 text-sm text-foreground leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
              dangerouslySetInnerHTML={{__html: rawProduct.shortDescription}}
              suppressHydrationWarning
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted shrink-0"
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              inWishlist && "fill-red-500 text-red-500"
            )}
          />
        </Button>
      </div>

      {/* Rating & Stock Status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {product.rating > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({length: 5}).map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted",
                    )}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}
        </div>

        <div suppressHydrationWarning>
          {isOutOfStock ? (
            <Badge variant="secondary" className="bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400">
              Out of Stock
            </Badge>
          ) : priceData.stock <= 10 ? (
            <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400">
              Only {priceData.stock} left
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Check className="mr-1.5 h-3 w-3" /> In Stock
            </Badge>
          )}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Price Section */}
      <div className="space-y-4">
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-bold tracking-tight">{formatPrice(priceData.hasDiscount ? priceData.discountPrice : priceData.regularPrice)}</div>
          {priceData.hasDiscount && (
            <>
              <div className="text-xl text-muted-foreground line-through">{formatPrice(priceData.regularPrice)}</div>
              <Badge variant="secondary" className="bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold">
                -{priceData.discount}%
              </Badge>
            </>
          )}
        </div>
        {priceData.hasDiscount && (
          <p className="text-sm text-muted-foreground">Save {formatPrice(priceData.regularPrice - priceData.discountPrice)}</p>
        )}
      </div>

      <Separator className="my-2" />

      {/* Region/Network Selection */}
      {regions.length > 0 && (
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-foreground" suppressHydrationWarning>
            {isNetworkProduct ? 'NETWORK' : 'VARIANT'}
          </label>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => {
              const regionName = region.name && region.name.trim() ? region.name.trim() : '';
              return (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegionId(region.id);
                    setSelectedColorId('');
                    setSelectedStorageId('');
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                    selectedRegionId === region.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/30 hover:bg-muted/50",
                  )}
                >
                  {regionName || 'Option'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold uppercase tracking-wider text-foreground">
              COLOR
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedColor?.name || 'Select a color'}
              {selectedColor && selectedColor.stockQuantity !== undefined && (
                <span className="ml-2 text-xs">
                  ({selectedColor.stockQuantity} in stock)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const colorName = color.name && color.name.trim() ? color.name.trim() : 'Color';
              const colorImage = color.image;
              return (
                <button
                  key={color.id}
                  onClick={() => {
                    setSelectedColorId(color.id);
                    if (onColorChange && colorImage) {
                      onColorChange(colorImage);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-2 transition-all duration-200",
                    selectedColorId === color.id ? "ring-2 ring-foreground ring-offset-2" : "hover:ring-1 hover:ring-muted-foreground",
                  )}
                  title={colorName}
                >
                  {colorImage ? (
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted border border-border">
                      <img
                        src={colorImage}
                        alt={colorName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-color.png';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted border border-border flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                  <span className="text-xs font-medium text-center max-w-[70px] truncate">{colorName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Storage Selection */}
      {storages.length > 0 && (
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-foreground">
            STORAGE
          </label>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage: any) => {
              const storageSize = storage.size && typeof storage.size === 'string' ? storage.size.trim() : 'Storage';
              const price = storage.price;
              const regularPrice = price?.regularPrice || 0;
              const discountPrice = price?.discountPrice || 0;
              const hasDiscount = regularPrice > 0 && discountPrice > 0 && discountPrice < regularPrice;
              return (
                <button
                  key={storage.id}
                  onClick={() => setSelectedStorageId(storage.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border-2 text-left transition-all duration-200 min-w-[120px]",
                    selectedStorageId === storage.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/30 hover:bg-muted/50",
                  )}
                >
                  <div className="font-medium">{storageSize}</div>
                  {hasDiscount ? (
                    <>
                      <div className="text-sm font-bold">{formatPrice(discountPrice)}</div>
                      <div className="text-xs text-muted-foreground line-through">{formatPrice(regularPrice)}</div>
                    </>
                  ) : regularPrice > 0 ? (
                    <div className="text-sm font-bold">{formatPrice(regularPrice)}</div>
                  ) : null}
                  {typeof storage.stock === 'number' && (
                    <div className="text-xs mt-1">
                      {storage.stock <= 10 ? `Only ${storage.stock} left` : 'In stock'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* Quantity Selector & Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Quantity Control */}
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2.5 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="min-w-12 text-center font-semibold">{quantity}</div>
            <button
              onClick={() => setQuantity(Math.min(priceData.stock, quantity + 1))}
              className="px-4 py-2.5 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              disabled={quantity >= priceData.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Wishlist & Compare Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-lg"
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-5 w-5", inWishlist && "fill-current text-red-500")} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-lg"
            onClick={() => addToCompare(product)}
            aria-label="Add to compare"
          >
            <BarChart3 className={cn("h-5 w-5", inCompare && "text-blue-600")} />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          className={cn(
            "w-full h-12 text-base font-semibold rounded-lg transition-all duration-200",
            isOutOfStock && "opacity-60 cursor-not-allowed"
          )}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        {/* Buy Now Button */}
        <Button
          variant="secondary"
          size="lg"
          className="w-full h-12 text-base font-semibold rounded-lg"
          disabled={isOutOfStock}
        >
          Buy Now
        </Button>
      </div>

      {/* Delivery & Support Info */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
          <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery</p>
            <p className="text-sm font-medium mt-1">{rawProduct?.delivery || "2-5 days"}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
          <RotateCcw className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return</p>
            <p className="text-sm font-medium mt-1">{rawProduct?.easyReturns || "7-day policy"}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
          <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warranty</p>
            <p className="text-sm font-medium mt-1">{product.warranty || rawProduct?.warranty || "No warranty"}</p>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Price Type Selection */}
      {priceData.hasDiscount && (
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Options</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPriceType('offer')}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                selectedPriceType === 'offer'
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-border hover:border-border/70 hover:bg-muted/50",
              )}
            >
              <div className="text-xs text-muted-foreground font-medium mb-2">Offer Price</div>
              <div className="text-xl font-bold text-emerald-600">{formatPrice(priceData.hasDiscount ? priceData.discountPrice : priceData.regularPrice)}</div>
            </button>

            <button
              onClick={() => setSelectedPriceType('regular')}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                selectedPriceType === 'regular'
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-border/70 hover:bg-muted/50",
              )}
            >
              <div className="text-xs text-muted-foreground font-medium mb-2">Regular Price</div>
              <div className="text-xl font-bold">{formatPrice(priceData.regularPrice)}</div>
              {rawProduct?.isEmi && emiPlans.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">EMI from BDT {Math.round(priceData.regularPrice / 12)}/mo</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Care Plans */}
      {rawProduct?.isCare && (
        <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/30">
          {loadingCarePlans ? (
            <p className="text-sm text-muted-foreground">Loading care plans...</p>
          ) : (
            <CarePlansDisplay
              carePlans={carePlans}
              selectedPlanId={selectedCarePlanId}
              onSelectPlan={setSelectedCarePlanId}
            />
          )}
        </div>
      )}

      {/* Care+ Add-on */}
      <CarePlusAddon
        basePrice={priceData.discountPrice}
        selected={carePlusSelected}
        onToggle={() => setCarePlusSelected(!carePlusSelected)}
      />

      {/* EMI Modal */}
      <EmiOptionsModal
        open={emiModalOpen}
        onOpenChange={setEmiModalOpen}
        plans={emiPlans}
        price={priceData.regularPrice}
        isLoading={loadingEmiPlans}
        onOpen={async () => {
          if (emiPlans.length === 0 && rawProduct?.isEmi) {
            try {
              setLoadingEmiPlans(true)
              const plans = await emiService.getPlans()
              setEmiPlans(plans)
            } catch (error) {
              console.error("Error fetching EMI plans:", error)
              setEmiPlans([])
            } finally {
              setLoadingEmiPlans(false)
            }
          }
        }}
      />

      {/* Additional Actions */}
      <div className="flex gap-3 pt-4" suppressHydrationWarning>
        {isOutOfStock && (
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
            onClick={() => setNotifyDialogOpen(true)}
          >
            <AlertCircle className="h-4 w-4" />
            Notify Me
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2"
          onClick={handleAddToCompareAndNavigate}
        >
          <BarChart3 className="h-4 w-4" />
          Compare
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-lg"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Notify Product Dialog */}
      <NotifyProductDialog
        product={product}
        open={notifyDialogOpen}
        onOpenChange={setNotifyDialogOpen}
      />
    </div>
  )
}
