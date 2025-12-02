/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, MoreVertical, Eye } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import categoriesService from "../../lib/api/services/categories";

// ===== TYPES =====
interface Subcategory {
  id: string;
  name: string;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  banner?: string | File;
  priority?: number;
  subcategories?: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
}

type AddFormData = {
  name: string;
  slug: string;
  priority: string;
  subcategories: Subcategory[];
  banner: string | File;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<Category | null>(null);

  const [addFormData, setAddFormData] = useState<AddFormData>({
    name: "",
    slug: "",
    priority: "",
    subcategories: [],
    banner: "",
  });

  // ===== FETCH =====
  const fetchCategories = async () => {
    try {
      const res = await categoriesService.getAll();
      console.log("Fetched categories:", res);
      setCategories(res);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchCategories();
    };
    load();
  }, []);

  // ===== IMAGE HANDLERS =====
  const handleAddBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAddFormData((f) => ({ ...f, banner: file || "" }));
  };

  const handleEditBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editFormData) return;
    setEditFormData({ ...editFormData, banner: file });
  };

  // ===== CREATE =====
  const handleCreateCategory = async () => {
    try {
      const newCat = await categoriesService.create({
        name: addFormData.name,
        slug: addFormData.slug,
        priority: Number(addFormData.priority),
        banner: addFormData.banner,
      });

      setCategories((prev) =>
        Array.isArray(prev) ? [newCat, ...prev] : [newCat]
      );

      setAddFormData({
        name: "",
        slug: "",
        banner: "",
        priority: "",
        subcategories: [],
      });

      setIsAddDialogOpen(false);
    } catch (err) {}
  };

  // ===== UPDATE =====
  const handleSaveEdit = async () => {
    if (!editFormData) return;

    try {
      const updated = await categoriesService.update(editFormData.id, {
        name: editFormData.name,
        slug: editFormData.slug,
        priority: editFormData.priority,
        banner: editFormData.banner,
      });

      setCategories((cats) =>
        cats.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {}

    setEditOpen(false);
    setEditFormData(null);
  };

  // ===== DELETE =====
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      await categoriesService.delete(selectedCategory.id);
      setCategories((cats) => cats.filter((c) => c.id !== selectedCategory.id));
    } catch (err) {}

    setDeleteOpen(false);
    setSelectedCategory(null);
  };

  // ===== SUBCATEGORY =====

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCreateCategory();
              }}
              className="space-y-4 py-2"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={addFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setAddFormData((f) => ({
                      ...f,
                      name,
                      slug: name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                    }));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={addFormData.slug}
                  onChange={(e) =>
                    setAddFormData((f) => ({
                      ...f,
                      slug: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner">Banner</Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleAddBannerChange}
                />
                {addFormData.banner &&
                  typeof addFormData.banner !== "string" && (
                    <img
                      src={URL.createObjectURL(addFormData.banner)}
                      alt="Preview"
                      className="h-16 w-32 object-contain mt-2 rounded border"
                    />
                  )}
                {addFormData.banner &&
                  typeof addFormData.banner === "string" &&
                  addFormData.banner !== "" && (
                    <img
                      src={addFormData.banner}
                      alt="Preview"
                      className="h-16 w-32 object-contain mt-2 rounded border"
                    />
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={addFormData.priority}
                  onChange={(e) =>
                    setAddFormData((f) => ({
                      ...f,
                      priority: e.target.value,
                    }))
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== TABLE LIST ===== */}
      <div className="w-full bg-white rounded-lg shadow overflow-x-auto border mt-4">
        <table className="min-w-[700px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {/* <th className="px-3 py-2 text-left font-semibold">ID</th> */}
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Slug</th>
              <th className="px-3 py-2 text-left font-semibold">Description</th>
              <th className="px-3 py-2 text-left font-semibold">Banner</th>
              <th className="px-3 py-2 text-left font-semibold">Priority</th>
              <th className="px-3 py-2 text-left font-semibold">Created</th>
              <th className="px-3 py-2 text-left font-semibold">Updated</th>
              <th className="px-3 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(categories) ? categories : []).map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{cat.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{cat.slug}</td>
                <td className="px-3 py-2 max-w-[200px] truncate">
                  {cat.description || "-"}
                </td>
                <td className="px-3 py-2 align-middle">
                  <div className="flex items-center justify-center min-w-12 min-h-12">
                    <Image
                      src={
                        typeof cat.banner === "string" && cat.banner
                          ? cat.banner
                          : "/placeholder.svg"
                      }
                      alt={cat.name}
                      width={48}
                      height={48}
                      className="rounded border object-cover bg-gray-100 max-w-12 max-h-12 w-auto h-auto"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {cat.priority ?? "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {cat.createdAt
                    ? new Date(cat.createdAt).toLocaleString()
                    : "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {cat.updatedAt
                    ? new Date(cat.updatedAt).toLocaleString()
                    : "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCategory(cat);
                          setViewOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCategory(cat);
                          setEditFormData(cat);
                          setEditOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCategory(cat);
                          setDeleteOpen(true);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== EDIT MODAL ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          {editFormData && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleSaveEdit();
              }}
              className="space-y-4 py-2"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editFormData.slug}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, slug: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-banner">Banner</Label>
                <Input
                  id="edit-banner"
                  type="file"
                  accept="image/*"
                  onChange={handleEditBannerChange}
                />
                {editFormData.banner &&
                  typeof editFormData.banner !== "string" && (
                    <img
                      src={URL.createObjectURL(editFormData.banner)}
                      alt="Preview"
                      className="h-16 w-32 object-contain mt-2 rounded border"
                    />
                  )}
                {editFormData.banner &&
                  typeof editFormData.banner === "string" &&
                  editFormData.banner !== "" && (
                    <img
                      src={editFormData.banner}
                      alt="Preview"
                      className="h-16 w-32 object-contain mt-2 rounded border"
                    />
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={editFormData.priority ?? ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      priority: Number(e.target.value),
                    })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DELETE MODAL ===== */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
