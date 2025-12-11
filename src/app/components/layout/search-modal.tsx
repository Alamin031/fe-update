/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { productsService } from "@/app/lib/api/services/products"
import { useRouter } from "next/navigation"
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"

const popularSearches = ["iPhone 15 Pro", "Samsung Galaxy", "MacBook Pro", "AirPods", "iPad", "Galaxy Watch"]

const recentSearches = ["Wireless charger", "Phone case", "USB-C cable"]

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

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {query.length === 0 ? (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleSearch(search)}
                          className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/80"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                {loading ? (
                  <div className="p-3 text-center text-muted-foreground">Searching...</div>
                ) : results.length > 0 ? (
                  results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent"
                    >
                      <span className="font-medium">{product.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => handleSearch(query)}
                    className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent"
                  >
                    <span className="font-medium">Search for &quot;{query}&quot;</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
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
