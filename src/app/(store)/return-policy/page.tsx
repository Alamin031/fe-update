import type { Metadata } from "next"
import { Package, RefreshCw, Clock, CreditCard, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"

export const metadata: Metadata = {
  title: "Return Policy",
  description: "TechStore return and refund policy.",
}

const highlights = [
  { icon: Clock, title: "7 Days", description: "Return window from delivery" },
  { icon: RefreshCw, title: "Easy Returns", description: "Free pickup from your location" },
  { icon: CreditCard, title: "Quick Refunds", description: "5-7 business days processing" },
  { icon: Package, title: "Original Packaging", description: "Required for all returns" },
]

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Return & Refund Policy</h1>

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-4 text-center">
              <item.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="prose prose-neutral max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Return Eligibility</h2>
          <p className="mb-4 text-muted-foreground">
            We accept returns for most products within 7 days of delivery. To be eligible for a return:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Product must be unused and in the same condition as received</li>
            <li>Product must be in original packaging with all tags and accessories</li>
            <li>Product seal must not be broken (for electronic devices)</li>
            <li>You must have the original invoice/receipt</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Non-Returnable Items</h2>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">The following items cannot be returned:</span>
            </div>
            <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              <li>Products with broken seals (earphones, memory cards, software)</li>
              <li>Customized or personalized items</li>
              <li>Products damaged due to misuse</li>
              <li>Items purchased during clearance sales</li>
              <li>Consumables and accessories below ৳500</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">How to Return</h2>
          <ol className="list-decimal space-y-3 pl-6 text-muted-foreground">
            <li>
              <strong>Initiate Return:</strong> Go to My Orders and select the item you want to return
            </li>
            <li>
              <strong>Select Reason:</strong> Choose the reason for return from the dropdown
            </li>
            <li>
              <strong>Schedule Pickup:</strong> Select a convenient date for pickup
            </li>
            <li>
              <strong>Pack the Item:</strong> Securely pack the product in original packaging
            </li>
            <li>
              <strong>Hand Over:</strong> Give the package to our delivery partner during pickup
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Refund Process</h2>
          <p className="mb-4 text-muted-foreground">
            Once we receive and inspect your return, we will process your refund:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Refund to original payment method: 5-7 business days</li>
            <li>Refund to bank account: 5-7 business days after initiation</li>
            <li>Store credit: Instant upon return approval</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Replacement</h2>
          <p className="text-muted-foreground">
            If you received a damaged or defective product, you can request a replacement instead of a refund.
            Replacements are subject to stock availability. If the product is out of stock, a full refund will be
            processed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            For return-related queries, contact our customer support:
            <br />
            Email: returns@techstore.com
            <br />
            Phone: 1800-123-4567
          </p>
        </section>
      </div>
    </div>
  )
}
