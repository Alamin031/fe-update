"use client"

import {useState, useMemo, useEffect} from "react"
import {useRouter} from "next/navigation"
import {Heart, BarChart3, ShoppingCart, Share2, Shield, Truck, RotateCcw, Check, AlertCircle, ChevronDown} from "lucide-react"
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

interface ProductInfoRegionProps {
  product: Product & {rawProduct?: any; productType?: string}
}

export function ProductInfoRegion({product}: ProductInfoRegionProps) {
  const router = useRouter()
  const rawProduct = product.rawProduct
  const productType = product.productType || 'basic'

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
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)

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
      if (rawProduct?.isEmi) {
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
  }, [rawProduct?.isEmi])

  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  // Region-based logic
  const regions = rawProduct?.regions || []
  const selectedRegion = selectedRegionId
    ? regions.find((r: any) => r.id === selectedRegionId)
    : regions[0]

  const colors = selectedRegion?.colors || []
  const selectedColor = selectedColorId
    ? colors.find((c: any) => c.id === selectedColorId)
    : colors[0]

  const storages = selectedRegion?.defaultStorages || []
  const selectedStorage = selectedStorageId
    ? storages.find((s: any) => s.id === selectedStorageId)
    : storages[0]

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
  if (!selectedRegionId && regions.length > 0) {
    setSelectedRegionId(regions[0].id)
  }

  if (!selectedColorId && colors.length > 0) {
    setSelectedColorId(colors[0].id)
  }

  if (!selectedStorageId && storages.length > 0) {
    setSelectedStorageId(storages[0].id)
  }

  const handleAddToCart = () => {
    if (!isOutOfStock && selectedRegion && selectedColor && selectedStorage) {
      const cartItem = {
        ...product,
        selectedVariants: {
          region: selectedRegion.name,
          color: selectedColor.name,
          storage: selectedStorage.size,
        },
      }
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
    <div className="flex flex-col space-y-6">
      {/* Add to Compare Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleAddToCompareAndNavigate}
        >
          <BarChart3 className="h-4 w-4" />
          Compare
        </Button>
      </div>

      {/* Brand & Title */}
      {product.brand && (
        <a
          href={`/brand/${product.brand.slug}`}
          className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {product.brand.name}
        </a>
      )}

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>

      {/* Rating & SKU */}
      {product.rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({length: 5}).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(product.rating)
                    ? "fill-[oklch(0.75_0.15_85)] text-[oklch(0.75_0.15_85)]"
                    : "fill-muted text-muted",
                )}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
        </div>
      )}

      {/* Stock Status Badge */}
      <div>
        {isOutOfStock ? (
          <Badge variant="secondary" className="bg-muted-foreground/10 text-muted-foreground">
            Out of Stock
          </Badge>
        ) : priceData.stock <= 10 ? (
          <Badge className="bg-[oklch(0.55_0.2_25)]/10 text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.55_0.2_25)]/10">
            Only {priceData.stock} left in stock
          </Badge>
        ) : (
          <Badge className="bg-[oklch(0.55_0.2_145)]/10 text-[oklch(0.45_0.2_145)] hover:bg-[oklch(0.55_0.2_145)]/10">
            <Check className="mr-1 h-3 w-3" /> In Stock
          </Badge>
        )}
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <label className="text-sm font-bold uppercase tracking-wide">
            Color: <span className="text-foreground">{selectedColor?.name || 'Select'}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color: any) => (
              <button
                key={color.id}
                onClick={() => setSelectedColorId(color.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all",
                  selectedColorId === color.id ? "border-foreground" : "border-border hover:border-foreground/50",
                )}
              >
                {color.image && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-background border border-border">
                    <Image
                      src={color.image}
                      alt={color.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-xs font-medium text-center max-w-[70px]">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region Selection */}
      {regions.length > 1 && (
        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <label className="text-sm font-bold uppercase tracking-wide">Region/Variant:</label>
          <div className="flex flex-wrap gap-2">
            {regions.map((region: any) => (
              <button
                key={region.id}
                onClick={() => {
                  setSelectedRegionId(region.id)
                  setSelectedColorId('')
                  setSelectedStorageId('')
                }}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                  selectedRegionId === region.id
                    ? "border-foreground bg-[oklch(0.8_0.1_45)]"
                    : "border-border hover:border-foreground/50",
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
        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <label className="text-sm font-bold uppercase tracking-wide">Storage:</label>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage: any) => (
              <button
                key={storage.id}
                onClick={() => setSelectedStorageId(storage.id)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                  selectedStorageId === storage.id
                    ? "border-foreground bg-[oklch(0.8_0.1_45)]"
                    : "border-border hover:border-foreground/50",
                )}
              >
                {storage.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-xs text-muted-foreground mb-2">Minimum Booking</div>
          <div className="text-sm font-bold">10,000 BDT</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-xs text-muted-foreground mb-2">Purchase Points</div>
          <div className="text-sm font-bold">1000 Points</div>
        </div>
        {rawProduct?.isEmi && (
          <button
            onClick={() => setEmiModalOpen(true)}
            className="bg-muted/50 p-4 rounded-lg text-center hover:bg-muted transition-colors"
          >
            <div className="text-xs text-muted-foreground mb-2">EMI Available</div>
            <div className="text-sm font-bold text-foreground hover:text-foreground">View Options</div>
          </button>
        )}
      </div>

      {/* Price Selection */}
      <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
        <label className="text-sm font-bold uppercase tracking-wide">Select Price Type:</label>
        <div className="grid grid-cols-2 gap-3">
          {/* Offer Price Option */}
          <button
            onClick={() => setSelectedPriceType('offer')}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selectedPriceType === 'offer'
                ? "border-[oklch(0.55_0.2_25)] bg-[oklch(0.55_0.2_25)]/5"
                : "border-border hover:border-border/70",
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs text-muted-foreground font-medium">Offer Price</div>
              <input
                type="radio"
                checked={selectedPriceType === 'offer'}
                onChange={() => setSelectedPriceType('offer')}
                className="cursor-pointer"
              />
            </div>
            <div className="text-xl font-bold text-[oklch(0.55_0.2_25)]">{formatPrice(priceData.discountPrice)}</div>
            <div className="text-xs text-muted-foreground mt-2">Cash/Card/MFS Payment</div>
          </button>

          {/* Regular Price Option */}
          <button
            onClick={() => setSelectedPriceType('regular')}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selectedPriceType === 'regular'
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-border/70",
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs text-muted-foreground font-medium">Regular Price</div>
              <input
                type="radio"
                checked={selectedPriceType === 'regular'}
                onChange={() => setSelectedPriceType('regular')}
                className="cursor-pointer"
              />
            </div>
            <div className="text-xl font-bold">{formatPrice(priceData.regularPrice)}</div>
            <div className="text-xs text-muted-foreground mt-2">EMI begin at BDT {Math.round(priceData.regularPrice / 12)}/month</div>
          </button>
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          {/* Quantity */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 text-lg font-medium transition-colors hover:bg-muted disabled:opacity-50"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="min-w-[3rem] text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(priceData.stock, quantity + 1))}
              className="px-4 py-2 text-lg font-medium transition-colors hover:bg-muted disabled:opacity-50"
              disabled={quantity >= priceData.stock}
            >
              +
            </button>
          </div>

          {/* Wishlist & Compare */}
          <Button
            variant="outline"
            size="lg"
            className={cn(inWishlist && "border-[oklch(0.55_0.2_25)] text-[oklch(0.55_0.2_25)]")}
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={cn(inCompare && "border-foreground bg-foreground text-background")}
            onClick={() => addToCompare(product)}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>

        {/* Add to Cart */}
        <Button size="lg" className="w-full gap-2" disabled={isOutOfStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        {/* Buy Now */}
        <Button variant="secondary" size="lg" className="w-full" disabled={isOutOfStock}>
          Buy Now
        </Button>

        {/* Notify Product Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={() => setNotifyDialogOpen(true)}
        >
          <AlertCircle className="h-5 w-5" />
          Notify About Product
        </Button>
      </div>

      <Separator className="my-4" />

      {/* EMI Options Modal Trigger */}
      <EmiOptionsModal
        open={emiModalOpen}
        onOpenChange={setEmiModalOpen}
        plans={emiPlans}
        price={priceData.regularPrice}
      />

      {/* Care Plans */}
      {rawProduct?.isCare && (
        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
          {loadingCarePlans ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading care plans...</p>
            </div>
          ) : (
            <CarePlansDisplay
              carePlans={carePlans}
              selectedPlanId={selectedCarePlanId}
              onSelectPlan={setSelectedCarePlanId}
            />
          )}
        </div>
      )}

      <Separator className="my-4" />

      {/* Care+ Add-on */}
      <CarePlusAddon
        basePrice={priceData.discountPrice}
        selected={carePlusSelected}
        onToggle={() => setCarePlusSelected(!carePlusSelected)}
      />

      <Separator className="my-4" />

      {/* Warranty & Delivery Info */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
          <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Warranty</p>
            <p className="text-sm font-semibold">{product.warranty}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
          <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Free Delivery</p>
            <p className="text-sm font-semibold">2-5 business days</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
          <RotateCcw className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Easy Returns</p>
            <p className="text-sm font-semibold">7-day return policy</p>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="flex items-center gap-3">
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
  )
}
