/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OutputData } from '@editorjs/editorjs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EditorJSWrapper } from './editor-js-wrapper';
import blogsService, { BlogPost } from '../../lib/api/services/blogs';

interface BlogFormProps {
  initialData?: BlogPost;
  isEditing?: boolean;
}



export function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editorData, setEditorData] = useState<OutputData>(() => {
    if (initialData?.content) {
      try {
        return JSON.parse(typeof initialData.content === 'string' ? initialData.content : JSON.stringify(initialData.content));
      } catch {
        // Fallback if content is not valid JSON
        return {
          blocks: [
            {
              id: 'initial',
              type: 'paragraph',
              data: {
                text: initialData.content || '',
              },
            },
          ],
          version: '2.28.2',
          time: Date.now(),
        };
      }
    }
    return {
      blocks: [],
      version: '2.28.2',
      time: Date.now(),
    };
  });

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().slice(0, 16) : '',
    readTime: initialData?.readTime !== undefined && initialData?.readTime !== null ? String(initialData.readTime) : '',
    status: (initialData?.status as 'draft' | 'published') || 'draft',
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : '',
  });

  // For image uploads (single image for backend compatibility)
  const [images, setImages] = useState<(File | string)[]>(
    initialData?.image ? [initialData.image] : []
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !initialData) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Handle image file input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Only allow one image (replace previous)
    setImages([files[0]]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove image from list
  const handleRemoveImage = (idx: number) => {
    setImages([]);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.title ||
      !formData.slug ||
      !formData.excerpt
    ) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!editorData.blocks || editorData.blocks.length === 0) {
      setError('Please add content to your blog post');
      return false;
    }
    // Require one image
    if (images.length === 0) {
      setError('Please upload an image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare FormData for file upload
      const form = new FormData();
      form.append('title', formData.title);
      form.append('slug', formData.slug);
      form.append('excerpt', formData.excerpt);
      form.append('content', JSON.stringify(editorData));
      form.append('status', formData.status);
      if (formData.readTime) form.append('readTime', formData.readTime);
      if (formData.publishedAt) form.append('publishedAt', new Date(formData.publishedAt).toISOString());
      if (formData.tags) {
        // Send tags as comma-separated string or as array, depending on backend
        form.append('tags', formData.tags);
      }
      // Only send the first image (as File or string URL)
      if (images[0] instanceof File) {
        form.append('image', images[0]);
      } else if (typeof images[0] === 'string') {
        form.append('image', images[0]);
      }

      if (isEditing && initialData?.id) {
        await blogsService.update(initialData.id, form);
      } else {
        await blogsService.create(form);
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing
            ? 'Update the blog post details and content'
            : 'Create a new blog post with rich content'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Slug */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter blog post title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                placeholder="url-friendly-slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="mt-1"
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier. Auto-generated from title.
              </p>
            </div>

            <div>
              <Label htmlFor="readTime">Read Time</Label>
              <Input
                id="readTime"
                name="readTime"
                placeholder="e.g., 5 min read"
                value={formData.readTime}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category and Status */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val as 'draft' | 'published')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Separate tags with commas (e.g., tech, guide, review)"
                value={formData.tags}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload and Excerpt */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Upload Images <span className="text-red-500">*</span></Label>
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
                ref={fileInputRef}
              />
              {images[0] ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Image Preview</p>
                  <div className="relative inline-block group">
                    <img
                      src={typeof images[0] === 'string' ? images[0] : URL.createObjectURL(images[0])}
                      alt="Uploaded image preview"
                      className="max-w-xs max-h-64 object-contain rounded-lg border border-border bg-background p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(0)}
                      className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-semibold transition-all opacity-90 group-hover:opacity-100 shadow-md"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No image selected yet</p>
              )}
            </div>
            <div>
              <Label htmlFor="excerpt">
                Excerpt <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="excerpt"
                name="excerpt"
                placeholder="Brief summary of the blog post (shown in listings)"
                value={formData.excerpt}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>
              Full Content <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <EditorJSWrapper
                value={editorData}
                onChange={setEditorData}
                placeholder="Write your blog post content here. Add headings, text, lists, images, code blocks, and more..."
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use the toolbar to add different content blocks: headings, paragraphs, lists, images, code, quotes, and more.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Blog' : 'Create Blog'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
