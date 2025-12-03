/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== Auth Types ====================
export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SocialLoginRequest {
  provider: "google" | "facebook"
  accessToken: string
}

export interface AuthResponse {
  user: User
  token: string
  access_token?: string
  refreshToken?: string
}

// ==================== User Types ====================
export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string
  image?: string | null
  role: "user" | "admin" | "management"
  isAdmin?: boolean
  roles?: string[]
  addresses?: Address[]
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  address: string
  city: string
  area: string
  isDefault: boolean
  createdAt: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface UserListResponse {
  data: User[]
  pagination: PaginationMeta
}


// ==================== Subcategory Types ====================
export interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  banner?: string;
  priority?: number;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Category Types ====================
export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  banner?: string;
  priority?: number;
  homeCategoryId?: string;
  subcategories?: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string
  slug?: string
  banner?: string | File
  priority?: number
}

export interface UpdateCategoryRequest {
  name?: string
  slug?: string
  banner?: string | File
  priority?: number
}

export interface CategoryProductsResponse {
  data: Product[]
  filters: CategoryFilters
  pagination: PaginationMeta
}

export interface CategoryFilters {
  brands: Brand[]
  priceRange: { min: number; max: number }
  ratings: number[]
  availability: string[]
}

// ==================== Brand Types ====================
export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo: string
  banner?: string
  productCount?: number
  isFeatured?: boolean
  order?: number
  createdAt: string
  updatedAt: string
}

export interface CreateBrandRequest {
  slug: string
  name: string
  description?: string
  logo: string
  banner?: string
  isFeatured?: boolean
}

export interface UpdateBrandRequest {
  slug?: string
  name?: string
  description?: string
  logo?: string
  banner?: string
  isFeatured?: boolean
}

export interface BrandProductsResponse {
  data: Product[]
  brand: Brand
  pagination: PaginationMeta
}

// ==================== Product Types ====================
export interface Product {
  id: string;
  name: string;
  description?: string;
  highlights?: string[];
  categoryId?: string;
  category?: Category;
  brandId?: string;
  brand?: any;
  productCode?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  averageRating?: number;
  rewardsPoints?: number;
  basePrice: number;
  priceObj?: any;
  discountPrice?: number;
  discountPercent?: number;
  price?: number;
  minBookingPrice?: number;
  purchasePoints?: number;
  model?: string;
  slug?: string;
  productType?: string;
  warranty?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  isOfficial?: boolean;
  isComing?: boolean;
  isPreOrder?: boolean;
  isActive?: boolean;
  isOnline?: boolean;
  freeShipping?: boolean;
  stock?: number;
  thumbnail?: string;
  gallery?: string[];
  image?: string[];
  variants?: { name: string; price: string; stock: string }[];
  regions?: { name: string; price: string; stock: string }[];
  colors?: { name: string; code: string }[];
  networks?: string[];
  sizes?: string[];
  plugs?: string[];
  video?: string;
  emiAvailable?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  metaKeywords?: string[];
  tags?: string[];
  badges?: string[];
  dynamicInputs?: Record<string, unknown>;
  details?: any;
  specifications?: { key: string; value: string }[];
  campaigns?: any;
  metaTitle?: any;
  faqIds?: string[];
  status?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  price: string;
  stock: string;
  // Optionally add: type, value, priceModifier, etc. if you extend backend
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  image?: File | string | null;
  gallery?: (File | string)[];
  images?: string[];
  thumbnail?: string;
  categoryId: string;
  brandId: string;
  variants: Omit<ProductVariant, "id" | "productId">[];
  highlights?: string[];
  specifications: { key: string; value: string }[];
  stock: number;
  sku?: string;
  warranty?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  originalPrice?: number
  image?: File | string | null;
  gallery?: (File | string)[];
  images?: string[];
  thumbnail?: string
  categoryId?: string
  brandId?: string
  variants?: Omit<ProductVariant, "id" | "productId">[]
  highlights?: string[]
  specifications?: Record<string, string>
  stock?: number
  sku?: string
  warranty?: string
  isFeatured?: boolean
  isNew?: boolean
  isHot?: boolean
  discount?: number
}

export interface ProductFilters {
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  inStock?: boolean
  featured?: boolean
  new?: boolean
  hot?: boolean
}

export interface ProductListResponse {
  data: Product[]
  pagination: PaginationMeta
  filters?: ProductFilters
}

export interface ProductSearchResponse {
  data: Product[]
  pagination: PaginationMeta
  query: string
}

// ==================== Order Types ====================
export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  shipping: number
  discount: number
  tax?: number
  total: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  selectedVariants: Record<string, string>
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface CreateOrderRequest {
  items: {
    productId: string
    quantity: number
    selectedVariants: Record<string, string>
  }[]
  shippingAddressId: string
  billingAddressId?: string
  paymentMethod: string
  notes?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  notes?: string
  trackingNumber?: string
}

export interface OrderInvoiceResponse {
  id: string
  orderNumber: string
  html: string
  pdfUrl?: string
}

export interface CalculateEMIRequest {
  amount: number
  months: number
}

export interface CalculateEMIResponse {
  amount: number
  months: number
  monthlyPayment: number
  totalPayment: number
  interest: number
}

// ==================== Warranty Types ====================
export interface Warranty {
  id: string
  orderId: string
  productId: string
  imei: string
  startDate: string
  endDate: string
  status: "active" | "expired" | "claimed"
  logs: WarrantyLog[]
  createdAt: string
}

export interface WarrantyLog {
  id: string
  warrantyId: string
  action: string
  description: string
  createdAt: string
}

export interface ActivateWarrantyRequest {
  orderId: string
  productId: string
  imei: string
}

export interface WarrantyLookupResponse {
  warranty: Warranty
  product: Product
  order: Order
}

// ==================== Giveaway Types ====================
export interface GiveawayEntry {
  id: string
  name: string
  email: string
  phone: string
  productId: string
  message?: string
  createdAt: string
}

export interface CreateGiveawayEntryRequest {
  name: string
  email: string
  phone: string
  productId: string
  message?: string
}

export interface GiveawayListResponse {
  data: GiveawayEntry[]
  pagination: PaginationMeta
}

// ==================== Policy Types ====================
export interface Policy {
  id: string
  title: string
  slug: string
  content: string
  type: "privacy" | "terms" | "shipping" | "return" | "refund" | "warranty" | "custom"
  isPublished: boolean
  orderIndex?: number
  createdAt: string
  updatedAt: string
}


export interface CreatePolicyRequest {
  title: string;
  content: string;
  type: Policy["type"];
  isPublished?: boolean;
  slug?: string;
  orderIndex?: number;
}

export interface UpdatePolicyRequest {
  title?: string;
  content?: string;
  type?: Policy["type"];
  isPublished?: boolean;
  slug?: string;
  orderIndex?: number;
}

// ==================== FAQ Types ====================
export interface FAQ {
  id: string
  question: string
  answer: string
  categoryIds?: string[]
  productIds?: string[]
  orderIndex?: number
  createdAt: string
  updatedAt: string
}

export interface CreateFAQRequest {
  question: string
  answer: string
  category?: string
  productId?: string
  isPublished?: boolean
}

export interface UpdateFAQRequest {
  question?: string
  answer?: string
  category?: string
  productId?: string
  isPublished?: boolean
}

// ==================== Review Types ====================
export interface Review {
  id: string
  productId: string
  userId: string
  user?: User
  rating: number
  title: string
  content: string
  images?: string[]
  verified: boolean
  helpful: number
  unhelpful: number
  createdAt: string
  updatedAt: string
}

export interface CreateReviewRequest {
  productId: string
  rating: number
  title: string
  content: string
  images?: string[]
}

export interface ReviewListResponse {
  data: Review[]
  pagination: PaginationMeta
  averageRating: number
  totalReviews: number
}

// ==================== Loyalty Types ====================
export interface LoyaltyPoints {
  userId: string
  totalPoints: number
  availablePoints: number
  redeemedPoints: number
  history: LoyaltyTransaction[]
  createdAt: string
  updatedAt: string
}

export interface LoyaltyTransaction {
  id: string
  userId: string
  type: "earn" | "redeem" | "expire"
  points: number
  description: string
  reference?: string
  createdAt: string
}

export interface RedeemLoyaltyRequest {
  points: number
}

export interface RedeemLoyaltyResponse {
  transaction: LoyaltyTransaction
  remainingPoints: number
  discount: number
}

// ==================== SEO Types ====================
export interface SEOMetadata {
  id: string
  entityId: string
  entityType: "product" | "category" | "brand"
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  canonicalUrl?: string
  structuredData?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority: number
}

// ==================== Marketing Types ====================
export interface MarketingEmail {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  template: string
  templateVariables?: Record<string, unknown>
  html?: string
}

export interface SendMarketingEmailRequest {
  emails: MarketingEmail[]
  schedule?: string
}

export interface MarketingEmailResponse {
  id: string
  status: "sent" | "scheduled" | "failed"
  sentAt?: string
  scheduledAt?: string
  failureReason?: string
}

// ==================== Admin Types ====================
export interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  newUsersThisMonth: number
  newOrdersThisMonth: number
  revenueThisMonth: number
  topProducts: Product[]
  recentOrders: Order[]
}

export interface AnalyticsData {
  period: "day" | "week" | "month" | "year"
  dateRange: { start: string; end: string }
  metrics: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    totalUsers: number
    conversionRate: number
    topCategories: { name: string; sales: number }[]
    topBrands: { name: string; sales: number }[]
    salesTrend: { date: string; revenue: number; orders: number }[]
  }
}

export interface StockAlert {
  id: string
  productId: string
  product?: Product
  currentStock: number
  threshold: number
  status: "low" | "critical"
  createdAt: string
}

// ==================== Common Types ====================
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface PaginatedRequest {
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    pagination?: PaginationMeta
    timestamp?: string
  }
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
  status: number
}

// ==================== Paginated Response Type ====================
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ==================== User Profile, Wishlist, Compare Types ====================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin" | "management";
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface CompareItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}
