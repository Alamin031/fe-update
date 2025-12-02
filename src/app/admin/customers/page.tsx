'use client'

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, MoreVertical, Mail, Eye, Ban, Edit, Trash2, Send } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../../components/ui/sheet"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog"
import { formatPrice } from "../../lib/utils/format"
import "./modal-styles.css"

interface Customer {
  id: string
  name: string
  email: string
  avatar: string
  orders: number
  totalSpent: number
  lastOrder: string
  status: string
  phone?: string
  address?: string
  joinDate?: string
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?key=rk8n5",
    orders: 12,
    totalSpent: 456789,
    lastOrder: "Nov 20, 2024",
    status: "Active",
    phone: "+880 1234567890",
    address: "123 Main Street, Dhaka, Bangladesh",
    joinDate: "Jan 15, 2023",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/placeholder.svg?key=m3fz2",
    orders: 8,
    totalSpent: 234567,
    lastOrder: "Nov 19, 2024",
    status: "Active",
    phone: "+880 9876543210",
    address: "456 Oak Avenue, Chittagong, Bangladesh",
    joinDate: "Feb 20, 2023",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    avatar: "/placeholder.svg?key=v9qs7",
    orders: 3,
    totalSpent: 79999,
    lastOrder: "Nov 15, 2024",
    status: "Active",
    phone: "+880 5555555555",
    address: "789 Pine Road, Sylhet, Bangladesh",
    joinDate: "Mar 10, 2023",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    avatar: "/placeholder.svg?key=x5kt9",
    orders: 1,
    totalSpent: 15999,
    lastOrder: "Nov 10, 2024",
    status: "Inactive",
    phone: "+880 3333333333",
    address: "321 Elm Street, Rajshahi, Bangladesh",
    joinDate: "Apr 05, 2023",
  },
  {
    id: "5",
    name: "Charlie Davis",
    email: "charlie@example.com",
    avatar: "/placeholder.svg?key=h2pw4",
    orders: 0,
    totalSpent: 0,
    lastOrder: "-",
    status: "Blocked",
    phone: "+880 7777777777",
    address: "654 Birch Lane, Khulna, Bangladesh",
    joinDate: "May 12, 2023",
  },
]

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Customer | null>(null)
  const [emailFormData, setEmailFormData] = useState({ subject: "", message: "" })

  const handleViewClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewOpen(true)
  }

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditFormData({ ...customer })
    setEditOpen(true)
  }

  const handleEmailClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEmailFormData({ subject: "", message: "" })
    setEmailOpen(true)
  }

  const handleBlockClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setBlockOpen(true)
  }

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDeleteOpen(true)
  }

  const handleSaveEdit = () => {
    if (editFormData) {
      setCustomers(customers.map((c) => (c.id === editFormData.id ? editFormData : c)))
      setEditOpen(false)
      setEditFormData(null)
    }
  }

  const handleSendEmail = () => {
    if (selectedCustomer && emailFormData.subject && emailFormData.message) {
      alert(`Email sent to ${selectedCustomer.email}\n\nSubject: ${emailFormData.subject}`)
      setEmailOpen(false)
    }
  }

  const handleBlockCustomer = () => {
    if (selectedCustomer) {
      setCustomers(
        customers.map((c) => (c.id === selectedCustomer.id ? { ...c, status: "Blocked" } : c))
      )
      setBlockOpen(false)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedCustomer) {
      setCustomers(customers.filter((c) => c.id !== selectedCustomer.id))
      setDeleteOpen(false)
      setSelectedCustomer(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Mail className="h-4 w-4" />
          Email All
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{customers.length}</p>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{customers.filter((c) => c.status === "Active").length}</p>
            <p className="text-sm text-muted-foreground">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">234</p>
            <p className="text-sm text-muted-foreground">New This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{formatPrice(43256)}</p>
            <p className="text-sm text-muted-foreground">Avg. Order Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-9" />
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">
                    <Checkbox />
                  </th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Orders</th>
                  <th className="pb-3 pr-4">Total Spent</th>
                  <th className="pb-3 pr-4">Last Order</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border">
                    <td className="py-4 pr-4">
                      <Checkbox />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={customer.avatar || "/placeholder.svg"}
                            alt={customer.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">{customer.orders}</td>
                    <td className="py-4 pr-4 font-medium">{formatPrice(customer.totalSpent)}</td>
                    <td className="py-4 pr-4 text-sm text-muted-foreground">{customer.lastOrder}</td>
                    <td className="py-4 pr-4">
                      <Badge
                        variant="secondary"
                        className={
                          customer.status === "Active"
                            ? "bg-green-500/10 text-green-600"
                            : customer.status === "Inactive"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                        }
                      >
                        {customer.status}
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
                          <DropdownMenuItem onClick={() => handleViewClick(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmailClick(customer)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBlockClick(customer)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(customer)}>
                            <Trash2 className="mr-2 h-4 w-4" />
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

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing 1-5 of {customers.length} customers</p>
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

      {/* View Profile Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="modal-animate max-w-2xl border-0 bg-white shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-slate-900">Customer Profile</DialogTitle>
            <DialogDescription className="text-slate-600">View customer details and order history</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 shadow-sm border border-slate-200">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-slate-200 bg-gradient-to-br from-blue-100 to-purple-100 shadow-md">
                  <Image
                    src={selectedCustomer.avatar || "/placeholder.svg"}
                    alt={selectedCustomer.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{selectedCustomer.name}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{selectedCustomer.email}</p>
                  <Badge
                    variant="secondary"
                    className={`mt-2 border-0 font-semibold ${
                      selectedCustomer.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : selectedCustomer.status === "Inactive"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
                  <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone</Label>
                    <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{selectedCustomer.phone}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</Label>
                    <p className="mt-2 truncate font-semibold text-slate-900 dark:text-slate-50">{selectedCustomer.email}</p>
                  </div>
                  <div className="col-span-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Address</Label>
                    <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
                  <span className="h-1 w-1 rounded-full bg-purple-500"></span>
                  Order Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 dark:from-blue-900/30 dark:to-blue-800/30">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Total Orders</Label>
                    <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-200">{selectedCustomer.orders}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3 dark:from-purple-900/30 dark:to-purple-800/30">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">Total Spent</Label>
                    <p className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-200">{formatPrice(selectedCustomer.totalSpent)}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 dark:from-emerald-900/30 dark:to-emerald-800/30">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Last Order</Label>
                    <p className="mt-2 font-bold text-emerald-900 dark:text-emerald-200">{selectedCustomer.lastOrder}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Member Since</Label>
                <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{selectedCustomer.joinDate}</p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setViewOpen(false)} className="border-slate-200 dark:border-slate-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="modal-animate max-w-2xl border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-2xl dark:from-slate-900 dark:to-slate-800">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-50 dark:to-slate-300">Edit Customer</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">Update customer information</DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-4">
              <div className="space-y-2.5">
                <Label htmlFor="edit-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="input-enhance border-slate-200 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="edit-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="Enter email"
                    className="input-enhance border-slate-200 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="edit-phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="Enter phone"
                    className="input-enhance border-slate-200 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="edit-address" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Enter address"
                  className="input-enhance border-slate-200 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="edit-status" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                  <SelectTrigger id="edit-status" className="input-enhance border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-slate-200 dark:border-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Drawer */}
      <Sheet open={emailOpen} onOpenChange={setEmailOpen}>
        <SheetContent side="right" className="drawer-animate w-full border-l border-slate-200 bg-gradient-to-b from-slate-50 to-white p-0 shadow-2xl dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 sm:w-[500px]">
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-50 dark:to-slate-300">Send Email</SheetTitle>
              <SheetDescription className="text-slate-600 dark:text-slate-400">
                Send an email to <span className="font-semibold text-slate-900 dark:text-slate-50">{selectedCustomer?.name}</span>
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="email-to" className="text-sm font-semibold text-slate-700 dark:text-slate-300">To</Label>
                  <Input
                    id="email-to"
                    value={selectedCustomer?.email}
                    disabled
                    className="border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="email-subject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailFormData.subject}
                    onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="input-enhance border-slate-200 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="email-message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</Label>
                  <Textarea
                    id="email-message"
                    value={emailFormData.message}
                    onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                    placeholder="Enter your message"
                    rows={8}
                    className="input-enhance resize-none border-slate-200 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
              <Button variant="outline" onClick={() => setEmailOpen(false)} className="border-slate-200 dark:border-slate-700">
                Cancel
              </Button>
              <Button onClick={handleSendEmail} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Block Customer Modal */}
      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent className="alert-animate border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-2xl dark:from-slate-900 dark:to-slate-800">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">Block Customer</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to block <span className="font-bold text-amber-600 dark:text-amber-400">{selectedCustomer?.name}</span>? They will not be able to place orders or access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockCustomer} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800">
              Block Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Customer Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="alert-animate border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-2xl dark:from-slate-900 dark:to-slate-800">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-red-600 dark:text-red-400">{selectedCustomer?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
