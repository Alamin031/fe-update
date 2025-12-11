/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import {useState, useEffect, useRef} from 'react';
import {toast} from 'sonner';
import {X, Plus, Upload} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Label} from '../../components/ui/label';
import {Textarea} from '../../components/ui/textarea';
import {Switch} from '../../components/ui/switch';
import {Checkbox} from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import productsService from '../../lib/api/services/products';
import categoriesService from '../../lib/api/services/categories';
import brandsService from '../../lib/api/services/brands';

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSuccess?: (updatedProduct: any) => void;
}

type ProductType = 'basic' | 'network' | 'region';

export function EditProductModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: EditProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productType, setProductType] = useState<ProductType>('basic');

  // Basic product info
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const shortDescriptionRef = useRef<HTMLDivElement>(null);
  const [productCode, setProductCode] = useState('');
  const [sku, setSku] = useState('');
  const [warranty, setWarranty] = useState('');

  // Category and Brand
  const [categories, setCategories] = useState<{id: string; name: string}[]>(
    [],
  );
  const [brands, setBrands] = useState<{id: string; name: string}[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Status flags
  const [isActive, setIsActive] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isPos, setIsPos] = useState(true);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [isEmi, setIsEmi] = useState(false);
  const [isCare, setIsCare] = useState(true);
  const [delivery, setDelivery] = useState('');
  const [easyReturns, setEasyReturns] = useState('');

  // Reward & Booking
  const [rewardPoints, setRewardPoints] = useState('');
  const [minBookingPrice, setMinBookingPrice] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoCanonical, setSeoCanonical] = useState('');
  const [tags, setTags] = useState('');

  // File uploads
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<
    Array<{
      url: string;
      altText: string;
      file?: File;
      id?: string;
    }>
  >([]);

  // Basic product colors
  const [basicColors, setBasicColors] = useState<
    Array<{
      id: string;
      colorName: string;
      colorImage: string;
      colorImageFile: File | null;
      regularPrice: string;
      discountPrice: string;
      discountPercent: string;
      stockQuantity: string;
      isDefault: boolean;
    }>
  >([]);

  // Videos
  const [videos, setVideos] = useState<any[]>([
    {id: 'video-1', url: '', type: 'youtube'},
  ]);

  // Specifications
  const [specifications, setSpecifications] = useState<any[]>([
    {id: 'spec-1', key: '', value: ''},
  ]);

  // Networks
  const [networks, setNetworks] = useState<any[]>([]);

  // Regions
  const [regions, setRegions] = useState<any[]>([]);
  const [ratingPoint, setRatingPoint] = useState(product?.ratingPoint || '');

  // Network helper functions
  const addNetwork = () => {
    setNetworks([
      ...networks,
      {
        id: `network-${Date.now()}`,
        networkType: '',
        isDefault: false,
        hasDefaultStorages: false,
        defaultStorages: [],
        colors: [],
      },
    ]);
  };

  const removeNetwork = (networkId: string) => {
    setNetworks(networks.filter(n => n.id !== networkId));
  };

  const updateNetwork = (networkId: string, field: string, value: any) => {
    setNetworks(prev =>
      prev.map(n => (n.id === networkId ? {...n, [field]: value} : n)),
    );
  };

  const addNetworkDefaultStorage = (networkId: string) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              defaultStorages: [
                ...n.defaultStorages,
                {
                  id: `ds-${Date.now()}`,
                  storageSize: '',
                  regularPrice: '',
                  discountPrice: '',
                  discountPercent: '',
                  stockQuantity: '',
                  lowStockAlert: '5',
                },
              ],
            }
          : n,
      ),
    );
  };

  const removeNetworkDefaultStorage = (
    networkId: string,
    storageId: string,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              defaultStorages: n.defaultStorages.filter(
                (s: any) => s.id !== storageId,
              ),
            }
          : n,
      ),
    );
  };

  const updateDefaultStorageInNetwork = (
    networkId: string,
    storageId: string,
    field: string,
    value: string,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              defaultStorages: n.defaultStorages.map((s: any) => {
                if (s.id === storageId) {
                  const updated = {...s, [field]: value};

                  // Auto-calculate discount price when discount percent or regular price changes
                  if (field === 'discountPercent' || field === 'regularPrice') {
                    const regularPrice =
                      field === 'regularPrice'
                        ? Number(value)
                        : Number(s.regularPrice);
                    const discountPercent =
                      field === 'discountPercent'
                        ? Number(value)
                        : Number(s.discountPercent);

                    if (regularPrice > 0 && discountPercent > 0) {
                      updated.discountPrice = Math.round(
                        regularPrice - (regularPrice * discountPercent) / 100,
                      ).toString();
                    }
                  }

                  return updated;
                }
                return s;
              }),
            }
          : n,
      ),
    );
  };

  const addNetworkColor = (networkId: string) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: [
                ...n.colors,
                {
                  id: `color-${Date.now()}`,
                  colorName: '',
                  colorImage: '',
                  colorImageFile: null,
                  hasStorage: false,
                  useDefaultStorages: false,
                  singlePrice: '',
                  singleComparePrice: '',
                  singleStockQuantity: '',
                  storages: [],
                },
              ],
            }
          : n,
      ),
    );
  };

  const removeNetworkColor = (networkId: string, colorId: string) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {...n, colors: n.colors.filter((c: any) => c.id !== colorId)}
          : n,
      ),
    );
  };

  const updateNetworkColor = (
    networkId: string,
    colorId: string,
    field: string,
    value: any,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map((c: any) =>
                c.id === colorId ? {...c, [field]: value} : c,
              ),
            }
          : n,
      ),
    );
  };

  const handleNetworkColorImageUpload = (
    networkId: string,
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNetworks(prev =>
          prev.map(n =>
            n.id === networkId
              ? {
                  ...n,
                  colors: n.colors.map((c: any) =>
                    c.id === colorId
                      ? {
                          ...c,
                          colorImage: reader.result as string,
                          colorImageFile: file,
                        }
                      : c,
                  ),
                }
              : n,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNetworkColorImage = (networkId: string, colorId: string) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map((c: any) =>
                c.id === colorId
                  ? {...c, colorImage: '', colorImageFile: null}
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  const addNetworkColorStorage = (networkId: string, colorId: string) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map((c: any) =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: [
                        ...c.storages,
                        {
                          id: `s-${Date.now()}`,
                          storageSize: '',
                          regularPrice: '',
                          discountPrice: '',
                          discountPercent: '',
                          stockQuantity: '',
                          lowStockAlert: '5',
                        },
                      ],
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  const removeNetworkColorStorage = (
    networkId: string,
    colorId: string,
    storageId: string,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map((c: any) =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.filter(
                        (s: any) => s.id !== storageId,
                      ),
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  const updateNetworkColorStorage = (
    networkId: string,
    colorId: string,
    storageId: string,
    field: string,
    value: string,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map((c: any) =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.map((s: any) => {
                        if (s.id === storageId) {
                          const updated = {...s, [field]: value};

                          // Auto-calculate discount price when discount percent or regular price changes
                          if (
                            field === 'discountPercent' ||
                            field === 'regularPrice'
                          ) {
                            const regularPrice =
                              field === 'regularPrice'
                                ? Number(value)
                                : Number(s.regularPrice);
                            const discountPercent =
                              field === 'discountPercent'
                                ? Number(value)
                                : Number(s.discountPercent);

                            if (regularPrice > 0 && discountPercent > 0) {
                              const discountPrice = Math.round(
                                regularPrice -
                                  (regularPrice * discountPercent) / 100,
                              );
                              updated.discountPrice = discountPrice.toString();
                            }
                          }

                          return updated;
                        }
                        return s;
                      }),
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  // Region helper functions
  const addRegion = () => {
    setRegions([
      ...regions,
      {
        id: `region-${Date.now()}`,
        regionName: '',
        isDefault: false,
        defaultStorages: [],
        colors: [],
      },
    ]);
  };

  const removeRegion = (regionId: string) => {
    setRegions(regions.filter(r => r.id !== regionId));
  };

  const updateRegion = (regionId: string, field: string, value: any) => {
    setRegions(prev =>
      prev.map(r => (r.id === regionId ? {...r, [field]: value} : r)),
    );
  };

  const addRegionDefaultStorage = (regionId: string) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: [
                ...r.defaultStorages,
                {
                  id: `ds-${Date.now()}`,
                  storageSize: '',
                  regularPrice: '',
                  discountPrice: '',
                  discountPercent: '',
                  stockQuantity: '',
                  lowStockAlert: '5',
                },
              ],
            }
          : r,
      ),
    );
  };

  const removeRegionDefaultStorage = (regionId: string, storageId: string) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.filter(
                (s: any) => s.id !== storageId,
              ),
            }
          : r,
      ),
    );
  };

  const updateDefaultStorageInRegion = (
    regionId: string,
    storageId: string,
    field: string,
    value: string,
  ) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.map((s: any) => {
                if (s.id === storageId) {
                  const updated = {...s, [field]: value};

                  // Auto-calculate discount price when discount percent or regular price changes
                  if (field === 'discountPercent' || field === 'regularPrice') {
                    const regularPrice =
                      field === 'regularPrice'
                        ? Number(value)
                        : Number(s.regularPrice);
                    const discountPercent =
                      field === 'discountPercent'
                        ? Number(value)
                        : Number(s.discountPercent);

                    if (regularPrice > 0 && discountPercent > 0) {
                      updated.discountPrice = Math.round(
                        regularPrice - (regularPrice * discountPercent) / 100,
                      ).toString();
                    }
                  }

                  return updated;
                }
                return s;
              }),
            }
          : r,
      ),
    );
  };

  const addRegionColor = (regionId: string) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: [
                ...r.colors,
                {
                  id: `color-${Date.now()}`,
                  colorName: '',
                  colorImage: '',
                  colorImageFile: null,
                  hasStorage: false,
                  useDefaultStorages: false,
                  singlePrice: '',
                  singleComparePrice: '',
                  singleStockQuantity: '',
                  storages: [],
                },
              ],
            }
          : r,
      ),
    );
  };

  const removeRegionColor = (regionId: string, colorId: string) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {...r, colors: r.colors.filter((c: any) => c.id !== colorId)}
          : r,
      ),
    );
  };

  const updateRegionColor = (
    regionId: string,
    colorId: string,
    field: string,
    value: any,
  ) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map((c: any) =>
                c.id === colorId ? {...c, [field]: value} : c,
              ),
            }
          : r,
      ),
    );
  };

  const handleRegionColorImageUpload = (
    regionId: string,
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegions(prev =>
          prev.map(r =>
            r.id === regionId
              ? {
                  ...r,
                  colors: r.colors.map((c: any) =>
                    c.id === colorId
                      ? {
                          ...c,
                          colorImage: reader.result as string,
                          colorImageFile: file,
                        }
                      : c,
                  ),
                }
              : r,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const removeRegionColorImage = (regionId: string, colorId: string) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map((c: any) =>
                c.id === colorId
                  ? {...c, colorImage: '', colorImageFile: null}
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const addRegionColorStorage = (regionId: string, colorId: string) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map((c: any) =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: [
                        ...c.storages,
                        {
                          id: `s-${Date.now()}`,
                          storageSize: '',
                          regularPrice: '',
                          discountPrice: '',
                          discountPercent: '',
                          stockQuantity: '',
                          lowStockAlert: '5',
                        },
                      ],
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const removeRegionColorStorage = (
    regionId: string,
    colorId: string,
    storageId: string,
  ) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map((c: any) =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.filter(
                        (s: any) => s.id !== storageId,
                      ),
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const updateRegionColorStorage = (
    regionId: string,
    colorId: string,
    storageId: string,
    field: string,
    value: string,
  ) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map((c: any) =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.map((s: any) => {
                        if (s.id === storageId) {
                          const updated = {...s, [field]: value};

                          // Auto-calculate discount price when discount percent or regular price changes
                          if (
                            field === 'discountPercent' ||
                            field === 'regularPrice'
                          ) {
                            const regularPrice =
                              field === 'regularPrice'
                                ? Number(value)
                                : Number(s.regularPrice);
                            const discountPercent =
                              field === 'discountPercent'
                                ? Number(value)
                                : Number(s.discountPercent);

                            if (regularPrice > 0 && discountPercent > 0) {
                              const discountPrice = Math.round(
                                regularPrice -
                                  (regularPrice * discountPercent) / 100,
                              );
                              updated.discountPrice = discountPrice.toString();
                            }
                          }

                          return updated;
                        }
                        return s;
                      }),
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  // Fetch categories and brands
  useEffect(() => {
    if (open) {
      categoriesService.getAll().then(data => {
        setCategories(data.map((c: any) => ({id: c.id, name: c.name})));
      });
      brandsService.findAll().then(data => {
        setBrands(data.map((b: any) => ({id: b.id, name: b.name})));
      });
    }
  }, [open]);

  // Initialize form with product data
  useEffect(() => {
    if (product && open) {
      let type: ProductType = 'basic';
      if (product.productType) {
        const pt = String(product.productType).toLowerCase();
        if (pt === 'network') type = 'network';
        else if (pt === 'region') type = 'region';
      }
      setProductType(type);

      setProductName(product.name || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setShortDescription(product.shortDescription || '');
      if (shortDescriptionRef.current) {
        shortDescriptionRef.current.innerHTML = product.shortDescription || '';
      }
      setProductCode(product.productCode || '');
      setSku(product.sku || '');
      setWarranty(product.warranty || '');

      setSelectedCategories(
        product.categoryIds || (product.categoryId ? [product.categoryId] : []),
      );
      setSelectedBrands(
        product.brandIds || (product.brandId ? [product.brandId] : []),
      );

      setIsActive(product.isActive === true || product.isActive === 'true');
      setIsOnline(product.isOnline === true || product.isOnline === 'true');
      setIsPos(product.isPos === true || product.isPos === 'true');
      setIsPreOrder(
        product.isPreOrder === true || product.isPreOrder === 'true',
      );
      setIsOfficial(
        product.isOfficial === true || product.isOfficial === 'true',
      );
      setFreeShipping(
        product.freeShipping === true || product.freeShipping === 'true',
      );
      setIsEmi(product.isEmi === true || product.isEmi === 'true');
      setIsCare(product.isCare === true || product.isCare === 'true');
      setDelivery(product.delivery || '');
      setEasyReturns(product.easyReturns || '');

      setRewardPoints(product.rewardPoints?.toString() || '');
      setMinBookingPrice(product.minBookingPrice?.toString() || '');

      setSeoTitle(product.seoTitle || product.seo?.title || '');
      setSeoDescription(
        product.seoDescription || product.seo?.description || '',
      );
      setSeoKeywords(
        Array.isArray(product.seoKeywords)
          ? product.seoKeywords.join(', ')
          : product.seoKeywords || product.seo?.keywords?.join(', ') || '',
      );
      setSeoCanonical(product.seoCanonical || product.seo?.canonical || '');
      setTags(
        Array.isArray(product.tags)
          ? product.tags.join(', ')
          : product.tags || '',
      );

      const thumbnail = product.images?.find((img: any) => img.isThumbnail);
      setThumbnailPreview(
        thumbnail?.imageUrl || thumbnail?.url || product.image || '',
      );
      setThumbnailFile(null);

      const gallery =
        product.images?.filter((img: any) => !img.isThumbnail) || [];
      setGalleryImagePreviews(
        gallery.map((img: any) => ({
          url: img.imageUrl || img.url,
          altText: img.altText || '',
          id: img.id,
        })),
      );
      setGalleryImageFiles([]);

      if (product.videos && product.videos.length > 0) {
        setVideos(
          product.videos.map((v: any, idx: number) => ({
            id: v.id || `video-${idx}`,
            url: v.videoUrl || v.url,
            type: v.videoType || v.type || 'youtube',
          })),
        );
      } else {
        setVideos([{id: 'video-1', url: '', type: 'youtube'}]);
      }

      if (product.specifications && product.specifications.length > 0) {
        setSpecifications(
          product.specifications.map((s: any, idx: number) => ({
            id: s.id || `spec-${idx}`,
            key: s.specKey || s.key,
            value: s.specValue || s.value,
          })),
        );
      } else {
        setSpecifications([{id: 'spec-1', key: '', value: ''}]);
      }

      if (type === 'basic') {
        if (product.directColors) {
          setBasicColors(
            product.directColors.map((c: any) => {
              const regularPrice = c.regularPrice ? Number(c.regularPrice) : 0;
              const discountPrice = c.discountPrice ? Number(c.discountPrice) : 0;
              let discountPercent = c.discountPercent ? Number(c.discountPercent) : 0;

              // Calculate discount percent if missing but we have both prices
              if (discountPercent === 0 && regularPrice > 0 && discountPrice > 0) {
                discountPercent = Math.round(
                  ((regularPrice - discountPrice) / regularPrice) * 100,
                );
              }

              return {
                ...c,
                id: c.id || `color-${Date.now()}-${Math.random()}`,
                colorName: c.colorName || c.name,
                colorImage: c.colorImage || c.image,
                regularPrice: regularPrice.toString(),
                discountPrice: discountPrice.toString(),
                discountPercent: discountPercent.toString(),
                stockQuantity: c.stockQuantity?.toString() || '',
                isDefault: c.isDefault || false,
              };
            }),
          );
        } else {
          setBasicColors([]);
        }
      } else if (type === 'network') {
        if (product.networks) {
          setNetworks(
            product.networks.map((n: any) => ({
              id: n.id || `network-${Date.now()}-${Math.random()}`,
              networkType: n.networkType || n.networkName || n.name,
              isDefault: n.isDefault || false,
              hasDefaultStorages:
                n.hasDefaultStorages !== false &&
                n.defaultStorages &&
                n.defaultStorages.length > 0,
              defaultStorages:
                n.defaultStorages?.map((s: any) => ({
                  id: s.id || `ds-${Date.now()}-${Math.random()}`,
                  storageSize: s.storageSize || '',
                  isDefault: s.isDefault || false,
                  regularPrice:
                    s.price?.regularPrice?.toString() ||
                    s.regularPrice?.toString() ||
                    '',
                  discountPrice:
                    s.price?.discountPrice?.toString() ||
                    s.discountPrice?.toString() ||
                    '',
                  discountPercent:
                    s.price?.discountPercent?.toString() ||
                    s.discountPercent?.toString() ||
                    '',
                  stockQuantity:
                    s.price?.stockQuantity?.toString() ||
                    s.stockQuantity?.toString() ||
                    '',
                  lowStockAlert:
                    s.price?.lowStockAlert?.toString() ||
                    s.lowStockAlert?.toString() ||
                    '5',
                })) || [],
              colors:
                n.colors?.map((c: any) => ({
                  id: c.id || `color-${Date.now()}-${Math.random()}`,
                  colorName: c.colorName || c.name,
                  colorImage: c.colorImage || c.image,
                  colorImageFile: null,
                  hasStorage: c.hasStorage !== false,
                  useDefaultStorages: c.useDefaultStorages !== false,
                  isDefault: c.isDefault || false,
                  singlePrice:
                    c.singlePrice?.toString() ||
                    c.regularPrice?.toString() ||
                    '',
                  singleComparePrice:
                    c.singleComparePrice?.toString() ||
                    c.comparePrice?.toString() ||
                    '',
                  singleStockQuantity:
                    c.singleStockQuantity?.toString() ||
                    c.stockQuantity?.toString() ||
                    '',
                  storages:
                    c.storages?.map((s: any) => ({
                      id: s.id || `s-${Date.now()}-${Math.random()}`,
                      storageSize: s.storageSize || '',
                      isDefault: s.isDefault || false,
                      regularPrice:
                        s.price?.regularPrice?.toString() ||
                        s.regularPrice?.toString() ||
                        '',
                      discountPrice:
                        s.price?.discountPrice?.toString() ||
                        s.discountPrice?.toString() ||
                        '',
                      discountPercent:
                        s.price?.discountPercent?.toString() ||
                        s.discountPercent?.toString() ||
                        '',
                      stockQuantity:
                        s.price?.stockQuantity?.toString() ||
                        s.stockQuantity?.toString() ||
                        '',
                      lowStockAlert:
                        s.price?.lowStockAlert?.toString() ||
                        s.lowStockAlert?.toString() ||
                        '5',
                    })) || [],
                })) || [],
            })),
          );
        } else {
          setNetworks([]);
        }
      } else if (type === 'region') {
        if (product.regions) {
          setRegions(
            product.regions.map((r: any) => ({
              ...r,
              id: r.id || `region-${Date.now()}-${Math.random()}`,
              regionName: r.regionName || r.name,
              defaultStorages:
                r.defaultStorages?.map((s: any) => ({
                  id: s.id || `ds-${Date.now()}-${Math.random()}`,
                  storageSize: s.storageSize || '',
                  isDefault: s.isDefault || false,
                  regularPrice:
                    s.price?.regularPrice?.toString() ||
                    s.regularPrice?.toString() ||
                    '',
                  discountPrice:
                    s.price?.discountPrice?.toString() ||
                    s.discountPrice?.toString() ||
                    '',
                  discountPercent:
                    s.price?.discountPercent?.toString() ||
                    s.discountPercent?.toString() ||
                    '',
                  stockQuantity:
                    s.price?.stockQuantity?.toString() ||
                    s.stockQuantity?.toString() ||
                    '',
                  lowStockAlert:
                    s.price?.lowStockAlert?.toString() ||
                    s.lowStockAlert?.toString() ||
                    '5',
                })) || [],
              colors:
                r.colors?.map((c: any) => ({
                  id: c.id || `color-${Date.now()}-${Math.random()}`,
                  colorName: c.colorName || c.name,
                  colorImage: c.colorImage || c.image,
                  colorImageFile: null,
                  hasStorage: c.hasStorage !== false,
                  useDefaultStorages: c.useDefaultStorages !== false,
                  isDefault: c.isDefault || false,
                  singlePrice:
                    c.singlePrice?.toString() ||
                    c.regularPrice?.toString() ||
                    '',
                  singleComparePrice:
                    c.singleComparePrice?.toString() ||
                    c.comparePrice?.toString() ||
                    '',
                  singleStockQuantity:
                    c.singleStockQuantity?.toString() ||
                    c.stockQuantity?.toString() ||
                    '',
                  storages:
                    c.storages?.map((s: any) => ({
                      id: s.id || `s-${Date.now()}-${Math.random()}`,
                      storageSize: s.storageSize || '',
                      isDefault: s.isDefault || false,
                      regularPrice:
                        s.price?.regularPrice?.toString() ||
                        s.regularPrice?.toString() ||
                        '',
                      discountPrice:
                        s.price?.discountPrice?.toString() ||
                        s.discountPrice?.toString() ||
                        '',
                      discountPercent:
                        s.price?.discountPercent?.toString() ||
                        s.discountPercent?.toString() ||
                        '',
                      stockQuantity:
                        s.price?.stockQuantity?.toString() ||
                        s.stockQuantity?.toString() ||
                        '',
                      lowStockAlert:
                        s.price?.lowStockAlert?.toString() ||
                        s.lowStockAlert?.toString() ||
                        '5',
                    })) || [],
                })) || [],
            })),
          );
        } else {
          setRegions([]);
        }
      }
    }
  }, [product, open]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId],
    );
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProductName(newName);
    if (!slug) setSlug(slugify(newName));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      setGalleryImageFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () =>
        setGalleryImagePreviews(prev => [
          ...prev,
          {url: reader.result as string, altText: '', file},
        ]);
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    const preview = galleryImagePreviews[index];
    if (preview.file) {
      const fileIndex = galleryImageFiles.indexOf(preview.file);
      if (fileIndex > -1)
        setGalleryImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Basic Colors
  const addBasicColor = () => {
    setBasicColors([
      ...basicColors,
      {
        id: `color-${Date.now()}`,
        colorName: '',
        colorImage: '',
        colorImageFile: null,
        regularPrice: '',
        discountPrice: '',
        discountPercent: '',
        stockQuantity: '',
        isDefault: false,
      },
    ]);
  };

  const removeBasicColor = (colorId: string) => {
    setBasicColors(basicColors.filter(c => c.id !== colorId));
  };

  const updateBasicColor = (colorId: string, field: string, value: any) => {
    setBasicColors(prev =>
      prev.map(c => {
        if (c.id === colorId) {
          const updated = {...c, [field]: value};

          // Auto-calculate discount price when discount percent or regular price changes
          if (field === 'discountPercent' || field === 'regularPrice') {
            const regularPrice =
              field === 'regularPrice' ? Number(value) : Number(c.regularPrice);
            const discountPercent =
              field === 'discountPercent'
                ? Number(value)
                : Number(c.discountPercent);

            if (regularPrice > 0 && discountPercent > 0) {
              updated.discountPrice = Math.round(
                regularPrice - (regularPrice * discountPercent) / 100,
              ).toString();
            }
          }

          return updated;
        }
        return c;
      }),
    );
  };

  const handleBasicColorImageUpload = (
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBasicColors(
          basicColors.map(c =>
            c.id === colorId
              ? {
                  ...c,
                  colorImage: reader.result as string,
                  colorImageFile: file,
                }
              : c,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBasicColorImage = (colorId: string) => {
    setBasicColors(
      basicColors.map(c =>
        c.id === colorId ? {...c, colorImage: '', colorImageFile: null} : c,
      ),
    );
  };

  // Specifications
  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      {id: `spec-${Date.now()}`, key: '', value: ''},
    ]);
  };

  const removeSpecification = (specId: string) => {
    setSpecifications(specifications.filter(s => s.id !== specId));
  };

  const updateSpecification = (
    specId: string,
    field: string,
    value: string,
  ) => {
    setSpecifications(
      specifications.map(s => (s.id === specId ? {...s, [field]: value} : s)),
    );
  };

  // Videos
  const addVideo = () => {
    setVideos([
      ...videos,
      {id: `video-${Date.now()}`, url: '', type: 'youtube'},
    ]);
  };

  const removeVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId));
  };

  const updateVideo = (videoId: string, field: string, value: string) => {
    setVideos(videos.map(v => (v.id === videoId ? {...v, [field]: value} : v)));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      galleryImageFiles.forEach(file => formData.append('galleryImages', file));

      const payload: any = {
        name: productName,
        slug,
        description: description || undefined,
        shortDescription: shortDescription || undefined,
        categoryIds:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        brandIds: selectedBrands.length > 0 ? selectedBrands : undefined,
        productCode: productCode || undefined,
        sku: sku || undefined,
        warranty: warranty || undefined,
        isActive: !!isActive,
        isOnline: !!isOnline,
        isPos: !!isPos,
        isPreOrder: !!isPreOrder,
        isOfficial: !!isOfficial,
        freeShipping: !!freeShipping,
        ratingPoint: ratingPoint ? Number(ratingPoint) : undefined,
        isEmi: !!isEmi,
        isCare: !!isCare,
        delivery: delivery || undefined,
        easyReturns: easyReturns || undefined,
        rewardPoints: rewardPoints ? Number(rewardPoints) : undefined,
        minBookingPrice: minBookingPrice ? Number(minBookingPrice) : undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords
          ? seoKeywords.split(',').map(k => k.trim())
          : undefined,
        seoCanonical: seoCanonical || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
        videos: videos
          .filter(v => v.url)
          .map((v, idx) => ({
            videoUrl: v.url,
            videoType: v.type,
            displayOrder: idx,
          })),
        specifications: specifications
          .filter(s => s.key && s.value)
          .map((s, idx) => ({
            specKey: s.key,
            specValue: s.value,
            displayOrder: idx,
          })),
      };

      if (productType === 'basic') {
        basicColors.forEach((color, idx) => {
          if (color.colorImageFile)
            formData.append(`colors[${idx}][colorImage]`, color.colorImageFile);
        });
        payload.colors = basicColors.map((c, idx) => ({
          id: c.id.startsWith('color-') ? undefined : c.id,
          colorName: c.colorName,
          regularPrice: c.regularPrice ? Number(c.regularPrice) : undefined,
          discountPrice: c.discountPrice ? Number(c.discountPrice) : undefined,
          discountPercent: c.discountPercent
            ? Number(c.discountPercent)
            : undefined,
          stockQuantity: c.stockQuantity ? Number(c.stockQuantity) : undefined,
          isDefault: c.isDefault,
          displayOrder: idx,
        }));
      } else if (productType === 'network') {
        // Simplified network update logic - assuming backend handles full replacement or smart update
        // For complex nested structures, we usually send the full structure
        const networkColorImages: File[] = [];
        payload.networks = networks.map((network, netIdx) => ({
          id: network.id.startsWith('network-') ? undefined : network.id,
          networkType: network.networkType,
          isDefault: network.isDefault,
          hasDefaultStorages: network.hasDefaultStorages,
          displayOrder: netIdx,
          defaultStorages: network.hasDefaultStorages
            ? network.defaultStorages.map((storage: any, storIdx: number) => ({
                id: storage.id.startsWith('ds-') ? undefined : storage.id,
                storageSize: storage.storageSize,
                regularPrice: Number(storage.regularPrice) || 0,
                discountPrice: Number(storage.discountPrice) || 0,
                discountPercent: Number(storage.discountPercent) || 0,
                stockQuantity: Number(storage.stockQuantity) || 0,
                isDefault: storage.isDefault,
                displayOrder: storIdx,
              }))
            : undefined,
          colors: network.colors.map((color: any, colorIdx: number) => {
            let imageIndex = -1;
            if (color.colorImageFile) {
              networkColorImages.push(color.colorImageFile);
              imageIndex = networkColorImages.length - 1;
            }
            return {
              id: color.id.startsWith('color-') ? undefined : color.id,
              colorName: color.colorName,
              hasStorage: color.hasStorage,
              useDefaultStorages: color.useDefaultStorages,
              displayOrder: colorIdx,
              colorImageIndex: imageIndex > -1 ? imageIndex : undefined,
              isDefault: color.isDefault,
              singlePrice: !color.hasStorage
                ? Number(color.singlePrice) || 0
                : undefined,
              singleComparePrice: !color.hasStorage
                ? Number(color.singleComparePrice) || 0
                : undefined,
              singleStockQuantity: !color.hasStorage
                ? Number(color.singleStockQuantity) || 0
                : undefined,
              storages:
                color.hasStorage && !color.useDefaultStorages
                  ? color.storages.map((storage: any, storIdx: number) => ({
                      id: storage.id.startsWith('s-') ? undefined : storage.id,
                      storageSize: storage.storageSize,
                      regularPrice: Number(storage.regularPrice) || 0,
                      discountPrice: Number(storage.discountPrice) || 0,
                      discountPercent: Number(storage.discountPercent) || 0,
                      stockQuantity: Number(storage.stockQuantity) || 0,
                      isDefault: storage.isDefault,
                      displayOrder: storIdx,
                    }))
                  : undefined,
            };
          }),
        }));
        networkColorImages.forEach(file => formData.append('colors', file));
      } else if (productType === 'region') {
        const regionColorImages: File[] = [];
        payload.regions = regions.map((region, regIdx) => ({
          id: region.id.startsWith('region-') ? undefined : region.id,
          regionName: region.regionName,
          isDefault: region.isDefault,
          displayOrder: regIdx,
          defaultStorages: region.defaultStorages.map(
            (storage: any, storIdx: number) => ({
              id: storage.id.startsWith('ds-') ? undefined : storage.id,
              storageSize: storage.storageSize,
              regularPrice: Number(storage.regularPrice) || 0,
              discountPrice: Number(storage.discountPrice) || 0,
              discountPercent: Number(storage.discountPercent) || 0,
              stockQuantity: Number(storage.stockQuantity) || 0,
              isDefault: storage.isDefault,
              displayOrder: storIdx,
            }),
          ),
          colors: region.colors.map((color: any, colorIdx: number) => {
            let imageIndex = -1;
            if (color.colorImageFile) {
              regionColorImages.push(color.colorImageFile);
              imageIndex = regionColorImages.length - 1;
            }
            return {
              id: color.id.startsWith('color-') ? undefined : color.id,
              colorName: color.colorName,
              hasStorage: color.hasStorage,
              useDefaultStorages: color.useDefaultStorages,
              displayOrder: colorIdx,
              colorImageIndex: imageIndex > -1 ? imageIndex : undefined,
              isDefault: color.isDefault,
              singlePrice: !color.hasStorage
                ? Number(color.singlePrice) || 0
                : undefined,
              singleComparePrice: !color.hasStorage
                ? Number(color.singleComparePrice) || 0
                : undefined,
              singleStockQuantity: !color.hasStorage
                ? Number(color.singleStockQuantity) || 0
                : undefined,
              storages:
                color.hasStorage && !color.useDefaultStorages
                  ? color.storages.map((storage: any, storIdx: number) => ({
                      id: storage.id.startsWith('s-') ? undefined : storage.id,
                      storageSize: storage.storageSize,
                      regularPrice: Number(storage.regularPrice) || 0,
                      discountPrice: Number(storage.discountPrice) || 0,
                      discountPercent: Number(storage.discountPercent) || 0,
                      stockQuantity: Number(storage.stockQuantity) || 0,
                      isDefault: storage.isDefault,
                      displayOrder: storIdx,
                    }))
                  : undefined,
            };
          }),
        }));
        regionColorImages.forEach(file => formData.append('colors', file));
      }

      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      let response;
      if (productType === 'basic') {
        response = await productsService.updateBasic(product.id, formData);
      } else if (productType === 'network') {
        response = await productsService.updateNetwork(product.id, formData);
      } else if (productType === 'region') {
        response = await productsService.updateRegion(product.id, formData);
      }

      toast.success('Product updated successfully!');
      onSuccess?.(response);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        `Error: ${
          err?.response?.data?.message || err?.message || 'Unknown error'
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[1100px] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Product ({productType})</DialogTitle>
          <DialogDescription>Update product information</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* General Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={productName}
                    onChange={handleProductNameChange}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={slug} onChange={e => setSlug(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Short Description</Label>
                <Textarea
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  rows={2}
                  className="min-h-10 rounded border border-gray-300 p-3 w-full"
                  placeholder="Enter short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="mt-2 rounded border border-gray-300 bg-white p-3 max-h-48 overflow-y-auto">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Brand</Label>
                  <div className="mt-2 rounded border border-gray-300 bg-white p-3 max-h-48 overflow-y-auto">
                    {brands.map(br => (
                      <div key={br.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`br-${br.id}`}
                          checked={selectedBrands.includes(br.id)}
                          onCheckedChange={() => toggleBrand(br.id)}
                        />
                        <Label htmlFor={`br-${br.id}`}>{br.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Product Code</Label>
                  <Input
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={sku} onChange={e => setSku(e.target.value)} />
                </div>
                <div>
                  <Label>Warranty</Label>
                  <Input
                    value={warranty}
                    onChange={e => setWarranty(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Online</Label>
                  <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>POS</Label>
                  <Switch checked={isPos} onCheckedChange={setIsPos} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Pre-Order</Label>
                  <Switch
                    checked={isPreOrder}
                    onCheckedChange={setIsPreOrder}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Official</Label>
                  <Switch
                    checked={isOfficial}
                    onCheckedChange={setIsOfficial}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Free Shipping</Label>
                  <Switch
                    checked={freeShipping}
                    onCheckedChange={setFreeShipping}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>EMI</Label>
                  <Switch checked={isEmi} onCheckedChange={setIsEmi} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Care Available</Label>
                  <Switch checked={isCare} onCheckedChange={setIsCare} />
                </div>
              </div>
            </div>

            {/* Delivery & Returns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delivery & Returns</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Delivery</Label>
                  <Input
                    value={delivery}
                    onChange={e => setDelivery(e.target.value)}
                    placeholder="e.g., 2-3 business days"
                  />
                </div>
                <div>
                  <Label>Easy Returns</Label>
                  <Input
                    value={easyReturns}
                    onChange={e => setEasyReturns(e.target.value)}
                    placeholder="e.g., 7 days return policy"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <div>
                <Label>Thumbnail</Label>
                <div className="mt-2 rounded border-2 border-dashed border-gray-300 p-6">
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail"
                        className="h-32 w-32 rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Upload thumbnail
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <Label>Gallery</Label>
                <div className="mt-2 rounded border-2 border-dashed border-gray-300 p-6">
                  <div className="grid grid-cols-4 gap-4">
                    {galleryImagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={preview.url}
                          alt={`Gallery ${idx}`}
                          className="h-24 w-24 rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="flex cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 h-24 w-24">
                      <Plus className="h-6 w-6 text-gray-400" />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Videos</Label>
                {videos.map(video => (
                  <div key={video.id} className="flex gap-2 mt-2">
                    <Input
                      placeholder="Video URL"
                      value={video.url}
                      onChange={e =>
                        updateVideo(video.id, 'url', e.target.value)
                      }
                    />
                    <Select
                      value={video.type}
                      onValueChange={v => updateVideo(video.id, 'type', v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVideo(video.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVideo}
                  className="mt-2">
                  + Add Video
                </Button>
              </div>
            </div>

            {/* Configuration/Colors */}
            <div className="space-y-4">
              {productType === 'basic' && (
                <div className="space-y-4">
                  {basicColors.map(color => (
                    <div
                      key={color.id}
                      className="space-y-4 rounded border p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Color Name</Label>
                          <Input
                            value={color.colorName}
                            onChange={e =>
                              updateBasicColor(
                                color.id,
                                'colorName',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={color.stockQuantity}
                            onChange={e =>
                              updateBasicColor(
                                color.id,
                                'stockQuantity',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <Checkbox
                            id={`basic-color-default-${color.id}`}
                            checked={color.isDefault}
                            onCheckedChange={checked => {
                              setBasicColors(prev =>
                                prev.map(c =>
                                  c.id === color.id
                                    ? {...c, isDefault: !!checked}
                                    : {...c, isDefault: false},
                                ),
                              );
                            }}
                          />
                          <Label
                            htmlFor={`basic-color-default-${color.id}`}
                            className="text-sm">
                            Default
                          </Label>
                        </div>
                      </div>
                      <div>
                        <Label>Image</Label>
                        <div className="mt-2">
                          {color.colorImage ? (
                            <div className="relative inline-block">
                              <img
                                src={color.colorImage}
                                alt={color.colorName}
                                className="h-24 w-24 rounded object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeBasicColorImage(color.id)}
                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-4">
                              <Upload className="h-6 w-6 text-gray-400" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e =>
                                  handleBasicColorImageUpload(color.id, e)
                                }
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Regular Price</Label>
                          <Input
                            type="number"
                            value={color.regularPrice}
                            onChange={e =>
                              updateBasicColor(
                                color.id,
                                'regularPrice',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Discount %</Label>
                          <Input
                            type="number"
                            value={color.discountPercent}
                            onChange={e =>
                              updateBasicColor(
                                color.id,
                                'discountPercent',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Discount Price</Label>
                          <Input
                            type="number"
                            value={color.discountPrice}
                            onChange={e =>
                              updateBasicColor(
                                color.id,
                                'discountPrice',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeBasicColor(color.id)}>
                        Remove Color
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addBasicColor}>+ Add Color</Button>
                </div>
              )}
              {productType === 'network' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Networks & Colors
                    </h3>
                    {networks.map(network => (
                      <div
                        key={network.id}
                        className="space-y-4 rounded border p-4 mb-4">
                        <div className="flex items-end gap-4">
                          <div className="flex-1">
                            <Label>Network Type</Label>
                            <Input
                              value={network.networkType}
                              onChange={e =>
                                updateNetwork(
                                  network.id,
                                  'networkType',
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., WiFi+ Cellular, WiFi Only"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">
                              Has Default Storages
                            </Label>
                            <Switch
                              checked={network.hasDefaultStorages}
                              onCheckedChange={e =>
                                updateNetwork(
                                  network.id,
                                  'hasDefaultStorages',
                                  e,
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeNetwork(network.id)}>
                            Remove
                          </Button>
                        </div>

                        {network.hasDefaultStorages && (
                          <div className="space-y-3 rounded bg-blue-50 p-3">
                            <Label className="block font-semibold">
                              Default Storages
                            </Label>
                            {network.defaultStorages.map((storage: any) => (
                              <div
                                key={storage.id}
                                className="space-y-2 rounded bg-white p-2">
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`network-storage-default-${network.id}-${storage.id}`}
                                      checked={storage.isDefault}
                                      onCheckedChange={checked => {
                                        setNetworks(prev =>
                                          prev.map(n =>
                                            n.id === network.id
                                              ? {
                                                  ...n,
                                                  defaultStorages:
                                                    n.defaultStorages.map(
                                                      (s: any) =>
                                                        s.id === storage.id
                                                          ? {
                                                              ...s,
                                                              isDefault:
                                                                !!checked,
                                                            }
                                                          : {
                                                              ...s,
                                                              isDefault: false,
                                                            },
                                                    ),
                                                  colors: n.colors.map(
                                                    (c: any) => ({
                                                      ...c,
                                                      storages: c.storages.map(
                                                        (cs: any) =>
                                                          cs.id === storage.id
                                                            ? cs
                                                            : {
                                                                ...cs,
                                                                isDefault:
                                                                  false,
                                                              },
                                                      ),
                                                    }),
                                                  ),
                                                }
                                              : n,
                                          ),
                                        );
                                      }}
                                    />
                                    <Label
                                      htmlFor={`network-storage-default-${network.id}-${storage.id}`}
                                      className="text-xs">
                                      Default
                                    </Label>
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      Storage Size
                                    </Label>
                                    <Input
                                      value={storage.storageSize}
                                      onChange={e =>
                                        updateDefaultStorageInNetwork(
                                          network.id,
                                          storage.id,
                                          'storageSize',
                                          e.target.value,
                                        )
                                      }
                                      placeholder="256GB"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      Regular Price
                                    </Label>
                                    <Input
                                      type="number"
                                      value={storage.regularPrice}
                                      onChange={e =>
                                        updateDefaultStorageInNetwork(
                                          network.id,
                                          storage.id,
                                          'regularPrice',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      Discount %
                                    </Label>
                                    <Input
                                      type="number"
                                      value={storage.discountPercent}
                                      onChange={e =>
                                        updateDefaultStorageInNetwork(
                                          network.id,
                                          storage.id,
                                          'discountPercent',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      Discount Price
                                    </Label>
                                    <Input
                                      type="number"
                                      value={storage.discountPrice}
                                      onChange={e =>
                                        updateDefaultStorageInNetwork(
                                          network.id,
                                          storage.id,
                                          'discountPrice',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Stock</Label>
                                    <Input
                                      type="number"
                                      value={storage.stockQuantity}
                                      onChange={e =>
                                        updateDefaultStorageInNetwork(
                                          network.id,
                                          storage.id,
                                          'stockQuantity',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeNetworkDefaultStorage(
                                        network.id,
                                        storage.id,
                                      )
                                    }>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addNetworkDefaultStorage(network.id)
                              }>
                              + Add Storage
                            </Button>
                          </div>
                        )}

                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Colors</h4>
                          {network.colors.map((color: any) => (
                            <div
                              key={color.id}
                              className="space-y-3 rounded border p-3 bg-gray-50">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Color Name</Label>
                                  <Input
                                    value={color.colorName}
                                    onChange={e =>
                                      updateNetworkColor(
                                        network.id,
                                        color.id,
                                        'colorName',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="e.g., Midnight Black"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <Label className="text-xs">Has Storage</Label>
                                  <Switch
                                    checked={color.hasStorage}
                                    onCheckedChange={e =>
                                      updateNetworkColor(
                                        network.id,
                                        color.id,
                                        'hasStorage',
                                        e,
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <Checkbox
                                    id={`network-color-default-${network.id}-${color.id}`}
                                    checked={color.isDefault}
                                    onCheckedChange={checked => {
                                      setNetworks(prev =>
                                        prev.map(n =>
                                          n.id === network.id
                                            ? {
                                                ...n,
                                                colors: n.colors.map((c: any) =>
                                                  c.id === color.id
                                                    ? {
                                                        ...c,
                                                        isDefault: !!checked,
                                                      }
                                                    : {...c, isDefault: false},
                                                ),
                                              }
                                            : n,
                                        ),
                                      );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`network-color-default-${network.id}-${color.id}`}
                                    className="text-xs">
                                    Default
                                  </Label>
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">Color Image</Label>
                                {color.colorImage ? (
                                  <div className="relative inline-block mt-2">
                                    <img
                                      src={color.colorImage}
                                      alt={color.colorName}
                                      className="h-20 w-20 rounded object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeNetworkColorImage(
                                          network.id,
                                          color.id,
                                        )
                                      }
                                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded border border-dashed p-3 text-xs">
                                    <Upload className="h-4 w-4" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={e =>
                                        handleNetworkColorImageUpload(
                                          network.id,
                                          color.id,
                                          e,
                                        )
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>

                              {color.hasStorage ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">
                                      Use Default Storages
                                    </Label>
                                    <Switch
                                      checked={color.useDefaultStorages}
                                      onCheckedChange={e =>
                                        updateNetworkColor(
                                          network.id,
                                          color.id,
                                          'useDefaultStorages',
                                          e,
                                        )
                                      }
                                    />
                                  </div>
                                  {!color.useDefaultStorages && (
                                    <div className="space-y-2">
                                      {color.storages.map((storage: any) => (
                                        <div
                                          key={storage.id}
                                          className="grid grid-cols-4 gap-2 rounded bg-white p-2 text-xs">
                                          <Input
                                            placeholder="Storage"
                                            value={storage.storageSize}
                                            onChange={e =>
                                              updateNetworkColorStorage(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'storageSize',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Price"
                                            value={storage.regularPrice}
                                            onChange={e =>
                                              updateNetworkColorStorage(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'regularPrice',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Discount %"
                                            value={storage.discountPercent}
                                            onChange={e =>
                                              updateNetworkColorStorage(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'discountPercent',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              removeNetworkColorStorage(
                                                network.id,
                                                color.id,
                                                storage.id,
                                              )
                                            }>
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          addNetworkColorStorage(
                                            network.id,
                                            color.id,
                                          )
                                        }>
                                        + Add Storage
                                      </Button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    value={color.singlePrice}
                                    onChange={e =>
                                      updateNetworkColor(
                                        network.id,
                                        color.id,
                                        'singlePrice',
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Stock"
                                    value={color.singleStockQuantity}
                                    onChange={e =>
                                      updateNetworkColor(
                                        network.id,
                                        color.id,
                                        'singleStockQuantity',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              )}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeNetworkColor(network.id, color.id)
                                }>
                                Remove Color
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addNetworkColor(network.id)}>
                            + Add Color
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" onClick={addNetwork}>
                      + Add Network
                    </Button>
                  </div>
                </div>
              )}
              {productType === 'region' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Regions & Colors
                    </h3>
                    {regions.map(region => (
                      <div
                        key={region.id}
                        className="space-y-4 rounded border p-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label>Region Name</Label>
                            <Input
                              value={region.regionName}
                              onChange={e =>
                                updateRegion(
                                  region.id,
                                  'regionName',
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., North Region"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`region-default-${region.id}`}
                              checked={region.isDefault}
                              onCheckedChange={checked => {
                                setRegions(prev =>
                                  prev.map(r =>
                                    r.id === region.id
                                      ? {...r, isDefault: !!checked}
                                      : {...r, isDefault: false},
                                  ),
                                );
                              }}
                            />
                            <Label
                              htmlFor={`region-default-${region.id}`}
                              className="text-sm cursor-pointer">
                              Default Region
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRegion(region.id)}>
                            Remove
                          </Button>
                        </div>

                        <div className="space-y-3 rounded bg-blue-50 p-3">
                          <Label className="block font-semibold">
                            Default Storages
                          </Label>
                          {region.defaultStorages.map((storage: any) => (
                            <div
                              key={storage.id}
                              className="space-y-2 rounded bg-white p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Checkbox
                                  id={`region-storage-default-${region.id}-${storage.id}`}
                                  checked={storage.isDefault}
                                  onCheckedChange={checked => {
                                    setRegions(prev =>
                                      prev.map(r =>
                                        r.id === region.id
                                          ? {
                                              ...r,
                                              defaultStorages:
                                                r.defaultStorages.map(
                                                  (s: any) =>
                                                    s.id === storage.id
                                                      ? {
                                                          ...s,
                                                          isDefault: !!checked,
                                                        }
                                                      : {
                                                          ...s,
                                                          isDefault: false,
                                                        },
                                                ),
                                              colors: r.colors.map(
                                                (c: any) => ({
                                                  ...c,
                                                  storages: c.storages.map(
                                                    (cs: any) => ({
                                                      ...cs,
                                                      isDefault: false,
                                                    }),
                                                  ),
                                                }),
                                              ),
                                            }
                                          : r,
                                      ),
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor={`region-storage-default-${region.id}-${storage.id}`}
                                  className="text-xs">
                                  Default
                                </Label>
                              </div>
                              <div className="grid grid-cols-5 gap-2">
                                <div>
                                  <Label className="text-xs">
                                    Storage Size
                                  </Label>
                                  <Input
                                    value={storage.storageSize}
                                    onChange={e =>
                                      updateDefaultStorageInRegion(
                                        region.id,
                                        storage.id,
                                        'storageSize',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="256GB"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">
                                    Regular Price
                                  </Label>
                                  <Input
                                    type="number"
                                    value={storage.regularPrice}
                                    onChange={e =>
                                      updateDefaultStorageInRegion(
                                        region.id,
                                        storage.id,
                                        'regularPrice',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Discount %</Label>
                                  <Input
                                    type="number"
                                    value={storage.discountPercent}
                                    onChange={e =>
                                      updateDefaultStorageInRegion(
                                        region.id,
                                        storage.id,
                                        'discountPercent',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">
                                    Discount Price
                                  </Label>
                                  <Input
                                    type="number"
                                    value={storage.discountPrice}
                                    onChange={e =>
                                      updateDefaultStorageInRegion(
                                        region.id,
                                        storage.id,
                                        'discountPrice',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeRegionDefaultStorage(
                                      region.id,
                                      storage.id,
                                    )
                                  }>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addRegionDefaultStorage(region.id)}>
                            + Add Storage
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Colors</h4>
                          {region.colors.map((color: any) => (
                            <div
                              key={color.id}
                              className="space-y-3 rounded border p-3 bg-gray-50">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Color Name</Label>
                                  <Input
                                    value={color.colorName}
                                    onChange={e =>
                                      updateRegionColor(
                                        region.id,
                                        color.id,
                                        'colorName',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="e.g., Midnight Black"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <Label className="text-xs">Has Storage</Label>
                                  <Switch
                                    checked={color.hasStorage}
                                    onCheckedChange={e =>
                                      updateRegionColor(
                                        region.id,
                                        color.id,
                                        'hasStorage',
                                        e,
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <Checkbox
                                    id={`region-color-default-${region.id}-${color.id}`}
                                    checked={color.isDefault}
                                    onCheckedChange={checked => {
                                      setRegions(prev =>
                                        prev.map(r =>
                                          r.id === region.id
                                            ? {
                                                ...r,
                                                colors: r.colors.map((c: any) =>
                                                  c.id === color.id
                                                    ? {
                                                        ...c,
                                                        isDefault: !!checked,
                                                      }
                                                    : {...c, isDefault: false},
                                                ),
                                              }
                                            : r,
                                        ),
                                      );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`region-color-default-${region.id}-${color.id}`}
                                    className="text-xs">
                                    Default
                                  </Label>
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">Color Image</Label>
                                {color.colorImage ? (
                                  <div className="relative inline-block mt-2">
                                    <img
                                      src={color.colorImage}
                                      alt={color.colorName}
                                      className="h-20 w-20 rounded object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeRegionColorImage(
                                          region.id,
                                          color.id,
                                        )
                                      }
                                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded border border-dashed p-3 text-xs">
                                    <Upload className="h-4 w-4" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={e =>
                                        handleRegionColorImageUpload(
                                          region.id,
                                          color.id,
                                          e,
                                        )
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>

                              {color.hasStorage ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">
                                      Use Default Storages
                                    </Label>
                                    <Switch
                                      checked={color.useDefaultStorages}
                                      onCheckedChange={e =>
                                        updateRegionColor(
                                          region.id,
                                          color.id,
                                          'useDefaultStorages',
                                          e,
                                        )
                                      }
                                    />
                                  </div>
                                  {!color.useDefaultStorages && (
                                    <div className="space-y-2">
                                      {color.storages.map((storage: any) => (
                                        <div
                                          key={storage.id}
                                          className="grid grid-cols-4 gap-2 rounded bg-white p-2 text-xs">
                                          <Input
                                            placeholder="Storage"
                                            value={storage.storageSize}
                                            onChange={e =>
                                              updateRegionColorStorage(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'storageSize',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Price"
                                            value={storage.regularPrice}
                                            onChange={e =>
                                              updateRegionColorStorage(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'regularPrice',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <Input
                                            type="number"
                                            placeholder="Discount %"
                                            value={storage.discountPercent}
                                            onChange={e =>
                                              updateRegionColorStorage(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'discountPercent',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              removeRegionColorStorage(
                                                region.id,
                                                color.id,
                                                storage.id,
                                              )
                                            }>
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          addRegionColorStorage(
                                            region.id,
                                            color.id,
                                          )
                                        }>
                                        + Add Storage
                                      </Button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    value={color.singlePrice}
                                    onChange={e =>
                                      updateRegionColor(
                                        region.id,
                                        color.id,
                                        'singlePrice',
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Stock"
                                    value={color.singleStockQuantity}
                                    onChange={e =>
                                      updateRegionColor(
                                        region.id,
                                        color.id,
                                        'singleStockQuantity',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              )}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeRegionColor(region.id, color.id)
                                }>
                                Remove Color
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addRegionColor(region.id)}>
                            + Add Color
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" onClick={addRegion}>
                      + Add Region
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* SEO Settings */}
            <div className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <Input
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>SEO Keywords</Label>
                <Input
                  value={seoKeywords}
                  onChange={e => setSeoKeywords(e.target.value)}
                />
              </div>
              <div>
                <Label>Canonical URL</Label>
                <Input
                  value={seoCanonical}
                  onChange={e => setSeoCanonical(e.target.value)}
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              {specifications.map(spec => (
                <div key={spec.id} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={spec.key}
                    onChange={e =>
                      updateSpecification(spec.id, 'key', e.target.value)
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={e =>
                      updateSpecification(spec.id, 'value', e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecification(spec.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addSpecification}>+ Add Specification</Button>
            </div>

            {/* Extra / Additional Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reward Points</Label>
                  <Input
                    type="number"
                    value={rewardPoints}
                    onChange={e => setRewardPoints(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Min Booking Price</Label>
                  <Input
                    type="number"
                    value={minBookingPrice}
                    onChange={e => setMinBookingPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ratingPoint">Rating Point</Label>
                  <Input
                    id="ratingPoint"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={ratingPoint}
                    onChange={e => setRatingPoint(e.target.value)}
                    placeholder="0-5"
                  />
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <Input value={tags} onChange={e => setTags(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
