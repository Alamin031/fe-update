"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/app/lib/utils";
import {
  herobannerService,
  Herobanner,
} from "@/app/lib/api/services/herobanner";
import { Truck, Shield, CreditCard, Headphones } from "lucide-react";

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  cta?: string;
}

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    async function fetchBanners() {
      try {
        const apiBanners: Herobanner[] = await herobannerService.findAll();
        console.log("Fetched banners:", apiBanners);
        // Map API banners to Banner type (add fallback for missing fields)
        const mapped = apiBanners.map((b) => ({
          id: b.id,
          image: b.img || "/placeholder.svg",
          // Optionally add title, subtitle, link, cta if your API provides them
        }));
        setBanners(mapped);
      } catch {
        setBanners([]);
      }
    }
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (banners.length || 1));
  }, [banners.length]);

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, banners.length]);

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over ৳5,000",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure checkout",
    },
    {
      icon: CreditCard,
      title: "Easy EMI",
      description: "0% interest available",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated support",
    },
  ];

  if (banners.length === 0) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-muted w-full flex items-center justify-center"
        style={{ aspectRatio: "1920/600" }}
      >
        <span className="text-muted-foreground">No banners available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner Slider */}
      <div
        className="relative overflow-hidden rounded-2xl bg-muted"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        <div className="relative w-full" style={{ aspectRatio: "1920/600" }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title || "Banner"}
                fill
                priority={index === 0}
                className="object-cover"
              />
              {/* Content (optional, only if you have title/subtitle/cta in API) */}
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
                  <div className="max-w-lg">
                    {banner.title && (
                      <h2 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="mt-3 text-lg text-muted-foreground md:text-xl">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.link && banner.cta && (
                      <Link href={banner.link}>
                        <Button size="lg" className="mt-6">
                          {banner.cta}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide
                  ? "w-8 bg-foreground"
                  : "w-2 bg-foreground/30 hover:bg-foreground/50"
              )}
              disabled={banners.length <= 1}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="rounded-lg bg-background border border-border overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className={cn(
                "flex flex-col items-center justify-center text-center p-6 hover:bg-muted/50 transition-colors border-border",
                index < 2 && "border-b md:border-b-0",
                index === 0 && "border-r",
                index === 1 && "md:border-r",
                index === 2 && "border-r md:border-r",
              )}
            >
              <div className="flex items-center justify-center mb-3">
                <feature.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
