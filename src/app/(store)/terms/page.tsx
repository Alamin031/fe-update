import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "TechStore terms and conditions of use.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Terms & Conditions</h1>
      <p className="mb-8 text-muted-foreground">Last updated: November 2024</p>

      <div className="prose prose-neutral max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using TechStore&apos;s website, you accept and agree to be bound by these Terms and
            Conditions. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. Products and Pricing</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>All products are subject to availability</li>
            <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
            <li>We reserve the right to modify prices without prior notice</li>
            <li>Product images are for illustration purposes and may vary slightly</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Orders and Payment</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Order confirmation is subject to stock availability</li>
            <li>We accept various payment methods including credit/debit cards, UPI, and net banking</li>
            <li>Payment must be completed before order processing begins</li>
            <li>We reserve the right to cancel orders due to pricing errors or suspected fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Shipping and Delivery</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Delivery times are estimates and may vary based on location</li>
            <li>Free shipping is available on orders above ৳999</li>
            <li>Risk of loss transfers to you upon delivery</li>
            <li>Someone must be available to receive the package</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Returns and Refunds</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Returns are accepted within 7 days of delivery</li>
            <li>Products must be unused and in original packaging</li>
            <li>Refunds are processed within 5-7 business days</li>
            <li>Some products may not be eligible for return (electronics with broken seal)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Warranty</h2>
          <p className="text-muted-foreground">
            All products come with manufacturer warranty. Warranty claims should be directed to authorized service
            centers. TechStore acts as a facilitator and does not provide direct warranty services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">7. User Accounts</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>You are responsible for maintaining account confidentiality</li>
            <li>You must provide accurate and complete information</li>
            <li>One account per person</li>
            <li>We reserve the right to suspend accounts for violations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            TechStore shall not be liable for any indirect, incidental, special, or consequential damages arising out of
            or in connection with your use of our services. Our total liability shall not exceed the amount paid for the
            product in question.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">9. Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be
            subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">10. Contact</h2>
          <p className="text-muted-foreground">
            For questions about these Terms, contact us at:
            <br />
            Email: legal@techstore.com
            <br />
            Phone: 1800-123-4567
          </p>
        </section>
      </div>
    </div>
  )
}
