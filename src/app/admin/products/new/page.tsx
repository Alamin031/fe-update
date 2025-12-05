/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {useState, useEffect} from 'react';
import productsService from '../../../lib/api/services/products';
import categoriesService from '../../../lib/api/services/categories';
import brandsService from '../../../lib/api/services/brands';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  GripVertical,
  Image as ImageIcon,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {withProtectedRoute} from '../../../lib/auth/protected-route';

type Tab = 'basic' | 'networks' | 'regions';

function NewProductPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [productId, setProductId] = useState<string>('');

  // Basic product info
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [productCode, setProductCode] = useState('');
  const [sku, setSku] = useState('');
  const [warranty, setWarranty] = useState('');

  // Category and Brand
  const [categories, setCategories] = useState<{id: string; name: string}[]>(
    [],
  );
  const [brands, setBrands] = useState<{id: string; name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');

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

  // Videos
  const [videos, setVideos] = useState<
    Array<{
      id: string;
      url: string;
      type: string;
    }>
  >([{id: 'video-1', url: '', type: 'youtube'}]);

  interface DirectColorVariant {
    defaultPrice: string;
    defaultComparePrice: string;
    defaultDiscountPercent: string;
    defaultDiscountPrice: string;
    defaultStockQuantity: string;
    defaultLowStockAlert: string;
    colors: Array<{
      id: string;
      colorName: string;
      colorImage: string;
    }>;
    customPricing: Array<{
      id: string;
      colorId: string;
      price: string;
      comparePrice: string;
      discountPercent: string;
      discountPrice: string;
      stockQuantity: string;
      lowStockAlert: string;
    }>;
  }

  const [directColorVariant, setDirectColorVariant] =
    useState<DirectColorVariant>({
      defaultPrice: '',
      defaultComparePrice: '',
      defaultDiscountPercent: '',
      defaultDiscountPrice: '',
      defaultStockQuantity: '',
      defaultLowStockAlert: '5',
      colors: [],
      customPricing: [],
    });

  // Networks → Colors → Storages → Prices
  const [networks, setNetworks] = useState<
    Array<{
      id: string;
      networkName: string;
      priceAdjustment: string;
      isDefault: boolean;
      colors: Array<{
        id: string;
        colorName: string;
        colorImage: string;
        hasStorage: boolean;
        singlePrice: string;
        singleComparePrice: string;
        singleStockQuantity: string;
        storages: Array<{
          id: string;
          storageSize: string;
          regularPrice: string;
          discountPrice: string;
          discountPercent: string;
          stockQuantity: string;
          lowStockAlert: string;
        }>;
      }>;
    }>
  >([]);

  // Regions → Default Storages + Colors (with optional custom storages)
  const [regions, setRegions] = useState<
    Array<{
      id: string;
      regionName: string;
      isDefault: boolean;
      defaultStorages: Array<{
        id: string;
        storageSize: string;
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
        hasStorage: boolean;
        useDefaultStorages: boolean;
        singlePrice: string;
        singleComparePrice: string;
        singleStockQuantity: string;
        storages: Array<{
          id: string;
          storageSize: string;
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

  // Specifications (flat list)
  const [specifications, setSpecifications] = useState<
    Array<{
      id: string;
      key: string;
      value: string;
    }>
  >([{id: 'spec-1', key: '', value: ''}]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Rich text editor
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleShortDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    setShortDescription(e.currentTarget.innerHTML);
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

  const updateSpecification = (specId: string, field: string, value: string) => {
    setSpecifications(
      specifications.map(s =>
        s.id === specId ? {...s, [field]: value} : s,
      ),
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
        isDefault: false,
        colors: [
          {
            id: `color-${Date.now()}`,
            colorName: '',
            colorImage: '',
            hasStorage: true,
            singlePrice: '',
            singleComparePrice: '',
            singleStockQuantity: '',
            storages: [
              {
                id: `storage-${Date.now()}`,
                storageSize: '',
                regularPrice: '',
                discountPrice: '',
                discountPercent: '',
                stockQuantity: '',
                lowStockAlert: '5',
              },
            ],
          },
        ],
      },
    ]);
  };

  const removeNetwork = (networkId: string) => {
    setNetworks(networks.filter(n => n.id !== networkId));
  };

  const updateNetwork = (networkId: string, field: string, value: any) => {
    setNetworks(
      networks.map(n => (n.id === networkId ? {...n, [field]: value} : n)),
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
                  hasStorage: true,
                  singlePrice: '',
                  singleComparePrice: '',
                  singleStockQuantity: '',
                  storages: [
                    {
                      id: `storage-${Date.now()}`,
                      storageSize: '',
                      regularPrice: '',
                      discountPrice: '',
                      discountPercent: '',
                      stockQuantity: '',
                      lowStockAlert: '5',
                    },
                  ],
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
    setNetworks(
      networks.map(n =>
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
    setNetworks(
      networks.map(n =>
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
    setRegions(
      regions.map(r => (r.id === regionId ? {...r, [field]: value} : r)),
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
    setRegions(
      regions.map(r =>
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
    setRegions(
      regions.map(r =>
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

  const removeDefaultStorageFromRegion = (regionId: string, storageId: string) => {
    setRegions(
      regions.map(r =>
        r.id === regionId
          ? {
              ...r,
              defaultStorages: r.defaultStorages.filter(s => s.id !== storageId),
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
    setRegions(
      regions.map(r =>
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

  // SUBMIT FUNCTIONS FOR EACH TAB
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

      const payload: any = {
        name: productName,
        slug,
        description: description || undefined,
        shortDescription: shortDescription || undefined,
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
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

      const response = await productsService.createWithFormData(formData);
      setProductId(response.id);

      alert('✓ Basic product created successfully!');
      setActiveTab('networks');
    } catch (err: any) {
      console.error('Error creating basic product:', err);
      alert(`Error: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNetworksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      alert('Please create basic product first');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        directColors: directColorVariant.colors.length > 0 ? directColorVariant : undefined,
        networks: networks.length > 0 ? networks : undefined,
      };

      const response = await productsService.update(productId, payload);
      alert('✓ Networks and colors saved successfully!');
      setActiveTab('regions');
    } catch (err: any) {
      console.error('Error saving networks:', err);
      alert(`Error: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      alert('Please create basic product first');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        regions: regions.length > 0 ? regions : undefined,
      };

      await productsService.update(productId, payload);
      alert('✓ Regions saved successfully! Product is complete.');
      setActiveTab('basic');
      setProductId('');
    } catch (err: any) {
      console.error('Error saving regions:', err);
      alert(`Error: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-gray-600">Create a new product listing with 3 steps</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            1. Basic Product
          </button>
          <button
            onClick={() => {
              if (productId) setActiveTab('networks');
              else alert('Create basic product first');
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'networks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } ${!productId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            2. Networks & Colors
          </button>
          <button
            onClick={() => {
              if (productId) setActiveTab('regions');
              else alert('Create basic product first');
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'regions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } ${!productId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            3. Regions
          </button>
        </div>
      </div>

      {activeTab === 'basic' && (
        <form onSubmit={handleBasicProductSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label>Short Description</Label>
                <div className="mb-2 flex gap-1 border-b border-gray-200 pb-2">
                  <button
                    type="button"
                    onClick={() => formatText('bold')}
                    className="rounded px-3 py-1 text-sm font-medium hover:bg-gray-100"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic')}
                    className="rounded px-3 py-1 text-sm font-medium hover:bg-gray-100"
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('underline')}
                    className="rounded px-3 py-1 text-sm font-medium hover:bg-gray-100"
                  >
                    Underline
                  </button>
                </div>
                <div
                  id="shortDescription"
                  contentEditable
                  onInput={handleShortDescriptionChange}
                  className="min-h-24 rounded border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  suppressContentEditableWarning
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(br => (
                        <SelectItem key={br.id} value={br.id}>
                          {br.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Switch id="isPos" checked={isPos} onCheckedChange={setIsPos} />
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

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Thumbnail Image</Label>
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
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload thumbnail</span>
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
                <Label>Gallery Images</Label>
                <div className="mt-2 rounded border-2 border-dashed border-gray-300 p-6">
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
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
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
                      <span className="text-sm text-gray-600">Click to upload gallery images</span>
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

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
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

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    className="rounded bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecification}
                className="mt-2 rounded bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200"
              >
                + Add Specification
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Basic Product & Continue'}
            </Button>
            <Link href="/admin/products">
              <Button
                type="button"
                variant="outline"
                className="text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      )}

      {activeTab === 'networks' && (
        <form onSubmit={handleNetworksSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Direct Colors (No Variants)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                For simple products with just color options (no storage/size variants)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Price</Label>
                  <Input
                    type="number"
                    value={directColorVariant.defaultPrice}
                    onChange={e =>
                      setDirectColorVariant({
                        ...directColorVariant,
                        defaultPrice: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Default Compare Price</Label>
                  <Input
                    type="number"
                    value={directColorVariant.defaultComparePrice}
                    onChange={e =>
                      setDirectColorVariant({
                        ...directColorVariant,
                        defaultComparePrice: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Networks & Colors with Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {networks.map(network => (
                <div key={network.id} className="space-y-4 rounded border p-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label>Network Name</Label>
                      <Input
                        value={network.networkName}
                        onChange={e =>
                          updateNetwork(network.id, 'networkName', e.target.value)
                        }
                        placeholder="e.g., Retail Partner A"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Price Adjustment</Label>
                      <Input
                        type="number"
                        value={network.priceAdjustment}
                        onChange={e =>
                          updateNetwork(network.id, 'priceAdjustment', e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNetwork(network.id)}
                      className="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>

                  {network.colors.map(color => (
                    <div key={color.id} className="space-y-2 rounded bg-gray-50 p-3">
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
                        <button
                          type="button"
                          onClick={() =>
                            removeColorFromNetwork(network.id, color.id)
                          }
                          className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {color.storages.map(storage => (
                        <div
                          key={storage.id}
                          className="space-y-2 rounded bg-white p-2"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Storage Size</Label>
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
                              <Label className="text-xs">Regular Price</Label>
                              <Input
                                type="number"
                                value={storage.regularPrice}
                                onChange={e =>
                                  updateStorageInNetwork(
                                    network.id,
                                    color.id,
                                    storage.id,
                                    'regularPrice',
                                    e.target.value,
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Discount Price</Label>
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
                              <Label className="text-xs">Stock</Label>
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
                              className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200"
                            >
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
                        className="text-xs text-blue-600 hover:underline"
                      >
                        + Add Storage
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addColorToNetwork(network.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add Color
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addNetwork}
                className="rounded bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200"
              >
                + Add Network
              </button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Networks & Continue'}
            </Button>
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </form>
      )}

      {activeTab === 'regions' && (
        <form onSubmit={handleRegionsSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {regions.map(region => (
                <div key={region.id} className="space-y-4 rounded border p-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label>Region Name</Label>
                      <Input
                        value={region.regionName}
                        onChange={e =>
                          updateRegion(region.id, 'regionName', e.target.value)
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
                        className="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 rounded bg-blue-50 p-3">
                    <Label className="block font-semibold">Default Storages</Label>
                    {region.defaultStorages.map(storage => (
                      <div
                        key={storage.id}
                        className="space-y-2 rounded bg-white p-2"
                      >
                        <div className="grid grid-cols-3 gap-2">
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
                              onChange={e =>
                                updateDefaultStorageInRegion(
                                  region.id,
                                  storage.id,
                                  'regularPrice',
                                  e.target.value,
                                )
                              }
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
                              className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDefaultStorageToRegion(region.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + Add Default Storage
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Label className="block font-semibold">Colors</Label>
                    {region.colors.map(color => (
                      <div key={color.id} className="space-y-2 rounded bg-gray-50 p-3">
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
                          <button
                            type="button"
                            onClick={() =>
                              removeColorFromRegion(region.id, color.id)
                            }
                            className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Has Storage Options</Label>
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
                              <Label className="text-sm">Use Default Storages</Label>
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
                                    className="space-y-2 rounded bg-white p-2"
                                  >
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <Label className="text-xs">Storage</Label>
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
                                        <Label className="text-xs">Regular</Label>
                                        <Input
                                          type="number"
                                          value={storage.regularPrice}
                                          onChange={e =>
                                            updateStorageInRegion(
                                              region.id,
                                              color.id,
                                              storage.id,
                                              'regularPrice',
                                              e.target.value,
                                            )
                                          }
                                          placeholder="0"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Discount</Label>
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
                                        <Label className="text-xs">Stock</Label>
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
                                        className="rounded bg-red-100 px-2 py-2 text-red-600 hover:bg-red-200"
                                      >
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
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  + Add Storage
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
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRegion}
                className="rounded bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200"
              >
                + Add Region
              </button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete & Save Product'}
            </Button>
            <button
              type="button"
              onClick={() => setActiveTab('networks')}
              className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default withProtectedRoute(NewProductPage);
