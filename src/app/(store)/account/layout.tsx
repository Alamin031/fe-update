"use client"

import { useEffect } from "react"
import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, MapPin, Heart, CreditCard, Bell, Settings, LogOut, ChevronRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useAuthStore } from "@/app/store/auth-store"
import AuthService from "@/app/lib/api/services/auth.service"
const authService = new AuthService();


const sidebarLinks = [
  { href: "/account", label: "Dashboard", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/wallet", label: "Rewards", icon: CreditCard },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    try {
      await authService.logout(); // clear backend session if needed
    } catch {
      // Optionally handle error
    }
    logout(); // clear local store
    router.push("/");
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            {/* User Info Section */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user?.name || "User"}</p>
                <p className="truncate text-sm text-muted-foreground">{user?.email || "No email"}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Link>
              ))}

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex w-full items-center gap-3 justify-start rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </nav>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}
