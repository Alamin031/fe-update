/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { productsService } from "@/app/lib/api/services/products"
import { useRouter } from "next/navigation"
import { Search, X, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"

// Removed popularSearches and recentSearches

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  useEffect(() => {
    let active = true;
    if (query.trim().length > 0) {
      productsService.search(query.trim()).then((res) => {
        if (active) {
          setLoading(true);
          setResults(res.data || []);
          setLoading(false);
        }
      }).catch(() => {
        if (active) {
          setLoading(true);
          setResults([]);
          setLoading(false);
        }
      });
    } else {
      // Instead of calling setState synchronously, reset state in a microtask
      Promise.resolve().then(() => {
        if (active) {
          setResults([]);
          setLoading(false);
        }
      });
    }
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // Parent should handle opening
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
      setQuery("")
    }
  }

  const handleProductClick = (product: any) => {
    if (product.slug) {
      router.push(`/product/${product.slug}`)
      onClose()
      setQuery("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-auto mt-20 max-w-2xl px-4">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(query)
                }
              }}
              placeholder="Search products, brands, categories..."
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content: Only search results, with loading spinner */}
          <div className="max-h-[60vh] overflow-y-auto p-4 flex items-center justify-center">
            {query.length === 0 ? null : (
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg className="animate-spin h-8 w-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  </div>
                ) : results.filter(product =>
                    product.name && product.name.toLowerCase().includes(query.trim().toLowerCase())
                  ).length > 0 ? (
                  <div className="space-y-1">
                    {results.filter(product =>
                      product.name && product.name.toLowerCase().includes(query.trim().toLowerCase())
                    ).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent"
                      >
                        <span className="font-medium">{product.name}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  query.trim().length > 0 && !loading ? (
                    <div className="flex justify-center items-center py-8 text-muted-foreground">
                      searching...
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5">↵</kbd>
                to search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5">esc</kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
