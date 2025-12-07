/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {EditProductModal} from '../../components/admin/edit-product-modal';
import {ViewProductModal} from '../../components/admin/view-product-modal';

import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
} from 'lucide-react';
import {withProtectedRoute} from '../../lib/auth/protected-route';
import {Card, CardContent} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Badge} from '../../components/ui/badge';
import {Checkbox} from '../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import {formatPrice} from '../../lib/utils/format';

import productsService from '../../lib/api/services/products';
import categoriesService from '../../lib/api/services/categories';

// UI Product type for display
type UIProduct = {
  id: string;
  name: string;
  image: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description?: string;
  type: 'basic' | 'network' | 'region';
};

function AdminProductsPage() {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [activeTab, setActiveTab] = useState<
    'all' | 'basic' | 'network' | 'region'
  >('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<{id: string; name: string}[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const cacheRef = React.useRef<Map<string, any>>(new Map());

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoriesService.getAll();
        setCategories(
          cats
            .filter((c: any) => c.id !== 'all')
            .map((c: any) => ({id: c.id, name: c.name})),
        );
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products, optionally filtered by category
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams: any = {};
        if (activeTab !== 'all') {
          queryParams.productType = activeTab;
        }
        if (selectedCategory && selectedCategory !== 'all') {
          queryParams.categoryId = selectedCategory;
        }
        const res = await productsService.getAll(queryParams);
        const apiProducts = Array.isArray(res) ? res : [];
        // Find missing category IDs
        const missingCategoryIds = [
          ...new Set(
            apiProducts
              .map((p: any) => p.categoryId)
              .filter(
                (id: string) => id && !categories.some((c: any) => c.id === id),
              ),
          ),
        ];
        // Fetch missing categories
        if (missingCategoryIds.length > 0) {
          const fetched = await Promise.all(
            missingCategoryIds.map(id => categoriesService.getById(id)),
          );
          setCategories(prev => {
            const allCats = [
              ...prev,
              ...fetched
                .filter(Boolean)
                .filter((c: any) => c.id !== 'all')
                .map((c: any) => ({id: c.id, name: c.name})),
            ];
            // Deduplicate by id
            const deduped = Array.from(
              new Map(allCats.map(cat => [cat.id, cat])).values(),
            );
            return deduped;
          });
        }
        const mapped: UIProduct[] = apiProducts.map((p: any) => {
          const categoryObj = categories.find(c => c.id === p.categoryId);

          // Map backend fields to UI fields
          // Stock: Use totalStock (calculated from all variants) or stockQuantity (simple product)
          const stockNum = p.totalStock ?? p.stockQuantity ?? 0;

          // Price: Use price (simple) or min price from range
          const priceNum = p.price ?? p.priceRange?.min ?? 0;

          // Image: Find thumbnail or use first image
          const imageUrl =
            p.images?.find((img: any) => img.isThumbnail)?.url ||
            p.images?.[0]?.url ||
            '/placeholder.svg';

          // Status: Derive from isActive and stock
          let status = 'Inactive';
          if (p.isActive) {
            if (stockNum <= (p.lowStockAlert || 5) && stockNum > 0)
              status = 'Low Stock';
            else if (stockNum > 0) status = 'Active';
            else status = 'Out of Stock';
          }

          // Determine type
          let type: 'basic' | 'network' | 'region' = 'basic';

          if (p.productType) {
            const pt = String(p.productType).toLowerCase();
            if (pt === 'network') type = 'network';
            else if (pt === 'region') type = 'region';
          } else if (
            p.type &&
            ['basic', 'network', 'region'].includes(p.type)
          ) {
            type = p.type as 'basic' | 'network' | 'region';
          } else {
            if (Array.isArray(p.networks) && p.networks.length > 0)
              type = 'network';
            else if (Array.isArray(p.regions) && p.regions.length > 0)
              type = 'region';
          }

          return {
            id: p.id,
            name: p.name,
            image: imageUrl,
            sku: p.sku || '',
            category: categoryObj ? categoryObj.name : 'Uncategorized',
            price: priceNum,
            stock: stockNum,
            status: status,
            description: p.description || '',
            type,
          };
        });
        setProducts(mapped);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, categories, activeTab]);

  const handleViewClick = (product: UIProduct) => {
    setSelectedProduct(product);
    setViewOpen(true);
  };

  const handleEditClick = (product: UIProduct) => {
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleDeleteClick = (product: UIProduct) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        await productsService.delete(selectedProduct.id);
        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setDeleteOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Failed to delete product', error);
        // You might want to add a toast notification here
      }
    }
  };

  const filteredProducts = products;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}>
          All Products
        </Button>
        <Button
          variant={activeTab === 'basic' ? 'default' : 'outline'}
          onClick={() => setActiveTab('basic')}>
          Basic Products
        </Button>
        <Button
          variant={activeTab === 'network' ? 'default' : 'outline'}
          onClick={() => setActiveTab('network')}>
          Network Products
        </Button>
        <Button
          variant={activeTab === 'region' ? 'default' : 'outline'}
          onClick={() => setActiveTab('region')}>
          Region Products
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(
                    new Map(
                      categories
                        .filter(cat => cat.id !== 'all')
                        .map(cat => [cat.id, cat]),
                    ).values(),
                  ).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">
                    <Checkbox />
                  </th>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">SKU</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Stock</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground">
                      No products found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-border">
                      <td className="py-4 pr-4">
                        <Checkbox />
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={product.image || '/placeholder.svg'}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {product.sku}
                      </td>
                      <td className="py-4 pr-4 text-sm">{product.category}</td>
                      <td className="py-4 pr-4 font-medium">
                        {formatPrice(product.price ?? 0)}
                      </td>
                      <td className="py-4 pr-4">{product.stock}</td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant="secondary"
                          className={
                            product.status === 'Active'
                              ? 'bg-green-500/10 text-green-600'
                              : product.status === 'Low Stock'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : product.status === 'Out of Stock'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-gray-500/10 text-gray-600'
                          }>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewClick(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {activeTab !== 'all' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(product)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 1-5 of 456 products
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      <ViewProductModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        product={selectedProduct}
      />

      {/* Edit Modal */}
      <EditProductModal
        open={editOpen}
        onOpenChange={setEditOpen}
        product={selectedProduct}
        onSuccess={updatedProduct => {
          setProducts(
            products.map(p =>
              p.id === updatedProduct.id ? {...p, ...updatedProduct} : p,
            ),
          );
        }}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{selectedProduct?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
// End of AdminProductsPage function

export default withProtectedRoute(AdminProductsPage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
  showLoader: true,
});
