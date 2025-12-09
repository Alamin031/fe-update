import type { Metadata } from "next"
import { HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import { Input } from "../../components/ui/input"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about TechStore.",
}

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How can I track my order?",
        a: "You can track your order by logging into your account and going to 'My Orders'. Click on the specific order to view real-time tracking information. You'll also receive tracking updates via email and SMS.",
      },
      {
        q: "What are the shipping charges?",
        a: "We offer free shipping on all orders above ৳999. For orders below ৳999, a flat shipping fee of ৳49 is applicable. Express delivery is available at an additional charge of ৳99.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-5 business days for metros and 5-7 business days for other cities. Express delivery is available in select cities with 1-2 day delivery.",
      },
      {
        q: "Do you deliver to my location?",
        a: "We deliver to 500+ cities across India. Enter your pincode at checkout to verify delivery availability to your location.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for most products. Items must be unused, in original packaging, and with all tags intact. Some items like opened electronics and customized products are non-returnable.",
      },
      {
        q: "How do I initiate a return?",
        a: "Go to 'My Orders' in your account, select the item you want to return, choose a reason, and schedule a pickup. Our delivery partner will collect the item from your location.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.",
      },
    ],
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept credit cards, debit cards, UPI, net banking, EMI options, and Cash on Delivery. We also support wallet payments through popular digital wallets.",
      },
      {
        q: "Is EMI available on all products?",
        a: "No-cost EMI is available on select products above ৳3,000. You can view EMI options on the product page. EMI is available on credit cards from major banks.",
      },
      {
        q: "Is it safe to pay online?",
        a: "Yes, all transactions on our website are secured with SSL encryption. We use PCI-DSS compliant payment gateways to ensure your payment information is protected.",
      },
    ],
  },
  {
    category: "Products & Warranty",
    questions: [
      {
        q: "Are all products genuine?",
        a: "Yes, we only sell 100% genuine products sourced directly from brands or authorized distributors. All products come with official brand warranty.",
      },
      {
        q: "How do I claim warranty?",
        a: "For warranty claims, contact the brand's authorized service center with your invoice. You can find service center details on the brand's official website or contact our support team for assistance.",
      },
      {
        q: "Do you provide installation services?",
        a: "We offer installation services for select products like TVs and large appliances in major cities. You can add installation service at checkout if available for your product and location.",
      },
    ],
  },
  {
    category: "Account",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click on 'Sign Up' at the top of the page and fill in your details. You can also sign up using your Google or Facebook account for quick registration.",
      },
      {
        q: "I forgot my password. How can I reset it?",
        a: "Click on 'Forgot Password' on the login page and enter your registered email address. We'll send you a link to reset your password.",
      },
      {
        q: "How do I update my contact information?",
        a: "Log into your account, go to 'Settings', and update your personal information including name, email, phone number, and addresses.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Find answers to common questions about orders, shipping, returns, and more.
        </p>
      </div>

      <div className="mb-8">
        <Input type="search" placeholder="Search FAQs..." className="mx-auto max-w-md" />
      </div>

      <div className="space-y-8">
        {faqs.map((category) => (
          <div key={category.category}>
            <h2 className="mb-4 text-xl font-semibold">{category.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, index) => (
                <AccordionItem key={index} value={`${category.category}-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-muted p-6 text-center">
        <h3 className="mb-2 font-semibold">Still have questions?</h3>
        <p className="mb-4 text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Contact our support team.
        </p>
        <p className="text-sm">Email: support@techstore.com | Phone: 1800-123-4567</p>
      </div>
    </div>
  )
}
