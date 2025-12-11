"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Brand } from "@/app/types";

interface BrandSliderProps {
  brands: Brand[];
}

export function BrandSlider({ brands }: BrandSliderProps) {
  const safeBrands = Array.isArray(brands) ? brands : [];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Only animate if content is scrollable
    if (el.scrollWidth <= el.clientWidth) return;

    let rafId: number | null = null;
    let lastTime = performance.now();
    const speed = 150; // pixels per second

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isPaused) {
        el.scrollLeft += (delta / 1000) * speed;

        // Seamless loop: reset when we've scrolled past a quarter (since we repeat 4x)
        const quarterWidth = el.scrollWidth / 4;
        if (el.scrollLeft >= quarterWidth) {
          el.scrollLeft = 0;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPaused]);

  return (
    <section aria-label="Shop by brand">
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
        Shop by Brand
      </h2>

      <style>{`
        .brand-slider-container::-webkit-scrollbar {
          display: none;
        }
        .brand-slider-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className="brand-slider-container overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex gap-4 min-w-max items-stretch px-2">
          {Array(4).fill(0).flatMap((_, i) =>
            safeBrands.map((brand) => (
              <Link
                key={`${brand.slug}-dup${i}`}
                href={`/brand/${brand.slug}`}
                aria-label={`Shop ${brand.name}`}
                className="group relative flex shrink-0 items-center justify-center rounded-xl border border-border bg-card p-3 transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                style={{ width: "200px", height: "72px" }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div
                    className="w-full h-full"
                    style={{ aspectRatio: "1920/600", position: "relative" }}
                  >
                    <Image
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      fill
                      className="object-contain opacity-95 transition-opacity duration-200 group-hover:opacity-100 rounded"
                    />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
