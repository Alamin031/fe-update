/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {ViewProductModalBasic} from '../../components/admin/view-product-modal-basic';
import {ViewProductModalNetwork} from '../../components/admin/view-product-modal-network';
import {ViewProductModalRegion} from '../../components/admin/view-product-modal-region';

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
} from 'lucide-react';
import {withProtectedRoute} from '../../lib/auth/protected-route';
import {Card, CardContent} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
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

import productsService from '../../lib/api/services/products';
import categoriesService from '../../lib/api/services/categories';
import {EditProductModal} from '@/app/components/admin/edit-product-modal';

type UIProduct = {
  id: string;
  name: string;
  image: string;
  sku: string;
  productCode?: string;
  slug?: string;
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
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const cacheRef = useRef<Map<string, any>>(new Map());

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

  // Fetch products with pagination and caching
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cacheKey = `${activeTab}-${selectedCategory}-${currentPage}`;

        // Check cache first
        if (cacheRef.current.has(cacheKey)) {
          const cached = cacheRef.current.get(cacheKey);
          setProducts(cached.products);
          setTotalCount(cached.totalCount);
          setLoading(false);
          return;
        }

        const queryParams: any = {};
        if (activeTab !== 'all') {
          queryParams.productType = activeTab;
        }
        if (selectedCategory && selectedCategory !== 'all') {
          // Use categoryIds as an array for the API
          queryParams.categoryIds = [selectedCategory];
        }

        const res = await productsService.getAllLite(
          queryParams,
          currentPage,
          pageSize,
        );

        const apiProducts = Array.isArray(res) ? res : res?.data || [];
        const total =
          typeof res === 'object' &&
          'data' in res &&
          Array.isArray(res.data) &&
          typeof res.data.length === 'number'
            ? res.data.length
            : Array.isArray(res)
            ? res.length
            : apiProducts.length;


        // Find missing category IDs (from categoryIds array)
        const allCategoryIds = apiProducts
          .flatMap((p: any) => Array.isArray(p.categoryIds) ? p.categoryIds : [])
          .filter((id: string) => !!id);
        const missingCategoryIds = [
          ...new Set(
            allCategoryIds.filter(
              (id: string) => id && !categories.some((c: any) => c.id === id),
            ),
          ),
        ];

        // Fetch missing categories in parallel
        if (missingCategoryIds.length > 0) {
          const fetched = await Promise.all(
            missingCategoryIds.map(id =>
              categoriesService.getById(id).catch(() => null),
            ),
          );
          setCategories(prev => {
            const allCats = [
              ...prev,
              ...fetched
                .filter(Boolean)
                .filter((c: any) => c.id !== 'all')
                .map((c: any) => ({id: c.id, name: c.name})),
            ];
            const deduped = Array.from(
              new Map(allCats.map(cat => [cat.id, cat])).values(),
            );
            return deduped;
          });
        }


        const mapped: UIProduct[] = apiProducts.map((p: any) => {
          // Handle images - they should come from API response
          let imageUrl = '/placeholder.svg';
          if (Array.isArray(p.images) && p.images.length > 0) {
            const thumbnail = p.images.find((img: any) => img.isThumbnail);
            imageUrl =
              thumbnail?.imageUrl ||
              thumbnail?.url ||
              p.images[0]?.imageUrl ||
              p.images[0]?.url ||
              '/placeholder.svg';
          } else if (p.image) {
            // fallback for single image field
            imageUrl = p.image;
          }

          let type: 'basic' | 'network' | 'region' = 'basic';
          if (p.productType) {
            const pt = String(p.productType).toLowerCase();
            if (pt === 'network') type = 'network';
            else if (pt === 'region') type = 'region';
          }

          return {
            id: p.id,
            name: p.name,
            image: imageUrl,
            sku: p.sku || '',
            productCode: p.productCode || '',
            slug: p.slug || '',
            description: p.description || '',
            type,
            // Add categoryIds for filtering
            categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds : [],
          };
        });

        // Cache the results
        cacheRef.current.set(cacheKey, {
          products: mapped,
          totalCount: total,
        });

        setProducts(mapped);
        setTotalCount(total);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage, activeTab, pageSize, categories]);

  const handleViewClick = async (product: UIProduct) => {
    try {
      setViewLoading(true);
      const fullProduct = await productsService.getById(product.id);
      setSelectedProduct(fullProduct);
      setViewOpen(true);
    } catch {
      setSelectedProduct(product);
      setViewOpen(true);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditClick = async (product: UIProduct) => {
    try {
      setViewLoading(true);
      const fullProduct = await productsService.getById(product.id);
      setSelectedProduct(fullProduct);
      setEditOpen(true);
    } catch {
      setSelectedProduct({
        ...product,
        productType: product.type, // Ensure productType is set
      });
      setEditOpen(true);
    } finally {
      setViewLoading(false);
    }
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
      } catch {
        // You might want to add a toast notification here
      }
    }
  };

  // Filter products by selectedCategory using categoryIds array
  let filteredProducts =
    selectedCategory && selectedCategory !== 'all'
      ? products.filter(p =>
          Array.isArray((p as any).categoryIds) &&
          (p as any).categoryIds.includes(selectedCategory),
        )
      : products;

  // Further filter by search term (name or SKU)
  if (searchTerm.trim() !== '') {
    const lower = searchTerm.trim().toLowerCase();
    filteredProducts = filteredProducts.filter(
      p =>
        p.name.toLowerCase().includes(lower) ||
        (p.sku && p.sku.toLowerCase().includes(lower))
    );
  }

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
          onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
          }}>
          All Products
        </Button>
        <Button
          variant={activeTab === 'basic' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('basic');
            setCurrentPage(1);
          }}>
          Basic Products
        </Button>
        <Button
          variant={activeTab === 'network' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('network');
            setCurrentPage(1);
          }}>
          Network Products
        </Button>
        <Button
          variant={activeTab === 'region' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('region');
            setCurrentPage(1);
          }}>
          Region Products
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={cat => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </Button>
              {/*
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
              */}
            </div>
            {/*
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
            */}
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
                  <th className="pb-3 pr-4">Product Code</th>
                  <th className="pb-3 pr-4">URL Slug</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {product.productCode || '-'}
                      </td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {product.slug || '-'}
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
              Showing {Math.max(1, (currentPage - 1) * pageSize + 1)}-
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{' '}
              products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage * pageSize >= totalCount || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedProduct?.productType === 'network' ||
      selectedProduct?.type === 'network' ? (
        <ViewProductModalNetwork
          open={viewOpen}
          onOpenChange={setViewOpen}
          product={selectedProduct}
          loading={viewLoading}
        />
      ) : selectedProduct?.productType === 'region' ||
        selectedProduct?.type === 'region' ? (
        <ViewProductModalRegion
          open={viewOpen}
          onOpenChange={setViewOpen}
          product={selectedProduct}
          loading={viewLoading}
        />
      ) : (
        <ViewProductModalBasic
          open={viewOpen}
          onOpenChange={setViewOpen}
          product={selectedProduct}
          loading={viewLoading}
        />
      )}

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

export default withProtectedRoute(AdminProductsPage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
  showLoader: true,
});
