/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Transforms API product response to the format expected by ViewProductModal
 */
export function transformProductForModal(product: any) {
  if (!product) return null;

  // Transform images: imageUrl -> url
  const images = product.images?.map((img: any) => ({
    id: img.id,
    url: img.imageUrl || img.url,
    isThumbnail: img.isThumbnail,
    altText: img.altText,
  })) || [];

  // Transform networks
  const networks = product.networks?.map((network: any) => ({
    id: network.id,
    name: network.networkType || network.name,
    isDefault: network.isDefault,
    priceAdjustment: network.priceAdjustment,
    
    // Transform default storages
    defaultStorages: network.defaultStorages?.map((storage: any) => ({
      id: storage.id,
      size: storage.storageSize || storage.size,
      price: {
        regular: storage.price?.regularPrice || storage.price?.regular,
        compare: storage.price?.comparePrice || storage.price?.compare,
        discount: storage.price?.discountPrice || storage.price?.discount,
        discountPercent: storage.price?.discountPercent,
        final: storage.price?.discountPrice || storage.price?.final,
        stockQuantity: storage.price?.stockQuantity,
        lowStockAlert: storage.price?.lowStockAlert,
      },
      stock: storage.price?.stockQuantity || storage.stock,
      inStock: (storage.price?.stockQuantity || storage.stock || 0) > 0,
    })) || [],

    // Transform colors
    colors: network.colors?.map((color: any) => ({
      id: color.id,
      name: color.colorName || color.name,
      image: color.colorImage || color.image,
      hasStorage: color.hasStorage,
      useDefaultStorages: color.useDefaultStorages,
      regularPrice: color.regularPrice || color.price?.regularPrice,
      discountPrice: color.discountPrice || color.price?.discountPrice,
      stockQuantity: color.stockQuantity || color.stock,
      features: color.features,
    })) || [],
  })) || [];

  // Transform regions
  const regions = product.regions?.map((region: any) => ({
    id: region.id,
    name: region.regionName || region.name,
    isDefault: region.isDefault,
    
    // Transform default storages
    defaultStorages: region.defaultStorages?.map((storage: any) => ({
      id: storage.id,
      size: storage.storageSize || storage.size,
      price: {
        regular: storage.price?.regularPrice || storage.price?.regular,
        compare: storage.price?.comparePrice || storage.price?.compare,
        discount: storage.price?.discountPrice || storage.price?.discount,
        discountPercent: storage.price?.discountPercent,
        final: storage.price?.discountPrice || storage.price?.final,
      },
      stock: storage.price?.stockQuantity || storage.stock,
      inStock: (storage.price?.stockQuantity || storage.stock || 0) > 0,
    })) || [],

    // Transform colors
    colors: region.colors?.map((color: any) => ({
      id: color.id,
      name: color.colorName || color.name,
      image: color.colorImage || color.image,
      hasStorage: color.hasStorage,
      useDefaultStorages: color.useDefaultStorages,
      regularPrice: color.regularPrice || color.price?.regularPrice,
      discountPrice: color.discountPrice || color.price?.discountPrice,
      stockQuantity: color.stockQuantity || color.stock,
      features: color.features,
    })) || [],
  })) || [];

  // Transform direct colors for basic products
  const directColors = product.directColors?.map((color: any) => ({
    id: color.id,
    name: color.colorName || color.name,
    image: color.colorImage || color.image,
    hasStorage: color.hasStorage,
    regularPrice: color.regularPrice || color.price?.regularPrice,
    discountPrice: color.discountPrice || color.price?.discountPrice,
    stockQuantity: color.stockQuantity || color.stock,
    features: color.features,
  })) || [];

  // Transform specifications
  const specifications = product.specifications?.map((spec: any) => ({
    key: spec.specKey || spec.key,
    value: spec.specValue || spec.value,
    displayOrder: spec.displayOrder,
  })) || [];

  // Transform categories
  const categories = product.categories?.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  })) || [];

  // Transform brands
  const brands = product.brands?.map((brand: any) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
  })) || [];

  // Calculate total stock
  let totalStock = product.totalStock || product.stockQuantity || 0;
  if (!totalStock && networks.length > 0) {
    totalStock = networks.reduce((sum: number, net: any) => {
      const netStock = net.defaultStorages?.reduce((s: number, storage: any) => s + (storage.stock || 0), 0) || 0;
      return sum + netStock;
    }, 0);
  }

  // Calculate price range for network/region products
  let priceRange = product.priceRange;
  if (!priceRange) {
    if (networks.length > 0) {
      const allPrices = networks
        .flatMap(net => net.defaultStorages)
        .map(storage => storage.price?.discount || storage.price?.regular || 0)
        .filter(p => p > 0);
      
      if (allPrices.length > 0) {
        priceRange = {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices),
          currency: 'BDT',
        };
      }
    }
    
    if (!priceRange && regions.length > 0) {
      const allPrices = regions
        .flatMap(reg => reg.defaultStorages)
        .map(storage => storage.price?.discount || storage.price?.regular || 0)
        .filter(p => p > 0);
      
      if (allPrices.length > 0) {
        priceRange = {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices),
          currency: 'BDT',
        };
      }
    }

    if (!priceRange && product.price) {
      priceRange = {
        min: product.price,
        max: product.price,
        currency: 'BDT',
      };
    }
  }

  return {
    ...product,
    images,
    networks,
    regions,
    directColors,
    specifications,
    categories,
    brands,
    totalStock,
    priceRange,
    seo: {
      title: product.seoTitle,
      description: product.seoDescription,
      keywords: product.seoKeywords,
      canonical: product.seoCanonical,
    },
  };
}
