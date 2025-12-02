/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Plus } from "lucide-react";
import brandsService from "../../lib/api/services/brands";
import { Brand } from "@/app/types";

export default function BrandPage() {
  const [brands, setBrands] = useState<Brand[] | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{
    id: string;
    name: string;
    slug: string;
    logo: File | string;
  } | null>(null);
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    logo: File | string;
  }>({ name: "", slug: "", logo: "" });
  const [loading, setLoading] = useState(false);

  // For delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<{
    id: string;
    name: string;
    slug: string;
    logo: string;
  } | null>(null);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Fetch brands from API
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    // setLoading(true);
    try {
      const data = await brandsService.findAll();
      setBrands(data); // Use only the array, not the whole response object
    } catch {
      // handle error
    } finally {
      // setLoading(false);
    }
  };

  // Handlers
  const handleSaveBrand = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        logo: form.logo,
      };
      // Simulate 1.5s delay for UX
      await new Promise((res) => setTimeout(res, 1500));
      if (editMode && selectedBrand) {
        await brandsService.update(selectedBrand.id, payload);
        toast.success("Brand updated successfully!");
      } else {
        await brandsService.create(payload);
        toast.success("Brand added successfully!");
      }
      await fetchBrands();
      setModalOpen(false);
    } catch (err: any) {
      let errorMsg = "Something went wrong!";
      if (err && typeof err === "object") {
        if (err.message) {
          errorMsg = err.message;
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          errorMsg = err.response.data.message;
        }
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteBrand = (brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  }) => {
    setBrandToDelete(brand);
    setDeleteModalOpen(true);
  };

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return;
    setLoading(true);
    try {
      await brandsService.delete(brandToDelete.id);
      await fetchBrands();
      toast.success("Brand deleted successfully!");
    } catch {
      toast.error("Failed to delete brand.");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setBrandToDelete(null);
    }
  };
  const handleAddBrand = () => {
    setForm({ name: "", slug: "", logo: "" });
    setEditMode(false);
    setViewMode(false);
    setModalOpen(true);
  };
  const handleEditBrand = (brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  }) => {
    setSelectedBrand(brand);
    setForm({ name: brand.name, slug: brand.slug, logo: brand.logo });
    setEditMode(true);
    setViewMode(false);
    setModalOpen(true);
  };
  const handleViewBrand = (brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  }) => {
    setSelectedBrand(brand);
    setForm({ name: brand.name, slug: brand.slug, logo: brand.logo });
    setEditMode(false);
    setViewMode(true);
    setModalOpen(true);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        slug: name === "name" ? slugify(value) : prev.slug,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
        <Button onClick={handleAddBrand} className="gap-2">
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Brand List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Slug</th>
                  <th className="px-4 py-2 text-left">Logo</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(brands) ? brands : []).map((brand) => (
                  <tr key={brand.id}>
                    <td className="px-4 py-2">{brand.name}</td>
                    <td className="px-4 py-2">{brand.slug}</td>
                    <td className="px-4 py-2">
                      {brand.logo && typeof brand.logo === "string" ? (
                        // Show image for both base64 and URL
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-8 w-16 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No logo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewBrand(brand)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBrand(brand)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleDeleteBrand(brand)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(Array.isArray(brands) ? brands.length : 0) === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No brands found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Add/Edit/View Brand Modal */}
      {/* Delete Confirmation Modal (not nested) */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <b>{brandToDelete?.name}</b>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDeleteBrand}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewMode ? "View Brand" : editMode ? "Edit Brand" : "Add Brand"}
            </DialogTitle>
            <DialogDescription>
              {viewMode
                ? "View brand details."
                : editMode
                ? "Edit the selected brand."
                : "Add a new brand."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!viewMode) handleSaveBrand();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                disabled={viewMode}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleFormChange}
                disabled={viewMode}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleFormChange}
                disabled={viewMode}
              />
              {form.logo && typeof form.logo !== "string" && (
                <>
                  <img
                    src={URL.createObjectURL(form.logo)}
                    alt="Preview"
                    className="h-16 w-32 object-contain mt-2"
                  />
                  <span className="block text-xs text-muted-foreground mt-1 text-center">
                    Image size: 140x80px
                  </span>
                </>
              )}
              {form.logo && typeof form.logo === "string" && (
                <>
                  <img
                    src={form.logo}
                    alt="Preview"
                    className="h-16 w-32 object-contain mt-2"
                  />
                  <span className="block text-xs text-muted-foreground mt-1 text-center">
                    Image size: 140x80px
                  </span>
                </>
              )}
              {!form.logo && (
                <span className="block text-xs text-muted-foreground mt-1 text-center">
                  Image size: 140x80px
                </span>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                {viewMode ? "Close" : "Cancel"}
              </Button>
              {!viewMode && (
                <Button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && (
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                  {editMode
                    ? loading
                      ? "Saving..."
                      : "Save Changes"
                    : loading
                    ? "Adding..."
                    : "Add Brand"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
