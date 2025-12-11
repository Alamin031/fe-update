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

  return (
    <section aria-label="Shop by brand">
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
        Shop by Brand
      </h2>

      <div className="overflow-x-auto">
        <div className="flex gap-4 justify-center items-stretch px-4 pb-2">
          {safeBrands.map((brand) => (
            <Link
              key={brand.slug}
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
          ))}
        </div>
      </div>
    </section>
  );
}
