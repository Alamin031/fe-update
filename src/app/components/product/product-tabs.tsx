"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/app/lib/utils"
import type { Product } from "@/app/types"

interface ProductTabsProps {
  product: Product;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
    productIds?: string[];
    categoryIds?: string[];
    orderIndex?: number;
    createdAt?: string;
  }>;
}



export function ProductTabs({ product, faqs = [] }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("specifications");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "description", label: "Description" },
    { id: "warranty", label: "Warranty & Support" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 pb-4 px-2 md:px-6 text-sm md:text-base font-medium transition-all duration-200 relative",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground rounded-full mx-2 md:mx-6" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-12 animate-in fade-in-0 duration-300">
        {activeTab === "specifications" && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                      index % 2 === 0 ? "bg-muted/30" : "bg-card",
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-muted-foreground w-1/3 uppercase tracking-wide">{key}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "description" && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <div
                className="text-base text-muted-foreground leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
            </div>
            {product.highlights.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                <ul className="grid gap-3">
                  {product.highlights.map((highlight, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <div className="h-2 w-2 rounded-full bg-foreground mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "warranty" && (
          <div className="space-y-8 max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-8 border border-blue-200/20 dark:border-blue-700/20">
              <h3 className="text-lg font-bold mb-3">Warranty Information</h3>
              <p className="text-muted-foreground leading-relaxed">{product.warranty}</p>
            </div>
          </div>
        )}

        {activeTab === "faq" && faqs.length > 0 && (
          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, index) => (
              <div
                key={faq.id || index}
                className="overflow-hidden rounded-2xl border border-border transition-all duration-200 hover:border-border/70 hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left font-semibold hover:bg-muted/50 transition-colors"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-300 text-muted-foreground",
                      openFAQ === index && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openFAQ === index ? "max-h-48" : "max-h-0"
                  )}
                >
                  <div className="border-t border-border bg-muted/30 p-6 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "faq" && faqs.length === 0 && (
          <div className="text-muted-foreground text-center py-8">No FAQs available for this product.</div>
        )}
      </div>
    </div>
  );
}
