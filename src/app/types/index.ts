export interface Specification {
  id: string
  productId: string
  specKey: string
  specValue: string
  displayOrder: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  comparePrice?: number
  stockQuantity?: number
  images?: string[] | Array<{id: string; imageUrl: string; isThumbnail: boolean; altText: string; displayOrder: number; createdAt: string}>
  category: Category
  brand: Brand
  variants: ProductVariant[]
  highlights: string[]
  specifications: Specification[]
  stock: number
  sku: string
  warranty: string
  rating: number
  reviewCount: number
  ratingPoint?: number
  isFeatured?: boolean
  isNew?: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  type: "color" | "storage" | "ram" | "sim"
  value: string
  priceModifier: number
  stock: number
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  parentId?: string
  children?: Category[]
  productCount?: number
  banner?: string
  priority?: number | string
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  productCount?: number
}

export interface CartItem {
  product: Product
  quantity: number
  selectedVariants: Record<string, string>
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string
  image?: string | null
  role: "user" | "admin"
  addresses: Address[]
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  area: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  user: User
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  shipping: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  shippingAddress: Address
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: Product
  quantity: number
  price: number
  selectedVariants: Record<string, string>
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link: string
  isActive: boolean
  order: number
}

export interface MegaMenuItem {
  id: string
  title: string
  type: "category" | "brand" | "link"
  items: {
    name: string
    slug: string
    image?: string
  }[]
}
