"use client";

import { useState, useEffect } from "react";
import { X, Plus, Upload, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import productsService from "../../lib/api/services/products";
import categoriesService from "../../lib/api/services/categories";
import brandsService from "../../lib/api/services/brands";

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSuccess?: (updatedProduct: any) => void;
}

export function EditProductModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: EditProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

  // Basic fields
  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [productCode, setProductCode] = useState("");
  const [sku, setSku] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [averageRating, setAverageRating] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");

  // Pricing
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [emiAvailable, setEmiAvailable] = useState("no");

  // Inventory
  const [stock, setStock] = useState("");
  const [lowStock, setLowStock] = useState("");
  const [trackStock, setTrackStock] = useState(true);
  const [allowBackorder, setAllowBackorder] = useState(false);

  // Images
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImages, setMainImages] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Regions, Colors, Networks, Sizes, Plugs
  const [regions, setRegions] = useState([{ id: "region-1", name: "", price: "", stock: "" }]);
  const [selectedRegion, setSelectedRegion] = useState("region-1");
  const [colors, setColors] = useState([{ id: "color-1", name: "", code: "#000000" }]);
  const [networks, setNetworks] = useState([{ id: "network-1", value: "" }]);
  const [sizes, setSizes] = useState([{ id: "size-1", value: "" }]);
  const [plugs, setPlugs] = useState([{ id: "plug-1", value: "" }]);

  // Variants & Specifications
  const [variants, setVariants] = useState([{ id: "1", name: "", price: "", stock: "" }]);
  const [specifications, setSpecifications] = useState([{ id: "spec-1", key: "", value: "" }]);

  // SEO & Meta
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [model, setModel] = useState("");
  const [minBookingPrice, setMinBookingPrice] = useState("");
  const [highlights, setHighlights] = useState("");
  const [status, setStatus] = useState(true);

  // Initialize form with product data
  useEffect(() => {
    if (product && open) {
      setProductName(product.name || "");
      setSlug(product.slug || "");
      setDescription(product.description || "");
      setProductCode(product.productCode || "");
      setSku(product.sku || "");
      setSelectedCategory(product.categoryId || "");
      setSelectedBrand(product.brandId || "");
      setAverageRating(product.averageRating?.toString() || "");
      setRewardPoints(product.rewardsPoints?.toString() || "");
      setPrice(product.price?.toString() || "");
      setDiscountPrice(product.discountPrice?.toString() || "");
      setDiscountPercent(product.discountPercent?.toString() || "");
      setEmiAvailable(product.emiAvailable ? "yes" : "no");
      setStock(product.stock?.toString() || "");
      setLowStock(product.lowStock?.toString() || "");
      setTrackStock(product.trackStock !== false);
      setAllowBackorder(product.allowBackorder === true);
      setMainImages(product.images || []);
      setGalleryImages(product.gallery || []);
      setRegions(product.regions || [{ id: "region-1", name: "", price: "", stock: "" }]);
      setColors(product.colors || [{ id: "color-1", name: "", code: "#000000" }]);
      setNetworks(product.networks?.map((n: any, i: number) => ({ id: `network-${i}`, value: n })) || [{ id: "network-1", value: "" }]);
      setSizes(product.sizes?.map((s: any, i: number) => ({ id: `size-${i}`, value: s })) || [{ id: "size-1", value: "" }]);
      setPlugs(product.plugs?.map((p: any, i: number) => ({ id: `plug-${i}`, value: p })) || [{ id: "plug-1", value: "" }]);
      setVariants(product.variants || [{ id: "1", name: "", price: "", stock: "" }]);
      setSpecifications(product.specifications || [{ id: "spec-1", key: "", value: "" }]);
      setMetaTitle(product.metaTitle || "");
      setMetaDescription(product.metaDescription || "");
      setMetaKeywords(product.metaKeywords || "");
      setSeoTitle(product.seoTitle || "");
      setSeoDescription(product.seoDescription || "");
      setSeoKeywords(product.seoKeywords || "");
      setModel(product.model || "");
      setMinBookingPrice(product.minBookingPrice?.toString() || "");
      setHighlights(Array.isArray(product.highlights) ? product.highlights.join(", ") : product.highlights || "");
      setStatus(product.status !== false);
    }
  }, [product, open]);

  // Fetch categories and brands
  useEffect(() => {
    if (open) {
      categoriesService.getAll().then((data) => {
        setCategories(data.map((c: any) => ({ id: c.id, name: c.name })));
      });
      brandsService.findAll().then((data) => {
        setBrands(data.map((b: any) => ({ id: b.id, name: b.name })));
      });
    }
  }, [open]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProductName(newName);
    setSlug((prevSlug) => {
      const prevAuto = slugify(productName);
      const newAuto = slugify(newName);
      if (prevSlug === prevAuto || prevSlug === "") {
        return newAuto;
      }
      return prevSlug;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
  };

  // Image handlers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
      setMainImages([URL.createObjectURL(e.target.files[0])]);
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...filesArray]);
      const newImages = filesArray.map((file) => URL.createObjectURL(file));
      setGalleryImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Region handlers
  const addRegion = () => {
    setRegions([...regions, { id: `region-${Date.now()}`, name: "", price: "", stock: "" }]);
  };

  const removeRegion = (id: string) => {
    setRegions(regions.filter((r) => r.id !== id));
    if (selectedRegion === id && regions.length > 1) {
      setSelectedRegion(regions[0].id);
    }
  };

  const updateRegion = (id: string, field: "name" | "price" | "stock", value: string | number) => {
    setRegions(regions.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Color handlers
  const addColor = () => {
    setColors([...colors, { id: `color-${Date.now()}`, name: "", code: "#000000" }]);
  };

  const removeColor = (id: string) => {
    setColors(colors.filter((c) => c.id !== id));
  };

  const updateColor = (id: string, field: "name" | "code", value: string) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // Network handlers
  const addNetwork = () => {
    setNetworks([...networks, { id: `network-${Date.now()}`, value: "" }]);
  };

  const removeNetwork = (id: string) => {
    setNetworks(networks.filter((n) => n.id !== id));
  };

  const updateNetwork = (id: string, value: string) => {
    setNetworks(networks.map((n) => (n.id === id ? { ...n, value } : n)));
  };

  // Size handlers
  const addSize = () => {
    setSizes([...sizes, { id: `size-${Date.now()}`, value: "" }]);
  };

  const removeSize = (id: string) => {
    setSizes(sizes.filter((s) => s.id !== id));
  };

  const updateSize = (id: string, value: string) => {
    setSizes(sizes.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  // Plug handlers
  const addPlug = () => {
    setPlugs([...plugs, { id: `plug-${Date.now()}`, value: "" }]);
  };

  const removePlug = (id: string) => {
    setPlugs(plugs.filter((p) => p.id !== id));
  };

  const updatePlug = (id: string, value: string) => {
    setPlugs(plugs.map((p) => (p.id === id ? { ...p, value } : p)));
  };

  // Variant handlers
  const addVariant = () => {
    setVariants([...variants, { id: Date.now().toString(), name: "", price: "", stock: "" }]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: "name" | "price" | "stock", value: string) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  // Specification handlers
  const addSpecification = () => {
    setSpecifications([...specifications, { id: Date.now().toString(), key: "", value: "" }]);
  };

  const removeSpecification = (id: string) => {
    setSpecifications(specifications.filter((s) => s.id !== id));
  };

  const updateSpecification = (id: string, field: "key" | "value", value: string) => {
    setSpecifications(specifications.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // Handle save
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: productName,
        slug,
        description,
        categoryId: selectedCategory,
        brandId: selectedBrand,
        productCode,
        sku,
        averageRating: averageRating ? Number(averageRating) : undefined,
        rewardsPoints: rewardPoints ? Number(rewardPoints) : undefined,
        price: price ? Number(price) : undefined,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        discountPercent: discountPercent ? Number(discountPercent) : undefined,
        emiAvailable: emiAvailable === "yes" ? "true" : "false",
        stock: stock ? Number(stock) : undefined,
        lowStock: lowStock ? Number(lowStock) : undefined,
        trackStock,
        allowBackorder,
        metaTitle,
        metaDescription,
        image: mainImageFile ? mainImageFile : mainImages.length > 0 ? mainImages[0] : null,
        gallery: [...galleryFiles, ...galleryImages.filter(img => !img.startsWith('blob:'))],
        regions: JSON.stringify(regions.map(({ id, ...rest }) => rest)),
        colors: JSON.stringify(colors.map(({ id, ...rest }) => rest)),
        networks: JSON.stringify(networks.map((n) => n.value).filter(Boolean)),
        sizes: JSON.stringify(sizes.map((s) => s.value).filter(Boolean)),
        plugs: JSON.stringify(plugs.map((p) => p.value).filter(Boolean)),
        variants: JSON.stringify(variants.map(({ id, ...rest }) => rest)),
        specifications: JSON.stringify(specifications.map(({ id, ...rest }) => rest)),
        metaKeywords: metaKeywords,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords,
        model,
        minBookingPrice: minBookingPrice ? Number(minBookingPrice) : null,
        highlights: highlights,
        status,
      };

      await productsService.update(product.id, payload);
      onSuccess?.({ ...product, ...payload });
      onOpenChange(false);
    } catch (err: any) {
      alert("Failed to update product: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product information and settings</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={productName}
                onChange={handleProductNameChange}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">URL Slug</Label>
              <Input
                id="edit-slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="product-url-slug"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger id="edit-brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Product Code</Label>
                <Input
                  id="edit-code"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Enter product code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Enter SKU"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rating">Review Star Point</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={averageRating}
                  onChange={(e) => setAverageRating(e.target.value)}
                  placeholder="e.g. 4.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reward">Reward Points</Label>
                <Input
                  id="edit-reward"
                  type="number"
                  min="0"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="You can use headings, bullet points, and links (Markdown allowed)."
                rows={6}
              />
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Selling Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount-price">Discount Price (₹)</Label>
                <Input
                  id="edit-discount-price"
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount-percent">Discount Percent (%)</Label>
                <Input
                  id="edit-discount-percent"
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Label className="mr-2">EMI Available:</Label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="edit-emi"
                  value="yes"
                  checked={emiAvailable === "yes"}
                  onChange={() => setEmiAvailable("yes")}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="edit-emi"
                  value="no"
                  checked={emiAvailable === "no"}
                  onChange={() => setEmiAvailable("no")}
                />
                <span>No</span>
              </label>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button variant="default" size="sm" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <div key={variant.id} className="flex items-center gap-3 border rounded p-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Variant name"
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                        className="w-24"
                      />
                      <Input
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, "stock", e.target.value)}
                        className="w-24"
                      />
                      {variants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-low-stock">Low Stock Alert</Label>
                <Input
                  id="edit-low-stock"
                  type="number"
                  value={lowStock}
                  onChange={(e) => setLowStock(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-track-stock"
                checked={trackStock}
                onCheckedChange={setTrackStock}
              />
              <Label htmlFor="edit-track-stock">Track stock quantity</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-backorder"
                checked={allowBackorder}
                onCheckedChange={setAllowBackorder}
              />
              <Label htmlFor="edit-backorder">Allow backorders</Label>
            </div>
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Regions</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {regions.map((r) => (
                    <div key={r.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Region name"
                        value={r.name}
                        onChange={(e) => updateRegion(r.id, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Price"
                        value={r.price}
                        onChange={(e) => updateRegion(r.id, "price", e.target.value)}
                        className="w-20"
                      />
                      <Input
                        placeholder="Stock"
                        value={r.stock}
                        onChange={(e) => updateRegion(r.id, "stock", e.target.value)}
                        className="w-20"
                      />
                      {regions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRegion(r.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addRegion}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Region
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Colors</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {colors.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Color name"
                        value={c.name}
                        onChange={(e) => updateColor(c.id, "name", e.target.value)}
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={c.code}
                        className="w-10 h-10 border rounded"
                        onChange={(e) => updateColor(c.id, "code", e.target.value)}
                      />
                      {colors.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeColor(c.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addColor}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Color
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-semibold">Networks</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {networks.map((n) => (
                    <div key={n.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Network (e.g. 5G)"
                        value={n.value}
                        onChange={(e) => updateNetwork(n.id, e.target.value)}
                        className="flex-1"
                      />
                      {networks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNetwork(n.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addNetwork}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Network
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Sizes</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {sizes.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Size (e.g. 6.1-inch)"
                        value={s.value}
                        onChange={(e) => updateSize(s.id, e.target.value)}
                        className="flex-1"
                      />
                      {sizes.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSize(s.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addSize}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Size
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Plugs</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {plugs.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Plug (e.g. US)"
                        value={p.value}
                        onChange={(e) => updatePlug(p.id, e.target.value)}
                        className="flex-1"
                      />
                      {plugs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlug(p.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addPlug}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Plug
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Specifications</Label>
              <div className="rounded-lg border">
                <div className="grid grid-cols-3 bg-muted font-semibold p-2 rounded-t-lg">
                  <div>Key</div>
                  <div className="col-span-2">Value</div>
                </div>
                {specifications.map((spec) => (
                  <div key={spec.id} className="grid grid-cols-3 gap-2 items-center border-t p-2">
                    <Input
                      placeholder="e.g. Brand"
                      value={spec.key}
                      onChange={(e) => updateSpecification(spec.id, "key", e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      className="col-span-1 text-sm"
                      placeholder="e.g. Apple"
                      value={spec.value}
                      onChange={(e) => updateSpecification(spec.id, "value", e.target.value)}
                    />
                    <div className="flex gap-2">
                      {specifications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpecification(spec.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={addSpecification}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Row
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <div className="space-y-2">
              <Label>Product Main Image</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {mainImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border bg-muted">
                    <button
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                      onClick={() => setMainImages(mainImages.filter((_, i) => i !== index))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <img
                      src={image}
                      alt="Main product"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border bg-muted">
                    <button
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <img
                      src={image}
                      alt="Gallery"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Gallery</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageChange}
                  />
                </label>
              </div>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-meta-title">Meta Title</Label>
              <Input
                id="edit-meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Enter meta title (50-60 chars)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meta-description">Meta Description</Label>
              <Textarea
                id="edit-meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enter meta description (150-160 chars)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meta-keywords">Meta Keywords</Label>
              <Input
                id="edit-meta-keywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="e.g. phone, smartphone, android"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seo-title">SEO Title</Label>
              <Input
                id="edit-seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter SEO title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seo-description">SEO Description</Label>
              <Textarea
                id="edit-seo-description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Enter SEO description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seo-keywords">SEO Keywords</Label>
              <Input
                id="edit-seo-keywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="e.g. apple, macbook, m2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model name/number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-min-booking">Min Booking Price</Label>
              <Input
                id="edit-min-booking"
                type="number"
                value={minBookingPrice}
                onChange={(e) => setMinBookingPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-highlights">Highlights</Label>
              <Input
                id="edit-highlights"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="e.g. 5G, 120Hz, AMOLED"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch id="edit-status" checked={status} onCheckedChange={setStatus} />
            <Label htmlFor="edit-status">{status ? "Publish" : "Unpublish"}</Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
