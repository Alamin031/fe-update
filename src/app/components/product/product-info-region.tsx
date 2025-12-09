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
import {EmiTable} from "./emi-table"
import {EmiOptionsModal} from "./emi-options-modal"
import {CarePlansDisplay} from "./care-plans-display"
import {careService, type ProductCarePlan} from "@/app/lib/api/services/care"
import {emiService, type EmiPlan} from "@/app/lib/api/services/emi"
import type {Product} from "@/app/types"
import Image from "next/image"

type Region = {
  id: string;
  name: string;
  colors?: Array<{id: string; name: string; image?: string}>;
  defaultStorages?: Array<{id: string; size: string; price: any; stock?: number}>;
};
type ProductInfoRegionProps = {
  product: Product & {rawProduct?: {regions?: Region[]; [key: string]: any}; productType?: string};
};

export function ProductInfoRegion({product}: ProductInfoRegionProps) {
  const router = useRouter()
  const rawProduct = product.rawProduct
  // const productType = product.productType || 'basic' // unused

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

  // Fetch EMI plans if isEmi is true (lazy loaded on scroll/interaction)
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
    // Only fetch when user opens EMI modal (not on page load)
    // This is handled by onOpenChange in EmiTable
  }, [rawProduct?.isEmi, emiPlans.length])

  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  // Region-based logic
  const regions: Region[] = rawProduct?.regions || [];
  const selectedRegion = selectedRegionId
    ? regions.find((r: Region) => r.id === selectedRegionId)
    : regions[0];

  const colors: Array<{id: string; name: string; image?: string}> = selectedRegion?.colors || [];
  const selectedColor = selectedColorId
    ? colors.find((c: {id: string; name: string; image?: string}) => c.id === selectedColorId)
    : colors[0];

  const storages: Array<{id: string; size: string; price: any; stock?: number}> = selectedRegion?.defaultStorages || [];
  const selectedStorage = selectedStorageId
    ? storages.find((s: {id: string; size: string; price: any; stock?: number}) => s.id === selectedStorageId)
    : storages[0];

  // Price and stock calculation
  const priceData = useMemo(() => {
    if (!selectedStorage?.price) {
      return {
        regularPrice: 0,
        discountPrice: 0,
        hasDiscount: false,
        discount: 0,
        stock: 0,
        inStock: false,
      }
    }

    const price = selectedStorage.price
    const regular = Number(price.regular || price.regularPrice) || 0
    const discount = Number(price.discount || price.discountPrice || price.final) || 0
    const stock = Number(selectedStorage.stock) || 0

    const hasDiscount = regular > 0 && discount > 0 && discount < regular
    const discountPercent = hasDiscount ? Math.round(((regular - discount) / regular) * 100) : 0

    return {
      regularPrice: regular,
      discountPrice: discount,
      hasDiscount,
      discount: discountPercent,
      stock,
      inStock: stock > 0,
    }
  }, [selectedStorage])

  const selectedPrice = selectedPriceType === 'regular' ? priceData.regularPrice : priceData.discountPrice
  const carePlusPrice = carePlusSelected ? Math.round(selectedPrice * 0.08) : 0
  const totalPrice = selectedPrice + carePlusPrice
  const isOutOfStock = !priceData.inStock

  // Initialize selections
  useEffect(() => {
    if (!selectedRegionId && regions.length > 0) {
      setSelectedRegionId(regions[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions])

  useEffect(() => {
    if (!selectedColorId && colors.length > 0) {
      setSelectedColorId(colors[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors])

  useEffect(() => {
    if (!selectedStorageId && storages.length > 0) {
      setSelectedStorageId(storages[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storages])

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
              className="mt-3 text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{__html: rawProduct.shortDescription}}
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

      <Separator className="my-2" />

      {/* Price Section */}
      <div className="space-y-4">
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-bold tracking-tight">{formatPrice(priceData.discountPrice)}</div>
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

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Color
            </label>
            <p className="text-sm text-muted-foreground mt-1">{selectedColor?.name || 'Select a color'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((color: {id: string; name: string; image?: string}) => (
              <button
                key={color.id}
                onClick={() => setSelectedColorId(color.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl p-2 transition-all duration-200",
                  selectedColorId === color.id ? "ring-2 ring-foreground ring-offset-2" : "hover:ring-1 hover:ring-muted-foreground",
                )}
              >
                {color.image ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted border border-border">
                    <Image
                      src={color.image}
                      alt={color.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted border border-border" />
                )}
                <span className="text-xs font-medium text-center max-w-[70px]">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region Selection */}
      {regions.length > 1 && (
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {regions.map((region: Region) => (
              <button
                key={region.id}
                onClick={() => {
                  setSelectedRegionId(region.id)
                  setSelectedColorId('')
                  setSelectedStorageId('')
                }}
                className={cn(
                  "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                  selectedRegionId === region.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/30 hover:bg-muted/50",
                )}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Storage Selection */}
      {storages.length > 0 && (
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Storage
          </label>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage: {id: string; size: string; price: any; stock?: number}) => (
              <button
                key={storage.id}
                onClick={() => setSelectedStorageId(storage.id)}
                className={cn(
                  "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                  selectedStorageId === storage.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/30 hover:bg-muted/50",
                )}
              >
                {storage.size}
              </button>
            ))}
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
            <p className="text-sm font-medium mt-1">2-5 days</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
          <RotateCcw className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return</p>
            <p className="text-sm font-medium mt-1">7-day policy</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors">
          <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warranty</p>
            <p className="text-sm font-medium mt-1">{product.warranty}</p>
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
              <div className="text-xl font-bold text-emerald-600">{formatPrice(priceData.discountPrice)}</div>
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
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2"
          onClick={() => setNotifyDialogOpen(true)}
        >
          <AlertCircle className="h-4 w-4" />
          Notify Me
        </Button>
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
