"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { useWishlistStore } from "../../../store/wishlist-store"
import { useCartStore } from "../../../store/cart-store"
import { formatPrice } from "../../../lib/utils/format"
import { withProtectedRoute } from "../../../lib/auth/protected-route"

function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = (item: (typeof items)[0]) => {
    // Assuming each wishlist item is a full Product, otherwise map all required fields here
    addToCart(item)
    removeItem(item.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearWishlist}>
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
            <p className="mt-2 text-muted-foreground">Save items you like by clicking the heart icon.</p>
            <Link href="/">
              <Button className="mt-6 gap-2">
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <Link href={`/product/${item.slug}`}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="line-clamp-2 font-medium hover:underline">{item.name}</h3>
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPrice(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="flex-1 gap-2" onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default withProtectedRoute(WishlistPage, {
  requiredRoles: ["user"],
})
