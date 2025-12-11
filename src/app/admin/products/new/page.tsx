/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {useState, useEffect, useRef} from 'react';
import {toast} from 'sonner';
import productsService from '../../../lib/api/services/products';
import categoriesService from '../../../lib/api/services/categories';
import brandsService from '../../../lib/api/services/brands';
import Link from 'next/link';
import {ArrowLeft, Upload, X, Plus, Image as ImageIcon} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {Button} from '../../../components/ui/button';
import {Input} from '../../../components/ui/input';
import {Label} from '../../../components/ui/label';
import {Textarea} from '../../../components/ui/textarea';
import {Switch} from '../../../components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {Checkbox} from '../../../components/ui/checkbox';
import {withProtectedRoute} from '../../../lib/auth/protected-route';

type ProductType = 'basic' | 'network' | 'region';

function NewProductPage() {
  const [productType, setProductType] = useState<ProductType>('basic');

  // Basic product info (shared across all types)
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const shortDescriptionRef = useRef<HTMLDivElement>(null);
  const [productCode, setProductCode] = useState('');
  const [sku, setSku] = useState('');
  const [warranty, setWarranty] = useState('');
  const [delivery, setDelivery] = useState('');
  const [easyReturns, setEasyReturns] = useState('');

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
      file: File;
    }>
  >([]);

  // Basic product colors
  const [basicColors, setBasicColors] = useState<
    Array<{
      id: string;
      colorName: string;
      colorImage: string;
      colorImageFile: File | null;
      isDefault: boolean;
      regularPrice: string;
      discountPrice: string;
      discountPercent: string;
      stockQuantity: string;
    }>
  >([]);

  // Videos
  const [videos, setVideos] = useState<
    Array<{
      id: string;
      url: string;
      type: string;
    }>
  >([{id: 'video-1', url: '', type: 'youtube'}]);

  // Specifications
  const [specifications, setSpecifications] = useState<
    Array<{
      id: string;
      key: string;
      value: string;
    }>
  >([{id: 'spec-1', key: '', value: ''}]);

  // Networks (for network product type)
  const [networks, setNetworks] = useState<
    Array<{
      id: string;
      networkName: string;
      priceAdjustment: string;
      defaultStorageSize: string;
      isDefault: boolean;
      hasDefaultStorages: boolean;
      defaultStorages: Array<{
        id: string;
        storageSize: string;
        isDefault: boolean;
        regularPrice: string;
        discountPrice: string;
        discountPercent: string;
        stockQuantity: string;
        lowStockAlert: string;
      }>;
      colors: Array<{
        id: string;
        colorName: string;
        colorImage: string;
        colorImageFile: File | null;
        isDefault: boolean;
        hasStorage: boolean;
        useDefaultStorages: boolean;
        singlePrice: string;
        singleComparePrice: string;
        singleStockQuantity: string;
        storages: Array<{
          id: string;
          storageSize: string;
          isDefault: boolean;
          regularPrice: string;
          discountPrice: string;
          discountPercent: string;
          stockQuantity: string;
          lowStockAlert: string;
        }>;
      }>;
    }>
  >([]);

  // Regions (for region product type)
  const [regions, setRegions] = useState<
    Array<{
      id: string;
      regionName: string;
      isDefault: boolean;
      defaultStorages: Array<{
        id: string;
        storageSize: string;
        isDefault: boolean;
        regularPrice: string;
        discountPrice: string;
        discountPercent: string;
        stockQuantity: string;
        lowStockAlert: string;
      }>;
      colors: Array<{
        id: string;
        colorName: string;
        colorImage: string;
        colorImageFile: File | null;
        isDefault: boolean;
        hasStorage: boolean;
        useDefaultStorages: boolean;
        singlePrice: string;
        singleComparePrice: string;
        singleStockQuantity: string;
        storages: Array<{
          id: string;
          storageSize: string;
          isDefault: boolean;
          regularPrice: string;
          discountPrice: string;
          discountPercent: string;
          stockQuantity: string;
          lowStockAlert: string;
        }>;
      }>;
    }>
  >([
    {
      id: 'region-1',
      regionName: 'International',
      isDefault: true,
      defaultStorages: [
        {
          id: 'default-storage-1',
          storageSize: '256GB',
          isDefault: false,
          regularPrice: '',
          discountPrice: '',
          discountPercent: '',
          stockQuantity: '',
          lowStockAlert: '5',
        },
      ],
      colors: [
        {
          id: 'color-1',
          colorName: 'Midnight',
          colorImage: '',
          colorImageFile: null,
          isDefault: true,
          hasStorage: true,
          useDefaultStorages: true,
          singlePrice: '',
          singleComparePrice: '',
          singleStockQuantity: '',
          storages: [],
        },
      ],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingPoint, setRatingPoint] = useState('');

  // Fetch categories and brands
  useEffect(() => {
    categoriesService.getAll().then(data => {
      setCategories(
        data.map((c: any) => ({
          id: c.id,
          name: c.name,
        })),
      );
    });
    brandsService.findAll().then(data => {
      setBrands(data.map((b: any) => ({id: b.id, name: b.name})));
    });
  }, []);

  // Slugify helper
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
    setSlug(prevSlug => {
      const prevAuto = slugify(productName);
      const newAuto = slugify(newName);
      if (prevSlug === prevAuto || prevSlug === '') {
        return newAuto;
      }
      return prevSlug;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
  };

  // Thumbnail handling
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  // Gallery handling
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      setGalleryImageFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImagePreviews(prev => [
          ...prev,
          {url: reader.result as string, altText: '', file},
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImageFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Basic color management
  const addBasicColor = () => {
    setBasicColors([
      ...basicColors,
      {
        id: `color-${Date.now()}`,
        colorName: '',
        colorImage: '',
        colorImageFile: null,
        isDefault: false,
        regularPrice: '',
        discountPrice: '',
        discountPercent: '',
        stockQuantity: '',
      },
    ]);
  };

  const removeBasicColor = (colorId: string) => {
    setBasicColors(basicColors.filter(c => c.id !== colorId));
  };

  const updateBasicColor = (colorId: string, field: string, value: any) => {
    setBasicColors(prev =>
      prev.map(c => (c.id === colorId ? {...c, [field]: value} : c)),
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

  // Specification management
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

  // Network management
  const addNetwork = () => {
    setNetworks([
      ...networks,
      {
        id: `network-${Date.now()}`,
        networkName: '',
        priceAdjustment: '0',
        defaultStorageSize: '',
        isDefault: false,
        hasDefaultStorages: false,
        defaultStorages: [
          {
            id: `default-storage-${Date.now()}`,
            storageSize: '256GB',
            isDefault: false,
            regularPrice: '',
            discountPrice: '',
            discountPercent: '',
            stockQuantity: '',
            lowStockAlert: '5',
          },
        ],
        colors: [
          {
            id: `color-${Date.now()}`,
            colorName: '',
            colorImage: '',
            colorImageFile: null,
            isDefault: false,
            hasStorage: true,
            useDefaultStorages: true,
            singlePrice: '',
            singleComparePrice: '',
            singleStockQuantity: '',
            storages: [],
          },
        ],
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

  // Color image upload for network colors
  const handleNetworkColorImageUpload = (
    networkId: string,
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNetworks(
          networks.map(n =>
            n.id === networkId
              ? {
                  ...n,
                  colors: n.colors.map(c =>
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
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {...c, colorImage: '', colorImageFile: null}
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  // Color image upload for region colors
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
                  colors: r.colors.map(c =>
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
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {...c, colorImage: '', colorImageFile: null}
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const addColorToNetwork = (networkId: string) => {
    setNetworks(
      networks.map(n =>
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
                  isDefault: false,
                  hasStorage: true,
                  useDefaultStorages: true,
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

  const removeColorFromNetwork = (networkId: string, colorId: string) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {...n, colors: n.colors.filter(c => c.id !== colorId)}
          : n,
      ),
    );
  };

  const updateColorInNetwork = (
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
              colors: n.colors.map(c =>
                c.id === colorId ? {...c, [field]: value} : c,
              ),
            }
          : n,
      ),
    );
  };

  const addStorageToNetwork = (networkId: string, colorId: string) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: [
                        ...c.storages,
                        {
                          id: `storage-${Date.now()}`,
                          storageSize: '',
                          isDefault: false,
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

  const removeStorageFromNetwork = (
    networkId: string,
    colorId: string,
    storageId: string,
  ) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.filter(s => s.id !== storageId),
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  const updateStorageInNetwork = (
    networkId: string,
    colorId: string,
    storageId: string,
    field: string,
    value: any,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              colors: n.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.map(s =>
                        s.id === storageId ? {...s, [field]: value} : s,
                      ),
                    }
                  : c,
              ),
            }
          : n,
      ),
    );
  };

  // Network default storage management
  const addDefaultStorageToNetwork = (networkId: string) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              defaultStorages: [
                ...n.defaultStorages,
                {
                  id: `default-storage-${Date.now()}`,
                  storageSize: '',
                  isDefault: false,
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

  const removeDefaultStorageFromNetwork = (
    networkId: string,
    storageId: string,
  ) => {
    setNetworks(
      networks.map(n =>
        n.id === networkId
          ? {
              ...n,
              defaultStorages: n.defaultStorages.filter(
                s => s.id !== storageId,
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
    value: any,
  ) => {
    setNetworks(prev =>
      prev.map(n =>
        n.id === networkId
          ? {
              ...n,
              defaultStorages: n.defaultStorages.map(s =>
                s.id === storageId ? {...s, [field]: value} : s,
              ),
            }
          : n,
      ),
    );
  };

  // Region management
  const addRegion = () => {
    setRegions([
      ...regions,
      {
        id: `region-${Date.now()}`,
        regionName: '',
        isDefault: false,
        defaultStorages: [
          {
            id: `default-storage-${Date.now()}`,
            storageSize: '',
            isDefault: false,
            regularPrice: '',
            discountPrice: '',
            discountPercent: '',
            stockQuantity: '',
            lowStockAlert: '5',
          },
        ],
        colors: [
          {
            id: `color-${Date.now()}`,
            colorName: '',
            colorImage: '',
            colorImageFile: null,
            isDefault: false,
            hasStorage: true,
            useDefaultStorages: true,
            singlePrice: '',
            singleComparePrice: '',
            singleStockQuantity: '',
            storages: [],
          },
        ],
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

  const addColorToRegion = (regionId: string) => {
    setRegions(
      regions.map(r =>
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
                  isDefault: false,
                  hasStorage: true,
                  useDefaultStorages: true,
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

  const removeColorFromRegion = (regionId: string, colorId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {...r, colors: r.colors.filter(c => c.id !== colorId)}
          : r,
      ),
    );
  };

  const updateColorInRegion = (
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
              colors: r.colors.map(c =>
                c.id === colorId ? {...c, [field]: value} : c,
              ),
            }
          : r,
      ),
    );
  };

  const addStorageToRegion = (regionId: string, colorId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: [
                        ...c.storages,
                        {
                          id: `storage-${Date.now()}`,
                          storageSize: '',
                          isDefault: false,
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

  const removeStorageFromRegion = (
    regionId: string,
    colorId: string,
    storageId: string,
  ) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.filter(s => s.id !== storageId),
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const updateStorageInRegion = (
    regionId: string,
    colorId: string,
    storageId: string,
    field: string,
    value: any,
  ) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              colors: r.colors.map(c =>
                c.id === colorId
                  ? {
                      ...c,
                      storages: c.storages.map(s =>
                        s.id === storageId ? {...s, [field]: value} : s,
                      ),
                    }
                  : c,
              ),
            }
          : r,
      ),
    );
  };

  const addDefaultStorageToRegion = (regionId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: [
                ...r.defaultStorages,
                {
                  id: `default-storage-${Date.now()}`,
                  storageSize: '',
                  isDefault: false,
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

  const removeDefaultStorageFromRegion = (
    regionId: string,
    storageId: string,
  ) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.filter(
                s => s.id !== storageId,
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
    value: any,
  ) => {
    setRegions(prev =>
      prev.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.map(s =>
                s.id === storageId ? {...s, [field]: value} : s,
              ),
            }
          : r,
      ),
    );
  };

  const resetForm = () => {
    setProductName('');
    setSlug('');
    setDescription('');
    setShortDescription('');
    if (shortDescriptionRef.current) {
      shortDescriptionRef.current.innerHTML = '';
    }
    setProductCode('');
    setSku('');
    setWarranty('');
    setDelivery('');
    setEasyReturns('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setIsActive(true);
    setIsOnline(true);
    setIsPos(true);
    setIsPreOrder(false);
    setIsOfficial(false);
    setFreeShipping(false);
    setIsEmi(false);
    setRewardPoints('');
    setMinBookingPrice('');
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setSeoCanonical('');
    setTags('');
    setThumbnailFile(null);
    setThumbnailPreview('');
    setGalleryImageFiles([]);
    setGalleryImagePreviews([]);
    setBasicColors([]);
    setVideos([{id: 'video-1', url: '', type: 'youtube'}]);
    setSpecifications([{id: 'spec-1', key: '', value: ''}]);
    setNetworks([]);
    setRegions([
      {
        id: 'region-1',
        regionName: 'International',
        isDefault: true,
        defaultStorages: [
          {
            id: 'default-storage-1',
            storageSize: '256GB',
            isDefault: false,
            regularPrice: '',
            discountPrice: '',
            discountPercent: '',
            stockQuantity: '',
            lowStockAlert: '5',
          },
        ],
        colors: [
          {
            id: 'color-1',
            colorName: 'Midnight',
            colorImage: '',
            colorImageFile: null,
            isDefault: false,
            hasStorage: true,
            useDefaultStorages: true,
            singlePrice: '',
            singleComparePrice: '',
            singleStockQuantity: '',
            storages: [],
          },
        ],
      },
    ]);
  };

  // SUBMIT FUNCTIONS
  const handleBasicProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      galleryImageFiles.forEach(file => {
        formData.append('galleryImages', file);
      });

      basicColors.forEach((color, idx) => {
        if (color.colorImageFile) {
          formData.append(`colors[${idx}][colorImage]`, color.colorImageFile);
        }
      });

      const payload: any = {
        productType: 'basic',
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
        isActive,
        isOnline,
        isPos,
        isPreOrder,
        isOfficial,
        freeShipping,
        isEmi,
        delivery: delivery || undefined,
        easyReturns: easyReturns || undefined,
        rewardPoints: rewardPoints ? Number(rewardPoints) : undefined,
        minBookingPrice: minBookingPrice ? Number(minBookingPrice) : undefined,
        ratingPoint: ratingPoint ? Number(ratingPoint) : undefined,
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
        colors:
          basicColors.length > 0
            ? basicColors.map((c, idx) => ({
                colorName: c.colorName,
                isDefault: c.isDefault,
                regularPrice: c.regularPrice
                  ? Number(c.regularPrice)
                  : undefined,
                discountPrice: c.discountPrice
                  ? Number(c.discountPrice)
                  : undefined,
                discountPercent: c.discountPercent
                  ? Number(c.discountPercent)
                  : undefined,
                stockQuantity: c.stockQuantity
                  ? Number(c.stockQuantity)
                  : undefined,
                displayOrder: idx,
              }))
            : undefined,
      };

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

      const response =
        productType === 'basic'
          ? await productsService.createBasic(formData)
          : productType === 'network'
          ? await productsService.createNetwork(formData)
          : await productsService.createRegion(formData);
      toast.success('Basic product created successfully!');
      resetForm();
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

  const handleNetworkProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      galleryImageFiles.forEach(file => {
        formData.append('galleryImages', file);
      });

      const networkColorImages: File[] = [];

      // Format networks data properly for backend
      const formattedNetworks = networks.map((network, netIdx) => ({
        networkName: network.networkName,
        isDefault: network.isDefault,
        hasDefaultStorages: network.hasDefaultStorages,
        displayOrder: netIdx,
        // Default storages for this network
        defaultStorages: network.hasDefaultStorages
          ? network.defaultStorages.map((storage, storIdx) => ({
              storageSize: storage.storageSize,
              isDefault: storage.isDefault,
              regularPrice: storage.regularPrice
                ? Number(storage.regularPrice)
                : 0,
              comparePrice: storage.regularPrice
                ? Number(storage.regularPrice)
                : 0,
              discountPrice: storage.discountPrice
                ? Number(storage.discountPrice)
                : 0,
              discountPercent: storage.discountPercent
                ? Number(storage.discountPercent)
                : 0,
              stockQuantity: storage.stockQuantity
                ? Number(storage.stockQuantity)
                : 0,
              lowStockAlert: storage.lowStockAlert
                ? Number(storage.lowStockAlert)
                : 5,
              displayOrder: storIdx,
            }))
          : undefined,
        // Colors in this network
        colors: network.colors.map((color, colorIdx) => {
          let imageIndex = -1;
          if (color.colorImageFile) {
            networkColorImages.push(color.colorImageFile);
            imageIndex = networkColorImages.length - 1;
          }

          return {
            colorName: color.colorName,
            isDefault: color.isDefault,
            hasStorage: color.hasStorage,
            useDefaultStorages: color.useDefaultStorages,
            displayOrder: colorIdx,
            colorImageIndex: imageIndex > -1 ? imageIndex : undefined,
            // If no storage, use single price
            singlePrice: !color.hasStorage
              ? Number(color.singlePrice) || 0
              : undefined,
            singleComparePrice: !color.hasStorage
              ? Number(color.singleComparePrice) || 0
              : undefined,
            singleStockQuantity: !color.hasStorage
              ? Number(color.singleStockQuantity) || 0
              : undefined,
            // Custom storages (only if has storage and not using defaults)
            storages:
              color.hasStorage && !color.useDefaultStorages
                ? color.storages.map((storage, storIdx) => ({
                    storageSize: storage.storageSize,
                    isDefault: storage.isDefault,
                    regularPrice: storage.regularPrice
                      ? Number(storage.regularPrice)
                      : 0,
                    comparePrice: storage.regularPrice
                      ? Number(storage.regularPrice)
                      : 0,
                    discountPrice: storage.discountPrice
                      ? Number(storage.discountPrice)
                      : 0,
                    discountPercent: storage.discountPercent
                      ? Number(storage.discountPercent)
                      : 0,
                    stockQuantity: storage.stockQuantity
                      ? Number(storage.stockQuantity)
                      : 0,
                    lowStockAlert: storage.lowStockAlert
                      ? Number(storage.lowStockAlert)
                      : 5,
                    displayOrder: storIdx,
                  }))
                : undefined,
          };
        }),
      }));

      // Append network color images
      networkColorImages.forEach(file => {
        formData.append('colors', file);
      });

      const payload: any = {
        productType: 'network',
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
        isActive,
        isOnline,
        isPos,
        isPreOrder,
        isOfficial,
        freeShipping,
        isEmi,
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
        networks: formattedNetworks.length > 0 ? formattedNetworks : undefined,
      };

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

      const response =
        productType === 'basic'
          ? await productsService.createBasic(formData)
          : productType === 'network'
          ? await productsService.createNetwork(formData)
          : await productsService.createRegion(formData);
      toast.success('Network product created successfully!');
      resetForm();
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

  const handleRegionProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      galleryImageFiles.forEach(file => {
        formData.append('galleryImages', file);
      });

      const regionColorImages: File[] = [];

      // Format regions data properly for backend
      const formattedRegions = regions.map((region, regIdx) => ({
        regionName: region.regionName,
        isDefault: region.isDefault,
        displayOrder: regIdx,
        // Default storages for this region (always present)
        defaultStorages: region.defaultStorages.map((storage, storIdx) => ({
          storageSize: storage.storageSize,
          isDefault: storage.isDefault,
          regularPrice: storage.regularPrice ? Number(storage.regularPrice) : 0,
          comparePrice: storage.regularPrice ? Number(storage.regularPrice) : 0,
          discountPrice: storage.discountPrice
            ? Number(storage.discountPrice)
            : 0,
          discountPercent: storage.discountPercent
            ? Number(storage.discountPercent)
            : 0,
          stockQuantity: storage.stockQuantity
            ? Number(storage.stockQuantity)
            : 0,
          lowStockAlert: storage.lowStockAlert
            ? Number(storage.lowStockAlert)
            : 5,
          displayOrder: storIdx,
        })),
        // Colors in this region
        colors: region.colors.map((color, colorIdx) => {
          let imageIndex = -1;
          if (color.colorImageFile) {
            regionColorImages.push(color.colorImageFile);
            imageIndex = regionColorImages.length - 1;
          }

          return {
            colorName: color.colorName,
            isDefault: color.isDefault,
            hasStorage: color.hasStorage,
            useDefaultStorages: color.useDefaultStorages,
            displayOrder: colorIdx,
            colorImageIndex: imageIndex > -1 ? imageIndex : undefined,
            // If no storage, use single price
            singlePrice: !color.hasStorage
              ? Number(color.singlePrice) || 0
              : undefined,
            singleComparePrice: !color.hasStorage
              ? Number(color.singleComparePrice) || 0
              : undefined,
            singleStockQuantity: !color.hasStorage
              ? Number(color.singleStockQuantity) || 0
              : undefined,
            // Custom storages (only if has storage and not using defaults)
            storages:
              color.hasStorage && !color.useDefaultStorages
                ? color.storages.map((storage, storIdx) => ({
                    storageSize: storage.storageSize,
                    isDefault: storage.isDefault,
                    regularPrice: storage.regularPrice
                      ? Number(storage.regularPrice)
                      : 0,
                    comparePrice: storage.regularPrice
                      ? Number(storage.regularPrice)
                      : 0,
                    discountPrice: storage.discountPrice
                      ? Number(storage.discountPrice)
                      : 0,
                    discountPercent: storage.discountPercent
                      ? Number(storage.discountPercent)
                      : 0,
                    stockQuantity: storage.stockQuantity
                      ? Number(storage.stockQuantity)
                      : 0,
                    lowStockAlert: storage.lowStockAlert
                      ? Number(storage.lowStockAlert)
                      : 5,
                    displayOrder: storIdx,
                  }))
                : undefined,
          };
        }),
      }));

      // Append region color images
      regionColorImages.forEach(file => {
        formData.append('colors', file);
      });

      const payload: any = {
        productType: 'region',
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
        isActive,
        isOnline,
        isPos,
        isPreOrder,
        isOfficial,
        freeShipping,
        isEmi,
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
        regions: formattedRegions.length > 0 ? formattedRegions : undefined,
      };

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

      const response =
        productType === 'basic'
          ? await productsService.createBasic(formData)
          : productType === 'network'
          ? await productsService.createNetwork(formData)
          : await productsService.createRegion(formData);
      toast.success('Region product created successfully!');
      resetForm();
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Add New Product
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Create and configure a new product listing for your store
        </p>
      </div>

      <Tabs
        value={productType}
        onValueChange={value => {
          setProductType(value as ProductType);
          resetForm();
        }}
        className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Basic Product
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Network Product
          </TabsTrigger>
          <TabsTrigger
            value="region"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Region Product
          </TabsTrigger>
        </TabsList>

        <form
          onSubmit={
            productType === 'basic'
              ? handleBasicProductSubmit
              : productType === 'network'
              ? handleNetworkProductSubmit
              : handleRegionProductSubmit
          }
          className="space-y-6 pt-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productName}
                    onChange={handleProductNameChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="product-url-slug"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter product description (Markdown supported)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <input
                  id="shortDescription"
                  type="text"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  className="min-h-10 rounded-lg border-2 border-gray-200 p-4 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition-all w-full"
                  placeholder="Enter short description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900">
                    Category *
                  </Label>
                  <div className="mt-2 rounded-lg border-2 border-gray-200 bg-white p-4 max-h-48 overflow-y-auto shadow-sm hover:border-gray-300 transition-colors">
                    {categories.length > 0 ? (
                      <div className="space-y-2">
                        {categories.map(cat => (
                          <div key={cat.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`category-${cat.id}`}
                              checked={selectedCategories.includes(cat.id)}
                              onCheckedChange={() => toggleCategory(cat.id)}
                            />
                            <Label
                              htmlFor={`category-${cat.id}`}
                              className="font-normal cursor-pointer">
                              {cat.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Loading categories...
                      </p>
                    )}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p className="mt-2 text-xs text-gray-600">
                      {selectedCategories.length} selected
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">
                    Brand *
                  </Label>
                  <div className="mt-2 rounded-lg border-2 border-gray-200 bg-white p-4 max-h-48 overflow-y-auto shadow-sm hover:border-gray-300 transition-colors">
                    {brands.length > 0 ? (
                      <div className="space-y-2">
                        {brands.map(br => (
                          <div key={br.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`brand-${br.id}`}
                              checked={selectedBrands.includes(br.id)}
                              onCheckedChange={() => toggleBrand(br.id)}
                            />
                            <Label
                              htmlFor={`brand-${br.id}`}
                              className="font-normal cursor-pointer">
                              {br.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading brands...</p>
                    )}
                  </div>
                  {selectedBrands.length > 0 && (
                    <p className="mt-2 text-xs text-gray-600">
                      {selectedBrands.length} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    placeholder="e.g., SKU-001"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="e.g., SKU123"
                  />
                </div>
                <div>
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    value={warranty}
                    onChange={e => setWarranty(e.target.value)}
                    placeholder="e.g., 1 year"
                  />
                </div>
              </div>

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
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Product Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isOnline">Online</Label>
                  <Switch
                    id="isOnline"
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPos">POS</Label>
                  <Switch
                    id="isPos"
                    checked={isPos}
                    onCheckedChange={setIsPos}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPreOrder">Pre-Order</Label>
                  <Switch
                    id="isPreOrder"
                    checked={isPreOrder}
                    onCheckedChange={setIsPreOrder}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isOfficial">Official</Label>
                  <Switch
                    id="isOfficial"
                    checked={isOfficial}
                    onCheckedChange={setIsOfficial}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="freeShipping">Free Shipping</Label>
                  <Switch
                    id="freeShipping"
                    checked={freeShipping}
                    onCheckedChange={setFreeShipping}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isEmi">EMI Available</Label>
                  <Switch
                    id="isEmi"
                    checked={isEmi}
                    onCheckedChange={setIsEmi}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Thumbnail Image
                </Label>
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-gray-400 transition-all bg-gray-50/50">
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
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload thumbnail
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
                <Label className="text-sm font-medium text-gray-900">
                  Gallery Images
                </Label>
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-gray-400 transition-all bg-gray-50/50">
                  {galleryImagePreviews.length > 0 ? (
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
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <label className="flex cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300">
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
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload gallery images
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="SEO title"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="seoKeywords">
                  SEO Keywords (comma-separated)
                </Label>
                <Input
                  id="seoKeywords"
                  value={seoKeywords}
                  onChange={e => setSeoKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <Label htmlFor="seoCanonical">Canonical URL</Label>
                <Input
                  id="seoCanonical"
                  value={seoCanonical}
                  onChange={e => setSeoCanonical(e.target.value)}
                  placeholder="https://example.com/product"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {specifications.map((spec, idx) => (
                <div key={spec.id} className="flex gap-2">
                  <Input
                    placeholder="Key (e.g., Color)"
                    value={spec.key}
                    onChange={e =>
                      updateSpecification(spec.id, 'key', e.target.value)
                    }
                  />
                  <Input
                    placeholder="Value (e.g., Black)"
                    value={spec.value}
                    onChange={e =>
                      updateSpecification(spec.id, 'value', e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(spec.id)}
                    className="rounded bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200">
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecification}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
                Add Specification
              </button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Additional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardPoints">Reward Points</Label>
                  <Input
                    id="rewardPoints"
                    type="number"
                    value={rewardPoints}
                    onChange={e => setRewardPoints(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minBookingPrice">Min Booking Price</Label>
                  <Input
                    id="minBookingPrice"
                    type="number"
                    value={minBookingPrice}
                    onChange={e => setMinBookingPrice(e.target.value)}
                    placeholder="0"
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
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </CardContent>
          </Card>

          <TabsContent value="basic" className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Colors & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {basicColors.map((color, idx) => (
                  <div key={color.id} className="space-y-4 rounded border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={color.isDefault}
                          onCheckedChange={checked => {
                            // Set this color as default and unset others
                            setBasicColors(prev =>
                              prev.map(c => ({
                                ...c,
                                isDefault:
                                  c.id === color.id ? !!checked : false,
                              })),
                            );
                          }}
                          id={`default-${color.id}`}
                        />
                        <Label
                          htmlFor={`default-${color.id}`}
                          className="text-sm font-medium cursor-pointer">
                          Default Price (Show in UI)
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBasicColor(color.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                          placeholder="e.g., Midnight Black"
                        />
                      </div>
                      <div>
                        <Label>Stock Quantity</Label>
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
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Color Image</Label>
                      <div className="mt-2 rounded border-2 border-dashed border-gray-300 p-4">
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
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Click to upload color image
                            </span>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Regular Price</Label>
                        <Input
                          type="number"
                          value={color.regularPrice}
                          onChange={e => {
                            const regularPrice =
                              parseFloat(e.target.value) || 0;
                            const percent =
                              parseFloat(color.discountPercent) || 0;
                            const discountPrice = Math.round(
                              regularPrice - (regularPrice * percent) / 100,
                            );

                            updateBasicColor(
                              color.id,
                              'regularPrice',
                              e.target.value,
                            );
                            if (percent > 0) {
                              updateBasicColor(
                                color.id,
                                'discountPrice',
                                discountPrice.toString(),
                              );
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discount %</Label>
                        <Input
                          type="number"
                          value={color.discountPercent}
                          onChange={e => {
                            const percent = parseFloat(e.target.value) || 0;
                            const regularPrice =
                              parseFloat(color.regularPrice) || 0;
                            const discountPrice = Math.round(
                              regularPrice - (regularPrice * percent) / 100,
                            );

                            updateBasicColor(
                              color.id,
                              'discountPercent',
                              e.target.value,
                            );
                            updateBasicColor(
                              color.id,
                              'discountPrice',
                              discountPrice.toString(),
                            );
                          }}
                          placeholder="0"
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
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeBasicColor(color.id)}
                      className="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200">
                      Remove Color
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBasicColor}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                  <Plus className="h-4 w-4" />
                  Add Color
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Networks & Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {networks.map(network => (
                  <div
                    key={network.id}
                    className="space-y-4 rounded border p-4">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label>Network Name</Label>
                        <Input
                          value={network.networkName}
                          onChange={e =>
                            updateNetwork(
                              network.id,
                              'networkName',
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Retail Partner A"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Has Default Storages</Label>
                        <Switch
                          checked={network.hasDefaultStorages}
                          onCheckedChange={e =>
                            updateNetwork(network.id, 'hasDefaultStorages', e)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNetwork(network.id)}
                        className="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200">
                        Remove
                      </button>
                    </div>

                    {network.hasDefaultStorages && (
                      <div className="space-y-3 rounded-lg bg-gray-50 border-2 border-gray-200 p-4">
                        <Label className="block font-semibold">
                          Default Storages (for this Network)
                        </Label>
                        <p className="text-xs text-gray-600">
                          These storages will be used by all colors unless
                          overridden
                        </p>
                        {network.defaultStorages.map(storage => (
                          <div
                            key={storage.id}
                            className="space-y-2 rounded bg-white p-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                checked={storage.isDefault}
                                onCheckedChange={checked => {
                                  // Set this storage as default and unset ALL other storages (default + custom)
                                  setNetworks(prev =>
                                    prev.map(n =>
                                      n.id === network.id
                                        ? {
                                            ...n,
                                            defaultStorages:
                                              n.defaultStorages.map(s => ({
                                                ...s,
                                                isDefault:
                                                  s.id === storage.id
                                                    ? !!checked
                                                    : false,
                                              })),
                                            colors: n.colors.map(c => ({
                                              ...c,
                                              storages: c.storages.map(cs => ({
                                                ...cs,
                                                isDefault: false, // Unset all custom storages
                                              })),
                                            })),
                                          }
                                        : n,
                                    ),
                                  );
                                }}
                                id={`network-storage-default-${storage.id}`}
                              />
                              <Label
                                htmlFor={`network-storage-default-${storage.id}`}
                                className="text-xs cursor-pointer">
                                Default Storage
                              </Label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs">Storage Size</Label>
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
                                <Label className="text-xs">Regular Price</Label>
                                <Input
                                  type="number"
                                  value={storage.regularPrice}
                                  onChange={e => {
                                    const regularPrice =
                                      parseFloat(e.target.value) || 0;
                                    const percent =
                                      parseFloat(storage.discountPercent) || 0;
                                    const discountPrice = Math.round(
                                      regularPrice -
                                        (regularPrice * percent) / 100,
                                    );

                                    updateDefaultStorageInNetwork(
                                      network.id,
                                      storage.id,
                                      'regularPrice',
                                      e.target.value,
                                    );
                                    if (percent > 0) {
                                      updateDefaultStorageInNetwork(
                                        network.id,
                                        storage.id,
                                        'discountPrice',
                                        discountPrice.toString(),
                                      );
                                    }
                                  }}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Discount %</Label>
                                <Input
                                  type="number"
                                  value={storage.discountPercent}
                                  onChange={e => {
                                    const percent =
                                      parseFloat(e.target.value) || 0;
                                    const regularPrice =
                                      parseFloat(storage.regularPrice) || 0;
                                    const discountPrice = Math.round(
                                      regularPrice -
                                        (regularPrice * percent) / 100,
                                    );
                                    updateDefaultStorageInNetwork(
                                      network.id,
                                      storage.id,
                                      'discountPercent',
                                      e.target.value,
                                    );
                                    updateDefaultStorageInNetwork(
                                      network.id,
                                      storage.id,
                                      'discountPrice',
                                      discountPrice.toString(),
                                    );
                                  }}
                                  placeholder="0"
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
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
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
                                  placeholder="0"
                                />
                              </div>
                              {network.defaultStorages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeDefaultStorageFromNetwork(
                                      network.id,
                                      storage.id,
                                    )
                                  }
                                  className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200">
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDefaultStorageToNetwork(network.id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                          <Plus className="h-3 w-3" />
                          Add Default Storage
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label className="block font-semibold">Colors</Label>
                      {network.colors.map(color => (
                        <div
                          key={color.id}
                          className="space-y-2 rounded bg-gray-50 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={color.isDefault}
                                onCheckedChange={checked => {
                                  // Set this color as default and unset others in this network
                                  setNetworks(prev =>
                                    prev.map(n =>
                                      n.id === network.id
                                        ? {
                                            ...n,
                                            colors: n.colors.map(c => ({
                                              ...c,
                                              isDefault:
                                                c.id === color.id
                                                  ? !!checked
                                                  : false,
                                            })),
                                          }
                                        : n,
                                    ),
                                  );
                                }}
                                id={`network-default-${color.id}`}
                              />
                              <Label
                                htmlFor={`network-default-${color.id}`}
                                className="text-xs cursor-pointer">
                                Default
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label className="text-sm">Color Name</Label>
                              <Input
                                value={color.colorName}
                                onChange={e =>
                                  updateColorInNetwork(
                                    network.id,
                                    color.id,
                                    'colorName',
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., Midnight Black"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm">Color Image</Label>
                              {color.colorImage ? (
                                <div className="relative inline-block">
                                  <img
                                    src={color.colorImage}
                                    alt={color.colorName}
                                    className="h-12 w-12 rounded object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeNetworkColorImage(
                                        network.id,
                                        color.id,
                                      )
                                    }
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600">
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 p-2">
                                  <Upload className="h-4 w-4 text-gray-400" />
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
                            <button
                              type="button"
                              onClick={() =>
                                removeColorFromNetwork(network.id, color.id)
                              }
                              className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200">
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-sm">
                              Has Storage Options
                            </Label>
                            <Switch
                              checked={color.hasStorage}
                              onCheckedChange={e =>
                                updateColorInNetwork(
                                  network.id,
                                  color.id,
                                  'hasStorage',
                                  e,
                                )
                              }
                            />
                          </div>

                          {!color.hasStorage && (
                            <div className="grid grid-cols-3 gap-2 rounded bg-white p-2">
                              <div>
                                <Label className="text-xs">Single Price</Label>
                                <Input
                                  type="number"
                                  value={color.singlePrice}
                                  onChange={e =>
                                    updateColorInNetwork(
                                      network.id,
                                      color.id,
                                      'singlePrice',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Compare Price</Label>
                                <Input
                                  type="number"
                                  value={color.singleComparePrice}
                                  onChange={e =>
                                    updateColorInNetwork(
                                      network.id,
                                      color.id,
                                      'singleComparePrice',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Stock</Label>
                                <Input
                                  type="number"
                                  value={color.singleStockQuantity}
                                  onChange={e =>
                                    updateColorInNetwork(
                                      network.id,
                                      color.id,
                                      'singleStockQuantity',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          )}

                          {color.hasStorage && (
                            <>
                              {network.hasDefaultStorages && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">
                                    Use Default Storages
                                  </Label>
                                  <Switch
                                    checked={color.useDefaultStorages}
                                    onCheckedChange={e =>
                                      updateColorInNetwork(
                                        network.id,
                                        color.id,
                                        'useDefaultStorages',
                                        e,
                                      )
                                    }
                                  />
                                </div>
                              )}

                              {(!network.hasDefaultStorages ||
                                !color.useDefaultStorages) && (
                                <>
                                  {color.storages.map(storage => (
                                    <div
                                      key={storage.id}
                                      className="space-y-2 rounded bg-white p-2">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                          checked={storage.isDefault}
                                          onCheckedChange={checked => {
                                            // Set this storage as default and unset ALL other storages (default + all colors' storages)
                                            setNetworks(prev =>
                                              prev.map(n =>
                                                n.id === network.id
                                                  ? {
                                                      ...n,
                                                      defaultStorages:
                                                        n.defaultStorages.map(
                                                          ds => ({
                                                            ...ds,
                                                            isDefault: false, // Unset all default storages
                                                          }),
                                                        ),
                                                      colors: n.colors.map(c =>
                                                        c.id === color.id
                                                          ? {
                                                              ...c,
                                                              storages:
                                                                c.storages.map(
                                                                  s => ({
                                                                    ...s,
                                                                    isDefault:
                                                                      s.id ===
                                                                      storage.id
                                                                        ? !!checked
                                                                        : false,
                                                                  }),
                                                                ),
                                                            }
                                                          : {
                                                              ...c,
                                                              storages:
                                                                c.storages.map(
                                                                  s => ({
                                                                    ...s,
                                                                    isDefault:
                                                                      false, // Unset other colors' storages
                                                                  }),
                                                                ),
                                                            },
                                                      ),
                                                    }
                                                  : n,
                                              ),
                                            );
                                          }}
                                          id={`network-color-storage-${storage.id}`}
                                        />
                                        <Label
                                          htmlFor={`network-color-storage-${storage.id}`}
                                          className="text-xs cursor-pointer">
                                          Default
                                        </Label>
                                      </div>
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <Label className="text-xs">
                                            Storage Size
                                          </Label>
                                          <Input
                                            value={storage.storageSize}
                                            onChange={e =>
                                              updateStorageInNetwork(
                                                network.id,
                                                color.id,
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
                                            onChange={e => {
                                              const regularPrice =
                                                parseFloat(e.target.value) || 0;
                                              const percent =
                                                parseFloat(
                                                  storage.discountPercent,
                                                ) || 0;
                                              const discountPrice = Math.round(
                                                regularPrice -
                                                  (regularPrice * percent) /
                                                    100,
                                              );

                                              updateStorageInNetwork(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'regularPrice',
                                                e.target.value,
                                              );
                                              if (percent > 0) {
                                                updateStorageInNetwork(
                                                  network.id,
                                                  color.id,
                                                  storage.id,
                                                  'discountPrice',
                                                  discountPrice.toString(),
                                                );
                                              }
                                            }}
                                            placeholder="0"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">
                                            Discount %
                                          </Label>
                                          <Input
                                            type="number"
                                            value={storage.discountPercent}
                                            onChange={e => {
                                              const percent =
                                                parseFloat(e.target.value) || 0;
                                              const regularPrice =
                                                parseFloat(
                                                  storage.regularPrice,
                                                ) || 0;
                                              const discountPrice = Math.round(
                                                regularPrice -
                                                  (regularPrice * percent) /
                                                    100,
                                              );
                                              updateStorageInNetwork(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'discountPercent',
                                                e.target.value,
                                              );
                                              updateStorageInNetwork(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'discountPrice',
                                                discountPrice.toString(),
                                              );
                                            }}
                                            placeholder="0"
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
                                              updateStorageInNetwork(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'discountPrice',
                                                e.target.value,
                                              )
                                            }
                                            placeholder="0"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <div className="flex-1">
                                          <Label className="text-xs">
                                            Stock
                                          </Label>
                                          <Input
                                            type="number"
                                            value={storage.stockQuantity}
                                            onChange={e =>
                                              updateStorageInNetwork(
                                                network.id,
                                                color.id,
                                                storage.id,
                                                'stockQuantity',
                                                e.target.value,
                                              )
                                            }
                                            placeholder="0"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeStorageFromNetwork(
                                              network.id,
                                              color.id,
                                              storage.id,
                                            )
                                          }
                                          className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200">
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addStorageToNetwork(network.id, color.id)
                                    }
                                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                                    <Plus className="h-3 w-3" />
                                    Add Storage
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addColorToNetwork(network.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                        <Plus className="h-4 w-4" />
                        Add Color
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNetwork}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                  <Plus className="h-4 w-4" />
                  Add Network
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="region" className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Regions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {regions.map(region => (
                  <div key={region.id} className="space-y-4 rounded border p-4">
                    <div className="flex items-end gap-4">
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
                          placeholder="e.g., US, UK, EU"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Is Default</Label>
                        <Switch
                          checked={region.isDefault}
                          onCheckedChange={e =>
                            updateRegion(region.id, 'isDefault', e)
                          }
                        />
                      </div>
                      {regions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRegion(region.id)}
                          className="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200">
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 rounded-lg bg-gray-50 border-2 border-gray-200 p-4">
                      <Label className="block font-semibold">
                        Default Storages
                      </Label>
                      {region.defaultStorages.map(storage => (
                        <div
                          key={storage.id}
                          className="space-y-2 rounded bg-white p-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              checked={storage.isDefault}
                              onCheckedChange={checked => {
                                // Set this storage as default and unset ALL other storages (default + custom)
                                setRegions(prev =>
                                  prev.map(r =>
                                    r.id === region.id
                                      ? {
                                          ...r,
                                          defaultStorages:
                                            r.defaultStorages.map(s => ({
                                              ...s,
                                              isDefault:
                                                s.id === storage.id
                                                  ? !!checked
                                                  : false,
                                            })),
                                          colors: r.colors.map(c => ({
                                            ...c,
                                            storages: c.storages.map(cs => ({
                                              ...cs,
                                              isDefault: false, // Unset all custom storages
                                            })),
                                          })),
                                        }
                                      : r,
                                  ),
                                );
                              }}
                              id={`region-storage-default-${storage.id}`}
                            />
                            <Label
                              htmlFor={`region-storage-default-${storage.id}`}
                              className="text-xs cursor-pointer">
                              Default Storage
                            </Label>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs">Storage Size</Label>
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
                              <Label className="text-xs">Regular Price</Label>
                              <Input
                                type="number"
                                value={storage.regularPrice}
                                onChange={e => {
                                  const regularPrice =
                                    parseFloat(e.target.value) || 0;
                                  const percent =
                                    parseFloat(storage.discountPercent) || 0;
                                  const discountPrice = Math.round(
                                    regularPrice -
                                      (regularPrice * percent) / 100,
                                  );

                                  updateDefaultStorageInRegion(
                                    region.id,
                                    storage.id,
                                    'regularPrice',
                                    e.target.value,
                                  );
                                  if (percent > 0) {
                                    updateDefaultStorageInRegion(
                                      region.id,
                                      storage.id,
                                      'discountPrice',
                                      discountPrice.toString(),
                                    );
                                  }
                                }}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Discount %</Label>
                              <Input
                                type="number"
                                value={storage.discountPercent}
                                onChange={e => {
                                  const percent =
                                    parseFloat(e.target.value) || 0;
                                  const regularPrice =
                                    parseFloat(storage.regularPrice) || 0;
                                  const discountPrice = Math.round(
                                    regularPrice -
                                      (regularPrice * percent) / 100,
                                  );
                                  updateDefaultStorageInRegion(
                                    region.id,
                                    storage.id,
                                    'discountPercent',
                                    e.target.value,
                                  );
                                  updateDefaultStorageInRegion(
                                    region.id,
                                    storage.id,
                                    'discountPrice',
                                    discountPrice.toString(),
                                  );
                                }}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Discount Price</Label>
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
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label className="text-xs">Stock</Label>
                              <Input
                                type="number"
                                value={storage.stockQuantity}
                                onChange={e =>
                                  updateDefaultStorageInRegion(
                                    region.id,
                                    storage.id,
                                    'stockQuantity',
                                    e.target.value,
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            {region.defaultStorages.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeDefaultStorageFromRegion(
                                    region.id,
                                    storage.id,
                                  )
                                }
                                className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addDefaultStorageToRegion(region.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                        <Plus className="h-3 w-3" />
                        Add Default Storage
                      </button>
                    </div>

                    <div className="space-y-3">
                      <Label className="block font-semibold">Colors</Label>
                      {region.colors.map(color => (
                        <div
                          key={color.id}
                          className="space-y-2 rounded bg-gray-50 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={color.isDefault}
                                onCheckedChange={checked => {
                                  // Set this color as default and unset others in this region
                                  setRegions(prev =>
                                    prev.map(r =>
                                      r.id === region.id
                                        ? {
                                            ...r,
                                            colors: r.colors.map(c => ({
                                              ...c,
                                              isDefault:
                                                c.id === color.id
                                                  ? !!checked
                                                  : false,
                                            })),
                                          }
                                        : r,
                                    ),
                                  );
                                }}
                                id={`region-default-${color.id}`}
                              />
                              <Label
                                htmlFor={`region-default-${color.id}`}
                                className="text-xs cursor-pointer">
                                Default
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label className="text-sm">Color Name</Label>
                              <Input
                                value={color.colorName}
                                onChange={e =>
                                  updateColorInRegion(
                                    region.id,
                                    color.id,
                                    'colorName',
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., Midnight"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm">Color Image</Label>
                              {color.colorImage ? (
                                <div className="relative inline-block">
                                  <img
                                    src={color.colorImage}
                                    alt={color.colorName}
                                    className="h-12 w-12 rounded object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeRegionColorImage(
                                        region.id,
                                        color.id,
                                      )
                                    }
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600">
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 p-2">
                                  <Upload className="h-4 w-4 text-gray-400" />
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
                            <button
                              type="button"
                              onClick={() =>
                                removeColorFromRegion(region.id, color.id)
                              }
                              className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200">
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-sm">
                              Has Storage Options
                            </Label>
                            <Switch
                              checked={color.hasStorage}
                              onCheckedChange={e =>
                                updateColorInRegion(
                                  region.id,
                                  color.id,
                                  'hasStorage',
                                  e,
                                )
                              }
                            />
                          </div>

                          {color.hasStorage && (
                            <>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">
                                  Use Default Storages
                                </Label>
                                <Switch
                                  checked={color.useDefaultStorages}
                                  onCheckedChange={e =>
                                    updateColorInRegion(
                                      region.id,
                                      color.id,
                                      'useDefaultStorages',
                                      e,
                                    )
                                  }
                                />
                              </div>

                              {!color.useDefaultStorages && (
                                <>
                                  {color.storages.map(storage => (
                                    <div
                                      key={storage.id}
                                      className="space-y-2 rounded bg-white p-2">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                          checked={storage.isDefault}
                                          onCheckedChange={checked => {
                                            // Set this storage as default and unset ALL other storages (default + all colors' storages)
                                            setRegions(prev =>
                                              prev.map(r =>
                                                r.id === region.id
                                                  ? {
                                                      ...r,
                                                      defaultStorages:
                                                        r.defaultStorages.map(
                                                          ds => ({
                                                            ...ds,
                                                            isDefault: false, // Unset all default storages
                                                          }),
                                                        ),
                                                      colors: r.colors.map(c =>
                                                        c.id === color.id
                                                          ? {
                                                              ...c,
                                                              storages:
                                                                c.storages.map(
                                                                  s => ({
                                                                    ...s,
                                                                    isDefault:
                                                                      s.id ===
                                                                      storage.id
                                                                        ? !!checked
                                                                        : false,
                                                                  }),
                                                                ),
                                                            }
                                                          : {
                                                              ...c,
                                                              storages:
                                                                c.storages.map(
                                                                  s => ({
                                                                    ...s,
                                                                    isDefault:
                                                                      false, // Unset other colors' storages
                                                                  }),
                                                                ),
                                                            },
                                                      ),
                                                    }
                                                  : r,
                                              ),
                                            );
                                          }}
                                          id={`region-color-storage-${storage.id}`}
                                        />
                                        <Label
                                          htmlFor={`region-color-storage-${storage.id}`}
                                          className="text-xs cursor-pointer">
                                          Default
                                        </Label>
                                      </div>
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <Label className="text-xs">
                                            Storage
                                          </Label>
                                          <Input
                                            value={storage.storageSize}
                                            onChange={e =>
                                              updateStorageInRegion(
                                                region.id,
                                                color.id,
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
                                            Regular
                                          </Label>
                                          <Input
                                            type="number"
                                            value={storage.regularPrice}
                                            onChange={e => {
                                              const regularPrice =
                                                parseFloat(e.target.value) || 0;
                                              const percent =
                                                parseFloat(
                                                  storage.discountPercent,
                                                ) || 0;
                                              const discountPrice = Math.round(
                                                regularPrice -
                                                  (regularPrice * percent) /
                                                    100,
                                              );

                                              updateStorageInRegion(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'regularPrice',
                                                e.target.value,
                                              );
                                              if (percent > 0) {
                                                updateStorageInRegion(
                                                  region.id,
                                                  color.id,
                                                  storage.id,
                                                  'discountPrice',
                                                  discountPrice.toString(),
                                                );
                                              }
                                            }}
                                            placeholder="0"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">
                                            Discount %
                                          </Label>
                                          <Input
                                            type="number"
                                            value={storage.discountPercent}
                                            onChange={e => {
                                              const percent =
                                                parseFloat(e.target.value) || 0;
                                              const regularPrice =
                                                parseFloat(
                                                  storage.regularPrice,
                                                ) || 0;
                                              const discountPrice = Math.round(
                                                regularPrice -
                                                  (regularPrice * percent) /
                                                    100,
                                              );
                                              updateStorageInRegion(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'discountPercent',
                                                e.target.value,
                                              );
                                              updateStorageInRegion(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'discountPrice',
                                                discountPrice.toString(),
                                              );
                                            }}
                                            placeholder="0"
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
                                              updateStorageInRegion(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'discountPrice',
                                                e.target.value,
                                              )
                                            }
                                            placeholder="0"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <div className="flex-1">
                                          <Label className="text-xs">
                                            Stock
                                          </Label>
                                          <Input
                                            type="number"
                                            value={storage.stockQuantity}
                                            onChange={e =>
                                              updateStorageInRegion(
                                                region.id,
                                                color.id,
                                                storage.id,
                                                'stockQuantity',
                                                e.target.value,
                                              )
                                            }
                                            placeholder="0"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeStorageFromRegion(
                                              region.id,
                                              color.id,
                                              storage.id,
                                            )
                                          }
                                          className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200">
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addStorageToRegion(region.id, color.id)
                                    }
                                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                                    <Plus className="h-3 w-3" />
                                    Add Storage
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addColorToRegion(region.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                        <Plus className="h-4 w-4" />
                        Add Color
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRegion}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                  <Plus className="h-4 w-4" />
                  Add Region
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all">
              {isSubmitting
                ? 'Creating Product...'
                : `Create ${
                    productType === 'basic'
                      ? 'Basic'
                      : productType === 'network'
                      ? 'Network'
                      : 'Region'
                  } Product`}
            </Button>
            <Link href="/admin/products">
              <Button
                type="button"
                variant="outline"
                className="text-gray-700 hover:bg-gray-50 border-2 px-8 py-6 text-base font-medium transition-all">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Tabs>
    </div>
  );
}

export default withProtectedRoute(NewProductPage);
