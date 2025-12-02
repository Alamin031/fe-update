/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, MoreVertical, GripVertical } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import {
  herobannerService,
  Herobanner,
} from "../../lib/api/services/herobanner";
import { withProtectedRoute } from "../../lib/auth/protected-route";

function Page() {
  const [heroImages, setHeroImages] = useState<Herobanner[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Herobanner | null>(null);
  const [editImageData, setEditImageData] = useState<{
    id: string;
    img: File | string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const data = await herobannerService.findAll();
      setHeroImages(data);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (img: Herobanner) => {
    setSelectedImage(img);
    setEditImageData({ id: img.id, img: img.img });
    setEditOpen(true);
  };

  const handleDeleteClick = (img: Herobanner) => {
    setSelectedImage(img);
    setDeleteOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editImageData) {
      setLoading(true);
      try {
        await herobannerService.update(editImageData.id, {
          img: editImageData.img,
        });
        await fetchHeroImages();
        setEditOpen(false);
        setEditImageData(null);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedImage) {
      setLoading(true);
      try {
        await herobannerService.remove(selectedImage.id);
        await fetchHeroImages();
        setDeleteOpen(false);
        setSelectedImage(null);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
  };

  // Multiple image upload handler (calls API)
  const handleHeroImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        await herobannerService.create({ img: file });
      }
      await fetchHeroImages();
      setIsUploadDialogOpen(false);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hero Section Images
          </h1>
          <p className="text-muted-foreground">
            Manage homepage hero section images (slider).
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Hero Images</DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4 py-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem(
                  "heroImagesInput"
                ) as HTMLInputElement;
                if (input && input.files) {
                  await handleHeroImagesUpload({
                    target: input,
                  } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
            >
              <div className="grid gap-2">
                <Label>Images</Label>
                <Input
                  id="heroImagesInput"
                  name="heroImagesInput"
                  type="file"
                  accept="image/*"
                  multiple
                />
                <p className="text-xs text-muted-foreground">
                  Upload one or more images (1920×600 recommended)
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  Submit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {heroImages.map((img) => (
              <div
                key={img.id}
                className="flex items-center gap-4 rounded-lg border border-border p-4"
              >
                <div className="cursor-grab text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="h-20 w-40 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={img.img || "/placeholder.svg"}
                    alt="Hero Image"
                    width={160}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(img)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(img)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Hero Image Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Hero Image</DialogTitle>
            <DialogDescription>Update hero image</DialogDescription>
          </DialogHeader>
          {editImageData && (
            <form className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Hero Image</Label>
                <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                  <Image
                    src={
                      typeof editImageData.img === "string"
                        ? editImageData.img
                        : "/placeholder.svg"
                    }
                    alt="Hero Image"
                    width={300}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setEditImageData((prev) =>
                      prev ? { ...prev, img: file } : prev
                    );
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Click to change image (1920×600 recommended)
                </p>
              </div>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hero Image Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero image? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withProtectedRoute(Page, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
