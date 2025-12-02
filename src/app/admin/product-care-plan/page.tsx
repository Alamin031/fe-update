/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, MoreVertical, Loader2, X,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { formatPrice } from '../../lib/utils/format';
import { careService, type ProductCarePlan } from '../../lib/api/services/care';
import { productsService } from '../../lib/api/services/products';
import { categoriesService } from '../../lib/api/services/categories';
import type { Product, Category } from '../../lib/api/types';
import { withProtectedRoute } from '../../lib/auth/protected-route';

// Custom MultiSelect Component
interface MultiSelectProps {
  options: { id: string; name: string }[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

function MultiSelect({
  options,
  selectedValues,
  onValuesChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItems = options.filter(option => 
    selectedValues.includes(option.id)
  );

  const toggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onValuesChange(selectedValues.filter(id => id !== optionId));
    } else {
      onValuesChange([...selectedValues, optionId]);
    }
  };

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange(selectedValues.filter(id => id !== optionId));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange([]);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        className={`flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary'
        } ${isOpen ? 'border-primary ring-2 ring-ring ring-offset-2' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-1 flex-wrap gap-1 overflow-hidden">
          {selectedItems.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedItems.map(item => (
              <Badge
                key={item.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {item.name}
                {!disabled && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:opacity-70"
                    onClick={e => removeOption(item.id, e)}
                  />
                )}
              </Badge>
            ))
          )}
        </div>
        {!disabled && selectedItems.length > 0 && (
          <X
            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={clearAll}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {/* Search */}
          <div className="p-2">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No items found
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                    selectedValues.includes(option.id) ? 'bg-accent' : ''
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <span className="flex-1 truncate">{option.name}</span>
                  {selectedValues.includes(option.id) && (
                    <div className="absolute right-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                      ✓
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductCarePlanPage() {
  const [carePlans, setCarePlans] = useState<ProductCarePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ProductCarePlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductCarePlan | null>(null);

  const [formData, setFormData] = useState({
    productIds: [] as string[],
    categoryIds: [] as string[],
    planName: '',
    price: '',
    duration: '',
    description: '',
    features: '',
  });

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch products and categories for dropdowns
    const fetchDropdowns = async () => {
      try {
        const prodsRes = await productsService.getAll();
        let productsArr: Product[] = [];
        if (Array.isArray(prodsRes)) {
          productsArr = prodsRes as Product[];
        } else if (Array.isArray(prodsRes?.data)) {
          productsArr = prodsRes.data as Product[];
        }
        setAllProducts(productsArr);

        const catsRes: Category[] | { data: Category[] } = await categoriesService.getAll();
        let categoriesArr: Category[] = [];
        if (Array.isArray(catsRes)) {
          categoriesArr = catsRes as Category[];
        } else if (catsRes && Array.isArray((catsRes as { data: Category[] }).data)) {
          categoriesArr = (catsRes as { data: Category[] }).data;
        }
        setAllCategories(categoriesArr);
      } catch (err) {
        console.error('Dropdown fetch error', err);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    // Fetch all care plans from backend
    const fetchCarePlans = async () => {
      setLoading(true);
      try {
        const plans = await careService.getAll();
        
        setCarePlans(Array.isArray(plans) ? plans : []);
      } catch (err) {
        setCarePlans([]);
        console.error('Failed to fetch care plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCarePlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [carePlans, searchQuery]);

  const filterPlans = () => {
    let filtered = carePlans;
    if (searchQuery) {
      filtered = filtered.filter(
        plan =>
          plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (plan.productIds && plan.productIds.join(',').toLowerCase().includes(searchQuery.toLowerCase())) ||
          plan.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    setFilteredPlans(filtered);
  };

  const handleAddPlan = () => {
    setFormData({
      productIds: [],
      categoryIds: [],
      planName: '',
      price: '',
      duration: '',
      description: '',
      features: '',
    });
    setSelectedPlan(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: ProductCarePlan) => {
    setSelectedPlan(plan);
    setFormData({
      productIds: plan.productIds || [],
      categoryIds: plan.categoryIds || [],
      planName: plan.planName,
      price: plan.price.toString(),
      duration: plan.duration || '',
      description: plan.description || '',
      features: plan.features?.join(', ') || '',
    });
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewPlan = (plan: ProductCarePlan) => {
    setSelectedPlan(plan);
    setFormData({
      productIds: plan.productIds || [],
      categoryIds: plan.categoryIds || [],
      planName: plan.planName,
      price: plan.price.toString(),
      duration: plan.duration || '',
      description: plan.description || '',
      features: plan.features?.join(', ') || '',
    });
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleSavePlan = async () => {
    setLoading(true);
    try {
      const featuresArr = formData.features
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);
      const payload = {
        productIds: formData.productIds,
        categoryIds: formData.categoryIds.length ? formData.categoryIds : undefined,
        planName: formData.planName,
        price: parseFloat(formData.price),
        duration: formData.duration,
        description: formData.description,
        features: featuresArr,
      };
      if (selectedPlan) {
        await careService.update(selectedPlan.id, payload);
        toast.success('Care plan updated successfully');
        setCarePlans(
          carePlans.map(p =>
            p.id === selectedPlan.id ? { ...p, ...payload } : p,
          ),
        );
      } else {
        await careService.create(payload);
        toast.success('Care plan(s) created successfully');
      }
      setIsModalOpen(false);
    } catch (error: unknown) {
      let message = 'Failed to save care plan';
      const err = error as any;
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.response?.data?.error?.message) {
        message = err.response.data.error.message;
      } else if (typeof err?.message === 'string') {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await careService.delete(selectedPlan.id);
      toast.success('Care plan deleted successfully');
      setCarePlans(carePlans.filter(p => p.id !== selectedPlan.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete care plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Product Care Plans
          </h1>
          <p className="text-muted-foreground">
            Manage protection and care plans for your products
          </p>
        </div>
        <Button onClick={handleAddPlan} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Care Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Care Plans</CardTitle>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search care plans..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No care plans found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map(plan => (
                <div
                  key={plan.id}
                  className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{plan.planName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Products: {plan.productIds?.map(pid => allProducts.find(p => p.id === pid)?.name || pid).join(', ')}
                      </p>
                      {plan.categoryIds && plan.categoryIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Categories: {plan.categoryIds.map(cid => allCategories.find(c => c.id === cid)?.name || cid).join(', ')}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewPlan(plan)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Price:
                      </span>
                      <span className="font-semibold">
                        {formatPrice(plan.price)}
                      </span>
                    </div>
                    {plan.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Duration:
                        </span>
                        <Badge variant="secondary">{plan.duration}</Badge>
                      </div>
                    )}
                  </div>

                  {plan.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {plan.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{plan.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? 'View Care Plan'
                : selectedPlan
                ? 'Edit Care Plan'
                : 'Add New Care Plan'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'Care plan details'
                : 'Manage product care and protection plans'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                placeholder="e.g., Premium Protection Plan"
                value={formData.planName}
                onChange={e =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                disabled={isViewMode}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="products">Product(s) *</Label>
                <MultiSelect
                  options={allProducts.map(p => ({ id: p.id, name: p.name }))}
                  selectedValues={formData.productIds}
                  onValuesChange={(values) => setFormData({ ...formData, productIds: values })}
                  placeholder="Select products..."
                  searchPlaceholder="Search products..."
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories">Category(s)</Label>
                <MultiSelect
                  options={allCategories.map(c => ({ id: c.id, name: c.name }))}
                  selectedValues={formData.categoryIds}
                  onValuesChange={(values) => setFormData({ ...formData, categoryIds: values })}
                  placeholder="Select categories..."
                  searchPlaceholder="Search categories..."
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 2999"
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={isViewMode}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 1 Year"
                  value={formData.duration}
                  onChange={e =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Plan details and benefits"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={isViewMode}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Textarea
                id="features"
                placeholder="e.g., Accidental Damage, Liquid Damage, Free Replacement"
                value={formData.features}
                onChange={e =>
                  setFormData({ ...formData, features: e.target.value })
                }
                disabled={isViewMode}
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSavePlan} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Care Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this care plan? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
