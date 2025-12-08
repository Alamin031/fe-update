/**
 * Utility functions for product data handling
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Extract the default variant price from a product based on its type
 * 
 * @param product - Product object with type-specific structures
 * @returns Object with regularPrice and discountPrice
 */
export function getDefaultProductPrice(product: any): {
  regularPrice: number;
  discountPrice: number;
  hasDiscount: boolean;
  discount: number;
  stockQuantity: number;
} {
  const productType = product.productType || product.type || 'basic';
  
  let regularPrice = 0;
  let discountPrice = 0;
  let stockQuantity = 0;

  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && productType === 'region') {
    console.log('Region Product Debug:', {
      productId: product.id,
      productName: product.name,
      hasRegions: Array.isArray(product.regions),
      regionsCount: product.regions?.length,
      regions: product.regions,
    });
  }

  if (productType === 'network') {
    // Network products: Find default network and its default storage
    // If no default is set, fall back to the first network
    const defaultNetwork = Array.isArray(product.networks)
      ? product.networks.find((n: any) => n.isDefault) || product.networks[0]
      : null;

    if (defaultNetwork) {
      const defaultStorage = Array.isArray(defaultNetwork.defaultStorages)
        ? defaultNetwork.defaultStorages.find((s: any) => s.isDefault) || defaultNetwork.defaultStorages[0]
        : null;

      if (defaultStorage && defaultStorage.price) {
        // Handle both API formats: price.regular/discount and price.regularPrice/discountPrice
        regularPrice = Number(defaultStorage.price.regular || defaultStorage.price.regularPrice) || 0;
        discountPrice = Number(defaultStorage.price.discount || defaultStorage.price.discountPrice || defaultStorage.price.final) || 0;
        stockQuantity = Number(defaultStorage.price.stockQuantity || defaultStorage.stock) || 0;
      }
    }
  } else if (productType === 'region') {
    // Region products: Find default region and its default storage
    // If no default is set, fall back to the first region
    const defaultRegion = Array.isArray(product.regions)
      ? product.regions.find((r: any) => r.isDefault) || product.regions[0]
      : null;

    // Debug logging
    if (typeof window !== 'undefined') {
      console.log('Region Price Extraction:', {
        defaultRegion: defaultRegion,
        hasDefaultStorages: defaultRegion ? Array.isArray(defaultRegion.defaultStorages) : false,
        defaultStorages: defaultRegion?.defaultStorages,
      });
    }

    if (defaultRegion) {
      const defaultStorage = Array.isArray(defaultRegion.defaultStorages)
        ? defaultRegion.defaultStorages.find((s: any) => s.isDefault) || defaultRegion.defaultStorages[0]
        : null;

      // Debug logging
      if (typeof window !== 'undefined') {
        console.log('Default Storage Found:', {
          defaultStorage: defaultStorage,
          hasPrice: defaultStorage ? !!defaultStorage.price : false,
          price: defaultStorage?.price,
        });
      }

      if (defaultStorage && defaultStorage.price) {
        // Handle both API formats: price.regular/discount and price.regularPrice/discountPrice
        regularPrice = Number(defaultStorage.price.regular || defaultStorage.price.regularPrice) || 0;
        discountPrice = Number(defaultStorage.price.discount || defaultStorage.price.discountPrice || defaultStorage.price.final) || 0;
        stockQuantity = Number(defaultStorage.price.stockQuantity || defaultStorage.stock) || 0;
        
        // Debug logging
        if (typeof window !== 'undefined') {
          console.log('Extracted Prices:', { regularPrice, discountPrice, stockQuantity });
        }
      }
    }
  } else {
    // Basic products: Find default color
    // If no default is set, fall back to the first color
    const defaultColor = Array.isArray(product.directColors)
      ? product.directColors.find((c: any) => c.isDefault) || product.directColors[0]
      : null;

    if (defaultColor) {
      regularPrice = Number(defaultColor.regularPrice) || 0;
      discountPrice = Number(defaultColor.discountPrice) || 0;
      stockQuantity = Number(defaultColor.stockQuantity) || 0;
    }
  }

  // Fallback to legacy price fields if available
  if (regularPrice === 0 && discountPrice === 0) {
    regularPrice = Number(product.price) || Number(product.regularPrice) || 0;
    discountPrice = Number(product.discountPrice) || 0;
    stockQuantity = Number(product.stock) || Number(product.stockQuantity) || 0;
  }

  // If no discount price, use regular price
  if (discountPrice === 0) {
    discountPrice = regularPrice;
  }

  const hasDiscount = regularPrice > 0 && discountPrice > 0 && discountPrice < regularPrice;
  const discount = hasDiscount
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100)
    : Number(product.discountPercent) || 0;

  return {
    regularPrice,
    discountPrice,
    hasDiscount,
    discount,
    stockQuantity,
  };
}

/**
 * Get the display price for a product (uses discount price if available)
 */
export function getProductDisplayPrice(product: any): number {
  const { discountPrice } = getDefaultProductPrice(product);
  return discountPrice;
}

/**
 * Get product price based on selected price type from selectedVariants
 * Used for cart items where user selected offer or regular price
 */
export function getProductPriceWithType(product: any, selectedVariants?: Record<string, string>): number {
  const priceData = getDefaultProductPrice(product);
  const priceType = selectedVariants?.priceType;

  if (priceType === 'regular') {
    return priceData.regularPrice;
  }

  return priceData.discountPrice;
}

/**
 * Check if product is out of stock
 */
export function isProductOutOfStock(product: any): boolean {
  const { stockQuantity } = getDefaultProductPrice(product);
  return stockQuantity === 0;
}
