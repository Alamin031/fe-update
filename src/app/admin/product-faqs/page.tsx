/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {useState, useEffect} from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Label} from '../../components/ui/label';
import {Badge} from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {Textarea} from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import {faqsService} from '../../lib/api';
import {productsService} from '../../lib/api/services/products';
import {categoriesService} from '../../lib/api/services/categories';
import type {Product, Category} from '../../lib/api/types';
import {toast} from 'sonner';
import type { FAQ as FAQBase } from '../../lib/api/types';
import { withProtectedRoute } from '../../lib/auth/protected-route';
// Extend FAQ type locally to include isPublished
type FAQ = FAQBase;

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

function ProductFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    categoryIds: [] as string[],
    productIds: [] as string[],
    orderIndex: '',
  });

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchFAQs();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const catsRes = await categoriesService.getAll();
      let categoriesArr: Category[] = [];
      if (Array.isArray(catsRes)) {
        categoriesArr = catsRes as Category[];
      } else if (
        catsRes &&
        Array.isArray((catsRes as {data: Category[]}).data)
      ) {
        categoriesArr = (catsRes as {data: Category[]}).data;
      }
      setAllCategories(categoriesArr);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const prodsRes = await productsService.getAll();
      let productsArr: Product[] = [];
      if (Array.isArray(prodsRes)) {
        productsArr = prodsRes as Product[];
      } else if (Array.isArray(prodsRes?.data)) {
        productsArr = prodsRes.data as Product[];
      }
      setAllProducts(productsArr);
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  };

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchQuery, publishFilter]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await faqsService.getAll();
      console.log('Fetched FAQs:', response);
      setFaqs(Array.isArray(response) ? response : (response?.data ?? []));
    } catch (error) {
      toast.error('Failed to fetch FAQs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    if (searchQuery) {
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Removed isPublished filtering logic

    setFilteredFaqs(filtered);
  };

  const handleAddFAQ = () => {
    setFormData({
      question: '',
      answer: '',
      categoryIds: [],
      productIds: [],
      orderIndex: '',
    });
    setSelectedFAQ(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      categoryIds: faq.categoryIds || [],
      productIds: faq.productIds || [],
      orderIndex: faq.orderIndex?.toString() || '',
    });
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      categoryIds: faq.categoryIds || [],
      productIds: faq.productIds || [],
      orderIndex: faq.orderIndex?.toString() || '',
    });
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleSaveFAQ = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and Answer are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        question: formData.question,
        answer: formData.answer,
        categoryIds: formData.categoryIds,
        productIds: formData.productIds,
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : undefined,
      };

      if (selectedFAQ) {
        await faqsService.update(selectedFAQ.id, payload);
        toast.success('FAQ updated successfully');
      } else {
        await faqsService.create(payload);
        toast.success('FAQ created successfully');
      }
      await fetchFAQs();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save FAQ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async () => {
    if (!selectedFAQ) return;

    setLoading(true);
    try {
      await faqsService.delete(selectedFAQ.id);
      toast.success('FAQ deleted successfully');
      await fetchFAQs();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete FAQ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Removed handleTogglePublish

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions for your products
          </p>
        </div>
        <Button onClick={handleAddFAQ} className="gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>FAQs List</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={publishFilter}
                onValueChange={v =>
                  setPublishFilter(v as 'all' | 'published' | 'draft')
                }>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && !faqs.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No FAQs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map(faq => (
                <div
                  key={faq.id}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-2">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {faq.categoryIds && faq.categoryIds.length > 0 &&
                            faq.categoryIds.map(catId => {
                              const cat = allCategories.find(c => c.id === catId);
                              return cat ? (
                                <Badge key={catId} variant="secondary" className="text-xs">
                                  {cat.name}
                                </Badge>
                              ) : null;
                            })}
                          {faq.productIds && faq.productIds.length > 0 &&
                            faq.productIds.map(prodId => {
                              const prod = allProducts.find(p => p.id === prodId);
                              return prod ? (
                                <Badge key={prodId} variant="outline" className="text-xs">
                                  {prod.name}
                                </Badge>
                              ) : null;
                            })}
                          {faq.orderIndex !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              Order: {faq.orderIndex}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewFAQ(faq)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditFAQ(faq)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {/* Removed publish/unpublish menu item */}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedFAQ(faq);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                ? 'View FAQ'
                : selectedFAQ
                ? 'Edit FAQ'
                : 'Add New FAQ'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'FAQ details'
                : selectedFAQ
                ? 'Update the FAQ information'
                : 'Create a new FAQ for your products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                placeholder="Enter the question"
                value={formData.question}
                onChange={e =>
                  setFormData({...formData, question: e.target.value})
                }
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer"
                value={formData.answer}
                onChange={e =>
                  setFormData({...formData, answer: e.target.value})
                }
                disabled={isViewMode}
                className="min-h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryIds">Categories</Label>
                <MultiSelect
                  options={allCategories.map(cat => ({ id: cat.id, name: cat.name }))}
                  selectedValues={formData.categoryIds}
                  onValuesChange={(values) => setFormData({...formData, categoryIds: values})}
                  placeholder="Select categories..."
                  searchPlaceholder="Search categories..."
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productIds">Products</Label>
                <MultiSelect
                  options={allProducts.map(prod => ({ id: prod.id, name: prod.name }))}
                  selectedValues={formData.productIds}
                  onValuesChange={(values) => setFormData({...formData, productIds: values})}
                  placeholder="Select products..."
                  searchPlaceholder="Search products..."
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderIndex">Order Index</Label>
              <Input
                id="orderIndex"
                type="number"
                placeholder="e.g., 1, 2, 3..."
                value={formData.orderIndex}
                onChange={e => setFormData({ ...formData, orderIndex: e.target.value })}
                disabled={isViewMode}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSaveFAQ} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedFAQ ? 'Update FAQ' : 'Create FAQ'}
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
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFAQ}
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
