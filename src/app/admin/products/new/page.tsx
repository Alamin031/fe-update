/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, X, Plus, GripVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
// Tabs are not used in this page; removed unused import to tidy file

export default function NewProductPage() {
  // Product Name and Slug state
  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");

  // Slugify helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  // When product name changes, update slug if slug matches previous slugified name or is empty
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProductName(newName);
    // Only auto-update slug if user hasn't manually changed it
    setSlug((prevSlug) => {
      // compute previous auto-slug (based on the previous productName) and the new auto-slug
      const prevAuto = slugify(productName);
      const newAuto = slugify(newName);
      if (prevSlug === prevAuto || prevSlug === "") {
        return newAuto;
      }
      return prevSlug;
    });
  };

  // Allow manual slug editing
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
  };
  // Network, Size, and Plug state
  const [networks, setNetworks] = useState([{ id: "network-1", value: "" }]);
  const [sizes, setSizes] = useState([{ id: "size-1", value: "" }]);
  const [plugs, setPlugs] = useState([{ id: "plug-1", value: "" }]);

  const addPlug = () => {
    setPlugs([...plugs, { id: `plug-${Date.now()}`, value: "" }]);
  };
  const removePlug = (id: string) => {
    setPlugs(plugs.filter((p) => p.id !== id));
  };
  const updatePlug = (id: string, value: string) => {
    setPlugs(plugs.map((p) => (p.id === id ? { ...p, value } : p)));
  };

  const addNetwork = () => {
    setNetworks([...networks, { id: `network-${Date.now()}`, value: "" }]);
  };
  const removeNetwork = (id: string) => {
    setNetworks(networks.filter((n) => n.id !== id));
  };
  const updateNetwork = (id: string, value: string) => {
    setNetworks(networks.map((n) => (n.id === id ? { ...n, value } : n)));
  };

  const addSize = () => {
    setSizes([...sizes, { id: `size-${Date.now()}`, value: "" }]);
  };
  const removeSize = (id: string) => {
    setSizes(sizes.filter((s) => s.id !== id));
  };
  const updateSize = (id: string, value: string) => {
    setSizes(sizes.map((s) => (s.id === id ? { ...s, value } : s)));
  };
  // Dynamic region state: name, price, stock
  const [regions, setRegions] = useState([
    { id: "region-1", name: "E-Sim UAE", price: 0, stock: 0 },
  ]);
  const [selectedRegion, setSelectedRegion] = useState("region-1");

  const addRegion = () => {
    setRegions([
      ...regions,
      { id: `region-${Date.now()}`, name: "", price: 0, stock: 0 },
    ]);
  };

  const removeRegion = (id: string) => {
    setRegions(regions.filter((r) => r.id !== id));
    if (selectedRegion === id && regions.length > 1) {
      setSelectedRegion(regions[0].id);
    }
  };

  const updateRegion = (
    id: string,
    field: "name" | "price" | "stock",
    value: string | number
  ) => {
    setRegions(
      regions.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };
  const [images, setImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Handle gallery image upload
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // For demo, use object URLs. In production, upload and use URLs from server/cloud.
      const newImages = filesArray.map((file) => URL.createObjectURL(file));
      setGalleryImages((prev) => [...prev, ...newImages]);
    }
  };

  // Handle product images upload (primary images grid)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };
  const [variants, setVariants] = useState([
    { id: "1", name: "256GB", price: 129999, stock: 25 },
  ]);
  const [emiAvailable, setEmiAvailable] = useState("no");
  const [specifications, setSpecifications] = useState([
    { id: "spec-1", key: "", value: "" },
  ]);
  // Removed single color selection, only using multiple color UI
  const [colors, setColors] = useState([
    { id: "color-1", name: "Midnight", code: "#53565A" },
  ]);

  const addColor = () => {
    setColors([
      ...colors,
      { id: `color-${Date.now()}`, name: "", code: "#000000" },
    ]);
  };

  const removeColor = (id: string) => {
    setColors(colors.filter((c) => c.id !== id));
  };

  const updateColor = (id: string, field: "name" | "code", value: string) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      { id: Date.now().toString(), key: "", value: "" },
    ]);
  };

  const removeSpecification = (id: string) => {
    setSpecifications(specifications.filter((s) => s.id !== id));
  };

  const updateSpecification = (
    id: string,
    field: "key" | "value",
    value: string
  ) => {
    setSpecifications(
      specifications.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now().toString(), name: "", price: 0, stock: 0 },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (
    id: string,
    field: "name" | "price" | "stock",
    value: string | number
  ) => {
    setVariants(
      variants.map((v) =>
        v.id === id
          ? { ...v, [field]: field === "name" ? String(value) : Number(value) }
          : v
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product listing.</p>
        </div>
      </div>

      {/* Single tab: Product Info */}
      <Card>
        <CardHeader>
          <CardTitle>Product Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={productName}
                onChange={handleProductNameChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descriptions</Label>
              <Textarea
                id="description"
                placeholder={
                  "You can use headings, bullet points, and links. Example:\n\n## MacBook Air M2 13.6-inch 16/256GB 8 Core CPU 8 Core GPU\n\n- Feature 1\n- Feature 2\n\n[Apple Gadgets](https://applegadgets.com.bd)"
                }
                rows={12}
                className="font-mono"
              />
              <span className="text-xs text-muted-foreground">
                Supports headings, bullet points, and links (Markdown allowed).
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphones">Smartphones</SelectItem>
                    <SelectItem value="laptops">Laptops</SelectItem>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="wearables">Wearables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                    <SelectItem value="sony">Sony</SelectItem>
                    <SelectItem value="lg">LG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Combine Product Code, SKU, Review Star, Reward Points into one responsive row */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="productCode">Product Code</Label>
                <Input id="productCode" placeholder="Enter product code" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="Enter SKU" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewStar">Review Star Point</Label>
                <Input id="reviewStar" type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.5" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rewardPoints">Reward Points</Label>
                <Input id="rewardPoints" type="number" min="0" placeholder="e.g. 100" />
              </div>
            </div>
          </div>

          {/* Regions and Colors side-by-side on small+ screens */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-semibold">Regions:</Label>
              <div className="rounded-lg border p-4 space-y-2">
                {regions.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center gap-2 mb-2"
                  >
                    <Input
                      placeholder="Region name (e.g. E-Sim USA)"
                      value={r.name}
                      className="w-40"
                      onChange={(e) => updateRegion(r.id, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={r.price}
                      className="w-28"
                      onChange={(e) =>
                        updateRegion(r.id, "price", Number(e.target.value))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={r.stock}
                      className="w-24"
                      onChange={(e) =>
                        updateRegion(r.id, "stock", Number(e.target.value))
                      }
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
              {/* Region selection for price/stock display */}
              <div className="rounded-lg border p-4 flex flex-wrap gap-4 mt-2">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-colors focus:outline-none ${
                      selectedRegion === r.id
                        ? "border-orange-400 ring-2 ring-orange-200 font-semibold"
                        : "border-transparent"
                    } bg-muted`}
                    onClick={() => setSelectedRegion(r.id)}
                  >
                    {r.name || "Unnamed"}
                  </button>
                ))}
              </div>
              {/* Show price and stock for selected region */}
              <div className="mt-2 text-sm text-muted-foreground">
                {regions.length > 0 && (
                  <>
                    <span>
                      Price:{" "}
                      <b>
                        {regions.find((r) => r.id === selectedRegion)?.price ?? 0}
                      </b>
                    </span>
                    <span className="ml-6">
                      Stock:{" "}
                      <b>
                        {regions.find((r) => r.id === selectedRegion)?.stock ?? 0}
                      </b>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Colors:</Label>
              <div className="rounded-lg border p-4 space-y-2">
                {colors.map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="Color name (e.g. Midnight)"
                      value={c.name}
                      className="w-40"
                      onChange={(e) => updateColor(c.id, "name", e.target.value)}
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
              {/* Show color swatches */}
              <div className="flex flex-wrap gap-4 mt-2">
                {colors.map((c) => (
                  <div key={c.id} className="flex flex-col items-center">
                    <span
                      className="inline-block w-7 h-7 rounded-full border mb-1"
                      style={{ backgroundColor: c.code, borderColor: "#bbb" }}
                    ></span>
                    <span className="text-xs text-muted-foreground">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Network, Size, and Plug side-by-side on small+ screens */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-semibold">Network:</Label>
              <div className="rounded-lg border p-4 space-y-2">
                {networks.map((n, idx) => (
                  <div key={n.id} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="Network (e.g. 5G, LTE, GSM)"
                      value={n.value}
                      className="w-48"
                      onChange={(e) => updateNetwork(n.id, e.target.value)}
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
              <Label className="font-semibold">Size:</Label>
              <div className="rounded-lg border p-4 space-y-2">
                {sizes.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="Size (e.g. 6.1-inch, Large)"
                      value={s.value}
                      className="w-48"
                      onChange={(e) => updateSize(s.id, e.target.value)}
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
              <Label className="font-semibold">Plug:</Label>
              <div className="rounded-lg border p-4 space-y-2">
                {plugs.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="Plug (e.g. US, EU, UK)"
                      value={p.value}
                      className="w-48"
                      onChange={(e) => updatePlug(p.id, e.target.value)}
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

          {/* Product Images */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Images</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg border border-border bg-muted"
                >
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute left-2 top-2 cursor-grab text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  {image && (
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Drag images to reorder. First image will be the primary image.
            </p>
          </div>

          {/* Gallery Images */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Gallery Images</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg border border-border bg-muted"
                >
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    onClick={() => removeGalleryImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Add Gallery Images
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImageChange}
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You can add multiple gallery images. Drag-and-drop reordering is
              not supported here.
            </p>
          </div>

          {/* Pricing & Variants */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pricing & Variants</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input id="price" type="number" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mrp">MRP (₹)</Label>
                <Input id="mrp" type="number" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Cost Price (₹)</Label>
                <Input id="cost" type="number" placeholder="0" />
              </div>
            </div>
            {/* EMI Radio Button */}
            <div className="flex items-center gap-4 mt-2">
              <Label className="mr-2">EMI:</Label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="emiAvailable"
                  value="yes"
                  checked={emiAvailable === "yes"}
                  onChange={() => setEmiAvailable("yes")}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="emiAvailable"
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
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="flex items-center gap-4 rounded-lg border border-border p-4"
                    >
                      <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                      <div className="grid flex-1 gap-4 sm:grid-cols-3">
                        <Input
                          placeholder="Variant name (e.g., 256GB)"
                          value={variant.name}
                          onChange={(e) =>
                            updateVariant(variant.id, "name", e.target.value)
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "price",
                              Number(e.target.value || 0)
                            )
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "stock",
                              Number(e.target.value || 0)
                            )
                          }
                        />
                      </div>
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
          </div>

          {/* Inventory Management */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Inventory Management</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lowStock">Low Stock Alert</Label>
                <Input id="lowStock" type="number" placeholder="10" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="trackStock" defaultChecked />
              <Label htmlFor="trackStock">Track stock quantity</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="allowBackorder" />
              <Label htmlFor="allowBackorder">Allow backorders</Label>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">SEO Settings</h2>
            <div className="grid gap-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input id="metaTitle" placeholder="Enter meta title" />
              <p className="text-xs text-muted-foreground">
                Recommended: 50-60 characters
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                placeholder="Enter meta description"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 150-160 characters
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="product-url-slug"
                value={slug}
                onChange={handleSlugChange}
              />
            </div>
          </div>

          {/* Specification Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Specification</h2>
            <div className="rounded-lg border">
              <div className="grid grid-cols-3 bg-muted font-semibold p-2 rounded-t-lg">
                <div>Key</div>
                <div className="col-span-2">Value</div>
              </div>
              {specifications.map((spec, idx) => (
                <div
                  key={spec.id}
                  className="grid grid-cols-3 gap-2 items-center border-t p-2"
                >
                  <Input
                    placeholder="e.g. Brand"
                    value={spec.key}
                    onChange={(e) =>
                      updateSpecification(spec.id, "key", e.target.value)
                    }
                  />
                  <Input
                    className="col-span-1"
                    placeholder="e.g. Apple"
                    value={spec.value}
                    onChange={(e) =>
                      updateSpecification(spec.id, "value", e.target.value)
                    }
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
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline">Save as Draft</Button>
        <Button variant="success">Publish Product</Button>
      </div>
    </div>
  );
}
