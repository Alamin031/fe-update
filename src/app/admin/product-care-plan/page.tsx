'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, MoreVertical, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Textarea } from '../../components/ui/textarea'
import { toast } from 'sonner'
import { formatPrice } from '../../lib/utils/format'
import { careService, type ProductCarePlan } from '../../lib/api/services/care'

export default function ProductCarePlanPage() {
  const [carePlans, setCarePlans] = useState<ProductCarePlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<ProductCarePlan[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ProductCarePlan | null>(null)

  const [formData, setFormData] = useState({
    productId: '',
    planName: '',
    price: '',
    duration: '',
    description: '',
    features: '',
  })

  useEffect(() => {
    // Initialize with mock data since we need productId
    setCarePlans([
      {
        id: '1',
        productId: 'PRD-001',
        planName: 'Basic Protection',
        price: 2999,
        duration: '1 Year',
        description: 'Basic protection plan with accidental damage coverage',
        features: ['Accidental Damage', 'Liquid Damage'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        productId: 'PRD-001',
        planName: 'Premium Protection',
        price: 5999,
        duration: '2 Years',
        description: 'Premium protection with extended coverage',
        features: ['Accidental Damage', 'Liquid Damage', 'Free Replacement'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    filterPlans()
  }, [carePlans, searchQuery])

  const filterPlans = () => {
    let filtered = carePlans

    if (searchQuery) {
      filtered = filtered.filter(
        plan =>
          plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPlans(filtered)
  }

  const handleAddPlan = () => {
    setFormData({
      productId: '',
      planName: '',
      price: '',
      duration: '',
      description: '',
      features: '',
    })
    setSelectedPlan(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleEditPlan = (plan: ProductCarePlan) => {
    setSelectedPlan(plan)
    setFormData({
      productId: plan.productId,
      planName: plan.planName,
      price: plan.price.toString(),
      duration: plan.duration || '',
      description: plan.description || '',
      features: plan.features?.join(', ') || '',
    })
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleViewPlan = (plan: ProductCarePlan) => {
    setSelectedPlan(plan)
    setFormData({
      productId: plan.productId,
      planName: plan.planName,
      price: plan.price.toString(),
      duration: plan.duration || '',
      description: plan.description || '',
      features: plan.features?.join(', ') || '',
    })
    setIsViewMode(true)
    setIsModalOpen(true)
  }

  const handleSavePlan = async () => {
    if (!formData.productId || !formData.planName || !formData.price) {
      toast.error('Product ID, Plan Name, and Price are required')
      return
    }

    setLoading(true)
    try {
      const payload = {
        productId: formData.productId,
        planName: formData.planName,
        price: parseFloat(formData.price),
        duration: formData.duration,
        description: formData.description,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      }

      if (selectedPlan) {
        await careService.update(selectedPlan.id, payload)
        toast.success('Care plan updated successfully')
      } else {
        await careService.create(formData.productId, payload)
        toast.success('Care plan created successfully')
      }

      // Update local state
      if (selectedPlan) {
        setCarePlans(carePlans.map(p => (p.id === selectedPlan.id ? { ...p, ...payload } : p)))
      } else {
        setCarePlans([...carePlans, { id: Date.now().toString(), ...payload, createdAt: new Date(), updatedAt: new Date() }])
      }

      setIsModalOpen(false)
    } catch (error) {
      toast.error('Failed to save care plan')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    setLoading(true)
    try {
      await careService.delete(selectedPlan.id)
      toast.success('Care plan deleted successfully')
      setCarePlans(carePlans.filter(p => p.id !== selectedPlan.id))
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error('Failed to delete care plan')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Care Plans</h1>
          <p className="text-muted-foreground">Manage protection and care plans for your products</p>
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
                <div key={plan.id} className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{plan.planName}</h3>
                      <p className="text-sm text-muted-foreground">Product: {plan.productId}</p>
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
                            setSelectedPlan(plan)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-semibold">{formatPrice(plan.price)}</span>
                    </div>
                    {plan.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <Badge variant="secondary">{plan.duration}</Badge>
                      </div>
                    )}
                  </div>

                  {plan.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
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
              {isViewMode ? 'View Care Plan' : selectedPlan ? 'Edit Care Plan' : 'Add New Care Plan'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode ? 'Care plan details' : 'Manage product care and protection plans'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID *</Label>
                <Input
                  id="productId"
                  placeholder="e.g., PRD-001"
                  value={formData.productId}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  disabled={isViewMode || !!selectedPlan}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Basic Protection"
                  value={formData.planName}
                  onChange={e => setFormData({ ...formData, planName: e.target.value })}
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 2999"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 1 Year"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
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
                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                onChange={e => setFormData({ ...formData, features: e.target.value })}
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {selectedPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Care Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this care plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
