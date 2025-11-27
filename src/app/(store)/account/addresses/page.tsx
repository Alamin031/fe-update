"use client"

import { useState } from "react"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { EditAddressModal } from "../../../components/account/edit-address-modal"
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react"
import { Address } from "../../../types"

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    name: "John Doe",
    phone: "+880 1234567890",
    address: "123 Main Street, Apartment 4B",
    city: "Dhaka",
    area: "Gulshan",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "John Doe",
    phone: "+880 9876543210",
    address: "456 Office Tower, Floor 10",
    city: "Dhaka",
    area: "Banani",
    isDefault: false,
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setSelectedAddress(address)
    } else {
      setSelectedAddress(null)
    }
    setModalOpen(true)
  }

  const handleSaveAddress = (address: Address) => {
    if (selectedAddress) {
      // Update existing address
      setAddresses(
        addresses.map((a) =>
          a.id === address.id ? address : { ...a, isDefault: false }
        )
      )
    } else {
      // Add new address
      if (address.isDefault) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: false })).concat([address])
        )
      } else {
        setAddresses((prev) => [...prev, address])
      }
    }
    setModalOpen(false)
    setSelectedAddress(null)
  }

  const handleDeleteAddress = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      setAddresses(addresses.filter((a) => a.id !== id))
    }
  }

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
  }

  const defaultAddress = addresses.find((a) => a.isDefault)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Addresses</h1>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className="relative">
            {address.isDefault && (
              <div className="absolute right-4 top-4">
                <Badge className="bg-green-500">Default</Badge>
              </div>
            )}
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Address Header */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{address.name}</p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{address.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.area && `${address.area}, `}
                        {address.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(address)}
                    className="flex-1 gap-1 bg-transparent"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 bg-transparent"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex-1 gap-1 bg-transparent text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No addresses yet</h3>
          <p className="text-muted-foreground">Add an address to get started with your orders</p>
          <Button
            onClick={() => handleOpenModal()}
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </div>
      )}

      {/* Edit Address Modal */}
      <EditAddressModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedAddress(null)
        }}
        address={selectedAddress}
        onSave={handleSaveAddress}
      />
    </div>
  )
}
