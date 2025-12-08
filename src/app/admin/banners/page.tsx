/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // Hero Section
  const [heroImages, setHeroImages] = useState<Herobanner[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Herobanner | null>(null);
  const [editImageData, setEditImageData] = useState<{ id: string; img: File | string } | null>(null);

  // Bottom Section
  const [bottomImages, setBottomImages] = useState<Herobanner[]>([]);
  const [isBottomUploadDialogOpen, setIsBottomUploadDialogOpen] = useState(false);
  const [bottomEditOpen, setBottomEditOpen] = useState(false);
  const [bottomDeleteOpen, setBottomDeleteOpen] = useState(false);
  const [selectedBottomImage, setSelectedBottomImage] = useState<Herobanner | null>(null);
  const [editBottomImageData, setEditBottomImageData] = useState<{ id: string; img: File | string } | null>(null);

  // Middle Section
  const [middleImages, setMiddleImages] = useState<Herobanner[]>([]);
  const [isMiddleUploadDialogOpen, setIsMiddleUploadDialogOpen] = useState(false);
  const [middleEditOpen, setMiddleEditOpen] = useState(false);
  const [middleDeleteOpen, setMiddleDeleteOpen] = useState(false);
  const [selectedMiddleImage, setSelectedMiddleImage] = useState<Herobanner | null>(null);
  const [editMiddleImageData, setEditMiddleImageData] = useState<{ id: string; img: File | string } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHeroImages();
    fetchBottomImages();
    fetchMiddleImages();
  }, []);

  // Hero Section logic
  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const data = await herobannerService.findAll();
      setHeroImages(data);
    } catch (e) {} finally { setLoading(false); }
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
        await herobannerService.update(editImageData.id, { img: editImageData.img });
        await fetchHeroImages();
        setEditOpen(false);
        setEditImageData(null);
      } catch (e) {} finally { setLoading(false); }
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
      } catch (e) {} finally { setLoading(false); }
    }
  };
  const handleHeroImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        await herobannerService.create({ img: file });
      }
      await fetchHeroImages();
      setIsUploadDialogOpen(false);
    } catch (e) {} finally { setLoading(false); }
  };

  // Bottom Section logic
  const fetchBottomImages = async () => {
    setLoading(true);
    try {
      const data = await herobannerService.findAllBottom();
      setBottomImages(data);
    } catch (e) {} finally { setLoading(false); }
  };
  const handleBottomEditClick = (img: Herobanner) => {
    setSelectedBottomImage(img);
    setEditBottomImageData({ id: img.id, img: img.img });
    setBottomEditOpen(true);
  };
  const handleBottomDeleteClick = (img: Herobanner) => {
    setSelectedBottomImage(img);
    setBottomDeleteOpen(true);
  };
  const handleSaveBottomEdit = async () => {
    if (editBottomImageData) {
      setLoading(true);
      try {
        await herobannerService.updateBottom(editBottomImageData.id, { img: editBottomImageData.img });
        await fetchBottomImages();
        setBottomEditOpen(false);
        setEditBottomImageData(null);
      } catch (e) {} finally { setLoading(false); }
    }
  };
  const handleConfirmBottomDelete = async () => {
    if (selectedBottomImage) {
      setLoading(true);
      try {
        await herobannerService.removeBottom(selectedBottomImage.id);
        await fetchBottomImages();
        setBottomDeleteOpen(false);
        setSelectedBottomImage(null);
      } catch (e) {} finally { setLoading(false); }
    }
  };
  const handleBottomImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        await herobannerService.createBottom({ img: file });
      }
      await fetchBottomImages();
      setIsBottomUploadDialogOpen(false);
    } catch (e) {} finally { setLoading(false); }
  };

  // Middle Section logic
  const fetchMiddleImages = async () => {
    setLoading(true);
    try {
      const data = await herobannerService.findAllMiddle();
      setMiddleImages(data);
    } catch (e) {} finally { setLoading(false); }
  };
  const handleMiddleEditClick = (img: Herobanner) => {
    setSelectedMiddleImage(img);
    setEditMiddleImageData({ id: img.id, img: img.img });
    setMiddleEditOpen(true);
  };
  const handleMiddleDeleteClick = (img: Herobanner) => {
    setSelectedMiddleImage(img);
    setMiddleDeleteOpen(true);
  };
  const handleSaveMiddleEdit = async () => {
    if (editMiddleImageData) {
      setLoading(true);
      try {
        await herobannerService.updateMiddle(editMiddleImageData.id, { img: editMiddleImageData.img });
        await fetchMiddleImages();
        setMiddleEditOpen(false);
        setEditMiddleImageData(null);
      } catch (e) {} finally { setLoading(false); }
    }
  };
  const handleConfirmMiddleDelete = async () => {
    if (selectedMiddleImage) {
      setLoading(true);
      try {
        await herobannerService.removeMiddle(selectedMiddleImage.id);
        await fetchMiddleImages();
        setMiddleDeleteOpen(false);
        setSelectedMiddleImage(null);
      } catch (e) {} finally { setLoading(false); }
    }
  };
  const handleMiddleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        await herobannerService.createMiddle({ img: file });
      }
      await fetchMiddleImages();
      setIsMiddleUploadDialogOpen(false);
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section Images */}
      <SectionImages
        title="Hero Section Images"
        description="Manage homepage hero section images (slider)."
        images={heroImages}
        isUploadDialogOpen={isUploadDialogOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        handleImagesUpload={handleHeroImagesUpload}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        editImageData={editImageData}
        setEditImageData={setEditImageData}
        handleSaveEdit={handleSaveEdit}
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        handleConfirmDelete={handleConfirmDelete}
        loading={loading}
        label="Hero Image"
      />

      {/* Bottom Section Images */}
      <SectionImages
        title="Bottom Section Images"
        description="Manage homepage bottom section images."
        images={bottomImages}
        isUploadDialogOpen={isBottomUploadDialogOpen}
        setIsUploadDialogOpen={setIsBottomUploadDialogOpen}
        handleImagesUpload={handleBottomImagesUpload}
        handleEditClick={handleBottomEditClick}
        handleDeleteClick={handleBottomDeleteClick}
        editOpen={bottomEditOpen}
        setEditOpen={setBottomEditOpen}
        editImageData={editBottomImageData}
        setEditImageData={setEditBottomImageData}
        handleSaveEdit={handleSaveBottomEdit}
        deleteOpen={bottomDeleteOpen}
        setDeleteOpen={setBottomDeleteOpen}
        handleConfirmDelete={handleConfirmBottomDelete}
        loading={loading}
        label="Bottom Image"
      />

      {/* Middle Section Images */}
      <SectionImages
        title="Middle Section Images"
        description="Manage homepage middle section images."
        images={middleImages}
        isUploadDialogOpen={isMiddleUploadDialogOpen}
        setIsUploadDialogOpen={setIsMiddleUploadDialogOpen}
        handleImagesUpload={handleMiddleImagesUpload}
        handleEditClick={handleMiddleEditClick}
        handleDeleteClick={handleMiddleDeleteClick}
        editOpen={middleEditOpen}
        setEditOpen={setMiddleEditOpen}
        editImageData={editMiddleImageData}
        setEditImageData={setEditMiddleImageData}
        handleSaveEdit={handleSaveMiddleEdit}
        deleteOpen={middleDeleteOpen}
        setDeleteOpen={setMiddleDeleteOpen}
        handleConfirmDelete={handleConfirmMiddleDelete}
        loading={loading}
        label="Middle Image"
      />
    </div>
  );
}

// SectionImages component for reuse
function SectionImages({
  title,
  description,
  images,
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  handleImagesUpload,
  handleEditClick,
  handleDeleteClick,
  editOpen,
  setEditOpen,
  editImageData,
  setEditImageData,
  handleSaveEdit,
  deleteOpen,
  setDeleteOpen,
  handleConfirmDelete,
  loading,
  label,
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload {label}s</DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4 py-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem("imagesInput") as HTMLInputElement;
                if (input && input.files) {
                  await handleImagesUpload({ target: input } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
            >
              <div className="grid gap-2">
                <Label>Images</Label>
                <Input
                  id="imagesInput"
                  name="imagesInput"
                  type="file"
                  accept="image/*"
                  multiple
                />
                <p className="text-xs text-muted-foreground">Upload one or more images (1920×600 recommended)</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {images.map((img: any) => (
              <div key={img.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="cursor-grab text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="h-20 w-40 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={img.img || "/placeholder.svg"}
                    alt={label}
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
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(img)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {label}</DialogTitle>
            <DialogDescription>Update {label.toLowerCase()}</DialogDescription>
          </DialogHeader>
          {editImageData && (
            <form className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{label}</Label>
                <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                  <Image
                    src={typeof editImageData.img === "string" ? editImageData.img : "/placeholder.svg"}
                    alt={label}
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
                    setEditImageData((prev: any) => (prev ? { ...prev, img: file } : prev));
                  }}
                />
                <p className="text-xs text-muted-foreground">Click to change image (1920×600 recommended)</p>
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
      {/* Delete Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {label.toLowerCase()}? This action cannot be undone.
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
