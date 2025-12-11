'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { withProtectedRoute } from '../../lib/auth/protected-route';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import blogsService, { BlogPost } from '../../lib/api/services/blogs';

const categories = [
  'All',
  'Smartphones',
  'Laptops',
  'Tablets',
  'Technology',
  'Comparison',
  'Gaming',
  'Tips',
  'Reviews',
];

function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const cacheRef = useRef<Map<string, any>>(new Map());

  // Fetch blogs
  const fetchBlogs = async (page: number = 1, search: string = '', category: string = '') => {
    setLoading(true);
    try {
      const cacheKey = `blogs-${page}-${search}-${category}-${selectedStatus}`;

      if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        setBlogs(cached.blogs);
        setTotalCount(cached.total);
        setCurrentPage(page);
        setLoading(false);
        return;
      }

      const filters: any = {};
      if (search) filters.search = search;
      if (category !== 'All') filters.category = category;
      if (selectedStatus !== 'all') filters.status = selectedStatus;

      const response = await blogsService.getAll(filters, page, pageSize);

      cacheRef.current.set(cacheKey, {
        blogs: response.data,
        total: response.total,
      });

      setBlogs(response.data);
      setTotalCount(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1, searchTerm, selectedCategory !== 'All' ? selectedCategory : '');
  }, [selectedStatus]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchBlogs(1, value, selectedCategory !== 'All' ? selectedCategory : '');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchBlogs(1, searchTerm, category !== 'All' ? category : '');
  };

  const handleDelete = async () => {
    if (!selectedBlog?._id && !selectedBlog?.id) return;

    setDeleting(true);
    try {
      const blogId = selectedBlog._id || selectedBlog.id;
      await blogsService.delete(blogId);
      cacheRef.current.clear();
      await fetchBlogs(1, searchTerm, selectedCategory !== 'All' ? selectedCategory : '');
      setDeleteOpen(false);
      setSelectedBlog(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">Manage your blog posts and content</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Blog Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Table */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading blogs...</p>
          </CardContent>
        </Card>
      ) : blogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No blogs found. Create your first blog post!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Title</th>
                    <th className="px-6 py-3 text-left font-semibold">Author</th>
                    <th className="px-6 py-3 text-left font-semibold">Category</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog._id || blog.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {blog.image && (
                            <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={blog.image}
                                alt={blog.title}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{blog.title}</p>
                            <p className="text-xs text-muted-foreground">{blog.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{blog.author}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            blog.status === 'published'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}
                        >
                          {blog.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${blog.slug}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blog/${blog._id || blog.id}`} className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBlog(blog);
                                setDeleteOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{' '}
              {totalCount} blogs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBlogs(currentPage - 1, searchTerm, selectedCategory !== 'All' ? selectedCategory : '')}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchBlogs(page, searchTerm, selectedCategory !== 'All' ? selectedCategory : '')}
                    disabled={loading}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBlogs(currentPage + 1, searchTerm, selectedCategory !== 'All' ? selectedCategory : '')}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedBlog?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withProtectedRoute(AdminBlogsPage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
  showLoader: true,
});
