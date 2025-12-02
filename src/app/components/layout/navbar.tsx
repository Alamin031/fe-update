"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, BarChart3, Phone, MapPin } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "../ui/sheet"
import { useCartStore } from "@/app/store/cart-store"
import { useWishlistStore } from "@/app/store/wishlist-store"
import { useCompareStore } from "@/app/store/compare-store"
import { MegaMenu } from "./mega-menu"
import { SearchModal } from "./search-modal"
import { useAuthStore } from "@/app/store/auth-store"
import { cn } from "@/app/lib/utils"
import Image from "next/image"
import { categoriesService } from "@/app/lib/api/services/categories"
import { brandsService } from "@/app/lib/api/services/brands"
import type { Category, Brand } from "@/app/types"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingBrands, setIsLoadingBrands] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const cartItemCount = useCartStore((state) => state.getItemCount())
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const compareCount = useCompareStore((state) => state.items.length)
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true)
        const data = await categoriesService.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchBrands() {
      try {
        setIsLoadingBrands(true)
        const data = await brandsService.findAll()
        setBrands(data)
      } catch (error) {
        console.error("Error fetching brands:", error)
        setBrands([])
      } finally {
        setIsLoadingBrands(false)
      }
    }
    fetchBrands()
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      {/* Top bar */}
      <div className="hidden border-b border-border bg-muted/50 lg:block">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center">
          <p className="text-sm font-medium">
            Get Extra 5% Off On Prepaid Orders | Shop Now
          </p>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm transition-shadow duration-200",
          isScrolled && "shadow-sm",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/image/logo.png"
              alt="Friend's Telecom"
              width={140}
              height={30}
              className="rounded-lg object-contain"
              priority
            />
            <span className="sr-only">Friend&apos;s Telecom</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <button
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                isMegaMenuOpen && "bg-accent",
              )}
            >
              Categories
              <ChevronDown className={cn("h-4 w-4 transition-transform", isMegaMenuOpen && "rotate-180")} />
            </button>
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  pathname === `/category/${category.slug}` && "bg-accent",
                )}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/all-products"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                pathname === "/all-products" && "bg-accent",
              )}
            >
              All Products
            </Link>
          </nav>

          {/* Search - Desktop */}
          <div className="hidden flex-1 max-w-md lg:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-input bg-muted/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              <span>Search products...</span>
              <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-xs">⌘K</kbd>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Compare */}
            <Link href="/compare" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" className="relative">
                <BarChart3 className="h-5 w-5" />
                {isHydrated && compareCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{compareCount}</Badge>
                )}
                <span className="sr-only">Compare</span>
              </Button>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {isHydrated && wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{wishlistCount}</Badge>
                )}
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {isHydrated && cartItemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{cartItemCount}</Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user?.role !== "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/account">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/wishlist">Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <span className="text-lg font-semibold">Menu</span>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link
                          href="/all-products"
                          className="block rounded-md px-3 py-2 text-sm font-medium font-semibold transition-colors hover:bg-accent"
                        >
                          All Products
                        </Link>
                      </SheetClose>
                      {categories.map((category) => (
                        <SheetClose key={category.slug} asChild>
                          <Link
                            href={`/category/${category.slug}`}
                            className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                          >
                            {category.name}
                          </Link>
                        </SheetClose>
                      ))}
                      <SheetClose asChild>
                        <Link
                          href="/deals"
                          className="block rounded-md px-3 py-2 text-sm font-medium text-[oklch(0.55_0.2_25)] transition-colors hover:bg-accent"
                        >
                          Hot Deals
                        </Link>
                      </SheetClose>
                    </div>
                    <div className="mt-6 border-t border-border pt-6">
                      <div className="space-y-1">
                        <SheetClose asChild>
                          <Link
                            href="/wishlist"
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                          >
                            Wishlist
                            {wishlistCount > 0 && <Badge variant="secondary">{wishlistCount}</Badge>}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/compare"
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                          >
                            Compare
                            {compareCount > 0 && <Badge variant="secondary">{compareCount}</Badge>}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/track-order"
                            className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                          >
                            Track Order
                          </Link>
                        </SheetClose>
                      </div>
                    </div>
                  </nav>
                  <div className="border-t border-border p-4">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        {user?.role !== "admin" && (
                          <SheetClose asChild>
                            <Link href="/account">
                              <Button variant="outline" className="w-full bg-transparent">
                                Dashboard
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        {user?.role === "admin" && (
                          <SheetClose asChild>
                            <Link href="/admin">
                              <Button variant="outline" className="w-full bg-transparent">
                                Admin Panel
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full"
                        >
                          <Button variant="destructive" className="w-full">
                            Sign Out
                          </Button>
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <SheetClose asChild>
                          <Link href="/login">
                            <Button className="w-full">Sign In</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/register">
                            <Button variant="outline" className="w-full bg-transparent">
                              Register
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mega Menu */}
        <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} categories={categories} brands={brands} />
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
