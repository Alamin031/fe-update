"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/app/lib/utils"

interface ProductGalleryProps {
  images: string[]
  name: string
  isEmi?: boolean
  isCare?: boolean
  selectedColorImage?: string | null
}

export function ProductGallery({ images, name, isEmi, isCare, selectedColorImage }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const displayImages = images.length > 0 ? images : ["/placeholder.svg?height=600&width=600"]

  // Use color image as the main image if available, otherwise use the first image
  const mainImageUrl = selectedColorImage || displayImages[selectedIndex] || "/placeholder.svg"

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleLightboxImageChange = (index: number) => {
    setSelectedIndex(index)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image Container */}
        <div
          className="group relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-muted to-muted/50 shadow-sm cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => {
            setIsZoomed(false)
          }}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={mainImageUrl}
            alt={`${name} - Image ${selectedIndex + 1}`}
            fill
            priority
            className={cn(
              "object-cover transition-transform duration-300",
              isZoomed && "scale-150"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />

          {/* Badges */}
          {(isEmi || isCare) && (
            <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
              {isEmi && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                  EMI Available
                </span>
              )}
              {isCare && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                  Care Plan
                </span>
              )}
            </div>
          )}

          {/* Zoom Hint */}
          <div
            className={cn(
              "absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-medium text-background backdrop-blur-sm transition-all duration-300",
              isZoomed ? "opacity-0" : "opacity-100"
            )}
          >
            <ZoomIn className="h-3.5 w-3.5" />
            <span>Click to expand</span>
          </div>

          {/* Navigation Arrows - Show on hover */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full shadow-lg opacity-0 transition-all duration-300 group-hover:opacity-100 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={prevImage}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full shadow-lg opacity-0 transition-all duration-300 group-hover:opacity-100 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={nextImage}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute right-4 bottom-4 bg-foreground/90 text-background text-xs font-semibold px-3 py-1.5 rounded-full">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
            <div className="flex gap-2 mx-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 group hover:shadow-md",
                    selectedIndex === index
                      ? "border-foreground shadow-md scale-105"
                      : "border-muted hover:border-foreground/30"
                  )}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selectedIndex === index}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in-0 duration-300">
          <div className="relative h-full w-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-muted z-10"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Container */}
            <div className="relative h-[70vh] w-full max-w-5xl">
              <Image
                src={mainImageUrl}
                alt={`${name} - Image ${selectedIndex + 1}`}
                fill
                priority
                className="object-contain"
              />

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full shadow-lg bg-background/80 hover:bg-background"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full shadow-lg bg-background/80 hover:bg-background"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-sm font-semibold px-4 py-2 rounded-full">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            </div>

            {/* Thumbnail Carousel in Lightbox */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
                <div className="flex gap-2">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleLightboxImageChange(index)}
                      className={cn(
                        "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                        selectedIndex === index
                          ? "border-foreground ring-2 ring-foreground/50 scale-110"
                          : "border-muted/50 hover:border-foreground/30"
                      )}
                      aria-label={`View image ${index + 1}`}
                      aria-current={selectedIndex === index}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${name} - Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
