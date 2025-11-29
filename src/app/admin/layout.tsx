import type React from 'react';
import type {Metadata} from 'next';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  FolderTree,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {Badge} from '../components/ui/badge';
import {Suspense} from 'react';
import {AdminHeader} from '../components/admin/admin-header';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your e-commerce store.',
};

const sidebarLinks = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/banners', label: 'Banners', icon: ImageIcon},
  {href: '/admin/brand', label: 'Brand', icon: TrendingUp},
  {href: '/admin/categories', label: 'Categories', icon: FolderTree},
  {href: '/admin/emi', label: 'EMI Plans', icon: CreditCard},
  {href: '/admin/products', label: 'Products', icon: Package},
  {href: '/admin/product-faqs', label: 'Product Faqs', icon: MessageSquare},
  {href: '/admin/homeshow-category', label: 'HomeShow Category', icon: FolderTree},
  {href: '/admin/product-care-plan', label: 'Product Care Plan', icon: Settings},
  {href: '/admin/privacy-policy', label: 'Privacy Policy', icon: Settings},
  {href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: '12'},
  {href: '/admin/customers', label: 'Customers', icon: Users},
  {
    href: '/admin/notify-products',
    label: 'Notify Products',
    icon: AlertCircle,
    badge: 'new',
  },
  {href: '/admin/settings', label: 'Settings', icon: Settings},
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card lg:block">
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
          </div>
          <div className="flex flex-col h-[calc(100vh-64px)]">
            <nav className="flex-1 overflow-y-auto space-y-1 p-4">
              {sidebarLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <link.icon className="h-5 w-5" />
                  {link.label}
                  {link.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border p-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <LogOut className="h-5 w-5" />
                Back to Store
              </Link>
            </div>
          </div>
        </aside>
      </Suspense>

      <div className="flex-1 lg:ml-64">
        <Suspense fallback={<div className="h-16 bg-background" />}>
          <AdminHeader />
        </Suspense>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
