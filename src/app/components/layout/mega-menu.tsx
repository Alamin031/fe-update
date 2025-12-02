"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/app/lib/utils"
import type { Category } from "@/app/types"

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

export function MegaMenu({ isOpen, onClose, categories }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Sort categories by priority
  const sortedCategories = [...categories].sort((a, b) => {
    const priorityA = a.priority ? Number(a.priority) : Infinity
    const priorityB = b.priority ? Number(b.priority) : Infinity
    return priorityA - priorityB
  })

  return (
    <div
      ref={menuRef}
      onMouseLeave={onClose}
      className={cn(
        "absolute left-0 right-0 z-40 border-b border-border bg-background shadow-lg transition-all duration-200",
        isOpen ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div>
          {/* Categories Only */}
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h3>
          <div className="grid gap-3 grid-cols-10">
            {sortedCategories.length > 0 ? (
              <>
                {sortedCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    onClick={onClose}
                    className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                      <Image
                        src={category.banner || category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-center line-clamp-2">{category.name}</span>
                  </Link>
                ))}
                <Link
                  href="/all-products"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background text-xl font-bold flex-shrink-0">
                    +
                  </div>
                  <span className="text-xs font-medium text-center">View All</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
