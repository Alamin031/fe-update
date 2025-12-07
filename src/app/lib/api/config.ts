// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_SOCIAL_LOGIN: '/auth/social-login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_DECODE: '/auth/decode/{token}',

  // Users
  USERS_CREATE: '/users',
  USERS_GET_ALL: '/users',
  USERS_GET_LIST: '/users/all',
  USERS_ME: '/users/me',
  USERS_GET: '/users/{id}',
  USERS_UPDATE: '/users/{id}',
  USERS_DELETE: '/users/{id}',
  USERS_WISHLIST_GET: '/users/{id}/wishlist',
  USERS_WISHLIST_ADD: '/users/{id}/wishlist',
  USERS_WISHLIST_DELETE: '/users/{id}/wishlist/{productId}',
  USERS_COMPARE_GET: '/users/{id}/compare',
  USERS_COMPARE_ADD: '/users/{id}/compare',
  USERS_COMPARE_DELETE: '/users/{id}/compare/{productId}',
  USERS_ORDERS: '/users/{id}/orders',

  // Categories
  CATEGORIES_CREATE: '/categories',
  CATEGORIES_GET: '/categories',
  CATEGORIES_FEATURED: '/categories/featured',
  CATEGORIES_SLUG: '/categories/{slug}',
  CATEGORIES_PRODUCTS: '/categories/{slug}/products',
  CATEGORIES_UPDATE: '/categories/{id}',
  CATEGORIES_DELETE: '/categories/{id}',
  CATEGORIES_GET_ONE: '/categories/{id}',
  // Subcategories
  SUBCATEGORIES_CREATE: '/categories/{categoryId}/subcategories',
  SUBCATEGORIES_GET_ALL: '/categories/{categoryId}/subcategories',
  SUBCATEGORIES_UPDATE: '/categories/subcategories/{id}',
  SUBCATEGORIES_GET_ONE: '/categories/subcategories/{id}',

  // Brands
  BRANDS_CREATE: '/brands',
  BRANDS_GET: '/brands',
  BRANDS_FEATURED: '/brands/featured',
  BRANDS_SLUG: '/brands/{slug}',
  BRANDS_PRODUCTS: '/brands/{slug}/products',
  BRANDS_UPDATE: '/brands/{id}',
  BRANDS_DELETE: '/brands/{id}',




  // Products
  PRODUCTS_CREATE: '/products-new',
  PRODUCTS_GET: '/products-new',
  PRODUCTS_GET_ONE: '/products-new/id/{id}',
  PRODUCTS_FEATURED: '/products/featured',
  PRODUCTS_NEW: '/products/new',
  PRODUCTS_HOT: '/products/hot',
  PRODUCTS_SEARCH: '/products/search',
  PRODUCTS_SLUG: '/products/{slug}',
  PRODUCTS_UPDATE: '/products/{id}',
  PRODUCTS_DELETE: '/products/{id}',

  // Products (New Architecture)
  PRODUCTS_CREATE_BASIC: '/products-new/basic',
  PRODUCTS_CREATE_NETWORK: '/products-new/network',
  PRODUCTS_CREATE_REGION: '/products-new/region',
  PRODUCTS_UPDATE_BASIC: '/products-new/basic/{id}',
  PRODUCTS_UPDATE_NETWORK: '/products-new/network/{id}',
  PRODUCTS_UPDATE_REGION: '/products-new/region/{id}',

  // Product Care Plans
  PRODUCT_CARE_CREATE: '/products/cares',
  PRODUCT_CARE_LIST: '/products/{productId}/cares',
  PRODUCT_CARE_UPDATE: '/products/cares/{id}',
  PRODUCT_CARE_GET: '/products/cares/{id}',
  PRODUCT_CARE_DELETE: '/products/cares/{id}',
  ALL_CARE_GET: '/products/cares',

  // Product Notification Requests
  PRODUCT_NOTIFY_CREATE: '/products/{productId}/notify',
  PRODUCT_NOTIFY_LIST: '/products/{productId}/notify',
  PRODUCT_NOTIFY_UPDATE: '/products/notify/{id}',
  PRODUCT_NOTIFY_GET: '/products/notify/{id}',
  PRODUCT_NOTIFY_DELETE: '/products/notify/{id}',

  // Orders
  ORDERS_CREATE: '/orders',
  ORDERS_GET: '/orders',
  ORDERS_GET_ONE: '/orders/{id}',
  ORDERS_UPDATE_STATUS: '/orders/{id}/status',
  ORDERS_INVOICE: '/orders/{id}/invoice',
  ORDERS_CALCULATE_EMI: '/orders/calculate-emi',
  TRACK_ORDER: '/orders/track',

  // Warranty
  WARRANTY_ACTIVATE: '/warranty/activate',
  WARRANTY_LOOKUP: '/warranty/lookup',
  WARRANTY_LOGS: '/warranty/{id}/logs',

  // Giveaways
  GIVEAWAYS_CREATE: '/giveaways',
  GIVEAWAYS_GET: '/giveaways',
  GIVEAWAYS_GET_ONE: '/giveaways/{id}',
  GIVEAWAYS_GET_BY_PRODUCT: '/giveaways/product',
  GIVEAWAYS_EXPORT: '/giveaways/export',
  GIVEAWAYS_DELETE: '/giveaways/{id}',

  // Policies
  POLICIES_CREATE: '/policies',
  POLICIES_GET: '/policies',
  POLICIES_GET_ONE: '/policies/{id}',
  POLICIES_PUBLISHED: '/policies/published',
  POLICIES_UPDATE: '/policies/{id}',
  POLICIES_DELETE: '/policies/{id}',

  // FAQs
  FAQS_CREATE: '/faqs',
  FAQS_GET: '/faqs',
  FAQS_GET_ONE: '/faqs/{id}',
  FAQS_GET_BY_CATEGORY: '/faqs/category',
  FAQS_GET_BY_PRODUCT: '/faqs/product',
  FAQS_GET_PUBLISHED: '/faqs/published',
  FAQS_UPDATE: '/faqs/{id}',
  FAQS_DELETE: '/faqs/{id}',
  FAQS_SEARCH: '/faqs/search',

  // Reviews
  REVIEWS_CREATE: '/reviews',
  REVIEWS_GET: '/reviews/{productId}',
  REVIEWS_GET_ONE: '/reviews/{id}',
  REVIEWS_UPDATE: '/reviews/{id}',
  REVIEWS_DELETE: '/reviews/{id}',
  REVIEWS_MARK_HELPFUL: '/reviews/{id}/helpful',
  REVIEWS_MARK_UNHELPFUL: '/reviews/{id}/unhelpful',
  REVIEWS_GET_BY_USER: '/reviews/user',
  REVIEWS_GET_VERIFIED: '/reviews/verified',

  // Loyalty
  LOYALTY_POINTS: '/loyalty/{userId}/points',
  LOYALTY_REDEEM: '/loyalty/{userId}/redeem',
  LOYALTY_HISTORY: '/loyalty/{userId}/history',
  LOYALTY_OPTIONS: '/loyalty/{userId}/options',
  LOYALTY_BALANCE: '/loyalty/{userId}/balance',
  LOYALTY_TIER: '/loyalty/{userId}/tier',
  LOYALTY_ADD_POINTS: '/loyalty/{userId}/add-points',

  // SEO
  SEO_PRODUCT: '/seo/products/{id}',
  SEO_CATEGORY: '/seo/categories/{id}',
  SEO_BRAND: '/seo/brands/{id}',
  SEO_SITEMAP: '/seo/sitemap',

  // Marketing
  MARKETING_EMAIL: '/marketing/email',
  MARKETING_CAMPAIGN_STATUS: '/marketing/campaigns/{campaignId}',
  MARKETING_CAMPAIGNS: '/marketing/campaigns',
  MARKETING_BANNERS: '/marketing/banners',
  MARKETING_BANNERS_ACTIVE: '/marketing/banners/active',
  MARKETING_SCHEDULE_CAMPAIGN: '/marketing/schedule-campaign',
  MARKETING_SEGMENTS: '/marketing/segments',
  MARKETING_SMS: '/marketing/sms',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_STOCK_ALERTS: '/admin/stock-alerts',

  // Hero Banner
  HEROBANNER_CREATE: '/herobanner',
  HEROBANNER_GET_ALL: '/herobanner',
  HEROBANNER_GET_ONE: '/herobanner/{id}',
  HEROBANNER_UPDATE: '/herobanner/{id}',
  HEROBANNER_DELETE: '/herobanner/{id}',

  // EMI
  EMI_PLAN_CREATE: '/emi/plan',
  EMI_PLAN_UPDATE: '/emi/plan/{id}',
  EMI_PLAN_GET: '/emi/plan/{id}',
  EMI_PLAN_DELETE: '/emi/plan/{id}',
  EMI_PLANS_GET: '/emi/plans',
  EMI_BANK_CREATE: '/emi/bank',
  EMI_BANK_UPDATE: '/emi/bank/{id}',
  EMI_BANK_GET: '/emi/bank/{id}',
  EMI_BANK_DELETE: '/emi/bank/{id}',
  EMI_BANKS_GET: '/emi/banks',

  // Homecategory
  HOMECATEGORY_CREATE: '/homecategory',
  HOMECATEGORY_LIST: '/homecategory',
  HOMECATEGORY_GET: '/homecategory/{id}',
  HOMECATEGORY_UPDATE: '/homecategory/{id}',
  HOMECATEGORY_DELETE: '/homecategory/{id}',
};
