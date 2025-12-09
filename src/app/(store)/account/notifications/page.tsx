"use client"

import { useState } from "react"
import { Bell, Package, Tag, CreditCard, Megaphone, Check, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Switch } from "../../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { withProtectedRoute } from "../../../lib/auth/protected-route"

const notifications = [
  {
    id: "1",
    type: "order",
    title: "Order Delivered",
    message: "Your order #ORD-2024-001 has been delivered successfully.",
    time: "2 hours ago",
    read: false,
    icon: Package,
  },
  {
    id: "2",
    type: "promotion",
    title: "Flash Sale Alert!",
    message: "Up to 50% off on electronics. Sale starts in 2 hours!",
    time: "5 hours ago",
    read: false,
    icon: Tag,
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Successful",
    message: "Payment of ৳1,48,399 for order #ORD-2024-001 completed.",
    time: "1 day ago",
    read: true,
    icon: CreditCard,
  },
  {
    id: "4",
    type: "promotion",
    title: "New Arrivals",
    message: "Check out the latest iPhone 15 Pro Max - Now available!",
    time: "2 days ago",
    read: true,
    icon: Megaphone,
  },
]

const notificationSettings = [
  { id: "orders", label: "Order Updates", description: "Get notified about your order status", enabled: true },
  {
    id: "promotions",
    label: "Promotions & Offers",
    description: "Receive exclusive deals and discounts",
    enabled: true,
  },
  { id: "payments", label: "Payment Alerts", description: "Get notified about payment activities", enabled: true },
  { id: "newsletter", label: "Newsletter", description: "Weekly updates on new products", enabled: false },
]

function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications)
  const [settings, setSettings] = useState(notificationSettings)

  const markAllAsRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifs(notifs.filter((n) => n.id !== id))
  }

  const toggleSetting = (id: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  const unreadCount = notifs.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage your notifications and preferences.</p>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <TabsContent value="all" className="mt-6 space-y-4">
          {notifs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifs.map((notification) => (
              <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.read ? "bg-muted" : "bg-primary/10"
                    }`}
                  >
                    <notification.icon
                      className={`h-5 w-5 ${notification.read ? "text-muted-foreground" : "text-primary"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {!notification.read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6 space-y-4">
          {notifs.filter((n) => !n.read).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Check className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">All caught up!</p>
              </CardContent>
            </Card>
          ) : (
            notifs
              .filter((n) => !n.read)
              .map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <notification.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch checked={setting.enabled} onCheckedChange={() => toggleSetting(setting.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withProtectedRoute(NotificationsPage, {
  requiredRoles: ["user"],
})
