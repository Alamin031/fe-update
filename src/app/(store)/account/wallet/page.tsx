import { CreditCard, Gift, Plus, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { formatPrice } from "../../../lib/utils/format"

const transactions = [
  { id: "1", type: "credit", description: "Cashback on order #ORD-2024-001", amount: 250, date: "Nov 20, 2024" },
  { id: "2", type: "credit", description: "Referral bonus", amount: 500, date: "Nov 15, 2024" },
  { id: "3", type: "debit", description: "Used on order #ORD-2024-002", amount: -100, date: "Nov 10, 2024" },
  { id: "4", type: "credit", description: "Welcome bonus", amount: 1000, date: "Nov 01, 2024" },
]

const coupons = [
  { code: "WELCOME10", discount: "10% off", validity: "Dec 31, 2024", minOrder: 999 },
  { code: "FLAT500", discount: "₹500 off", validity: "Nov 30, 2024", minOrder: 4999 },
]

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rewards</h1>
        <p className="text-muted-foreground">Manage your rewards.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <CreditCard className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm opacity-90">Wallet Balance</p>
                <p className="text-3xl font-bold">{formatPrice(2500)}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Money
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                View History
              </Button>
            </div>
          </CardContent>
        </Card> */}

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
                <Gift className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reward Points</p>
                <p className="text-3xl font-bold">1,250</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              = {formatPrice(1250)} value • Earn 1 point per ৳100 spent
            </p>
            <Button className="mt-4 w-full" variant="fjhfhs">
              Redeem Points
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <span className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {transaction.amount > 0 ? "+" : ""}
                  {formatPrice(Math.abs(transaction.amount))}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Available Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex items-center justify-between rounded-lg border border-dashed border-primary p-4"
              >
                <div>
                  <p className="font-mono text-lg font-bold text-primary">{coupon.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {coupon.discount} on orders above {formatPrice(coupon.minOrder)}
                  </p>
                  <p className="text-xs text-muted-foreground">Valid till {coupon.validity}</p>
                </div>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
