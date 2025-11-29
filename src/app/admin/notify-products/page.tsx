/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, MoreVertical, Trash2, Loader2, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { toast } from 'sonner'
import { productNotifyService, type ProductNotifyRequest } from '../../lib/api/services/notify'

export default function NotifyProductsPage() {
  const [notifications, setNotifications] = useState<ProductNotifyRequest[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<ProductNotifyRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<ProductNotifyRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Initialize with mock data
    setNotifications([
      {
        id: '1',
        productId: 'PRD-001',
        productName: 'iPhone 15 Pro Max',
        email: 'user1@example.com',
        phone: '+880 1234567890',
        userId: 'USER-001',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        productId: 'PRD-002',
        productName: 'Samsung Galaxy S24 Ultra',
        email: 'user2@example.com',
        phone: '+880 9876543210',
        userId: 'USER-002',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        productId: 'PRD-003',
        productName: 'MacBook Air M3',
        email: 'user3@example.com',
        phone: '+880 5555555555',
        userId: 'USER-003',
        status: 'resolved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ])
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchQuery, activeTab])

  const filterNotifications = () => {
    let filtered = notifications

    if (activeTab === 'pending') {
      filtered = filtered.filter(notif => notif.status === 'pending')
    } else if (activeTab === 'resolved') {
      filtered = filtered.filter(notif => notif.status === 'resolved')
    }

    if (searchQuery) {
      filtered = filtered.filter(
        notif =>
          notif.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (notif.email && notif.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          notif.productId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(notif => notif.status === statusFilter)
    }

    setFilteredNotifications(filtered)
  }

  const handleViewNotification = (notification: ProductNotifyRequest) => {
    setSelectedNotification(notification)
    setIsModalOpen(true)
  }

  const handleResolve = async (notification: ProductNotifyRequest) => {
    setLoading(true)
    try {
      await productNotifyService.update(notification.id, { status: 'resolved' })
      toast.success('Notification marked as resolved')
      setNotifications(
        notifications.map(n =>
          n.id === notification.id ? { ...n, status: 'resolved' } : n
        )
      )
    } catch (error) {
      toast.error('Failed to update notification')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return

    setLoading(true)
    try {
      await productNotifyService.delete(selectedNotification.id)
      toast.success('Notification deleted successfully')
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id))
      setIsDeleteDialogOpen(false)
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Failed to delete notification')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = notifications.filter(n => n.status === 'pending').length
  const resolvedCount = notifications.filter(n => n.status === 'resolved').length

  const NotificationRow = ({ notification }: { notification: ProductNotifyRequest }) => (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-medium">{notification.productName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="h-3.5 w-3.5" />
              {notification.email}
            </div>
            {notification.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <Phone className="h-3.5 w-3.5" />
                {notification.phone}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Product ID: {notification.productId}
            </p>
            <p className="text-xs text-muted-foreground">
              Requested: {notification.createdAt.toLocaleDateString()}
            </p>
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
          <DropdownMenuItem onClick={() => handleViewNotification(notification)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {notification.status === 'pending' && (
            <DropdownMenuItem onClick={() => handleResolve(notification)}>
              Mark as Resolved
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              setSelectedNotification(notification)
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
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Notifications</h1>
          <p className="text-muted-foreground">Manage product restock notification requests from customers</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Notification Requests</CardTitle>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'pending' | 'resolved')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending{' '}
                <Badge variant="outline" className="ml-2">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved{' '}
                <Badge variant="outline" className="ml-2">
                  {resolvedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {loading && !filteredNotifications.length ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No pending notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map(notification => (
                    <NotificationRow key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4 mt-4">
              {loading && !filteredNotifications.length ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No resolved notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map(notification => (
                    <NotificationRow key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>Restock notification request information</DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                  <p className="text-sm font-semibold">{selectedNotification.productName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                  <p className="text-sm font-semibold">{selectedNotification.productId}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedNotification.email}`} className="text-sm font-semibold hover:underline">
                    {selectedNotification.email}
                  </a>
                </div>
              </div>

              {selectedNotification.phone && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedNotification.phone}`} className="text-sm font-semibold hover:underline">
                      {selectedNotification.phone}
                    </a>
                  </div>
                </div>
              )}

              {selectedNotification.userId && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-semibold">{selectedNotification.userId}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={selectedNotification.status === 'pending' ? 'default' : 'secondary'}>
                  {selectedNotification.status.charAt(0).toUpperCase() + selectedNotification.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
                <p className="text-sm font-semibold">
                  {selectedNotification.createdAt.toLocaleDateString()} at{' '}
                  {selectedNotification.createdAt.toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            {selectedNotification?.status === 'pending' && (
              <Button onClick={() => handleResolve(selectedNotification)}>
                Mark as Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotification}
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
