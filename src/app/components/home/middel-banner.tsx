"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  herobannerService,
  Herobanner,
} from "@/app/lib/api/services/herobanner";

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  cta?: string;
}

export function MiddleBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch middle banners from API
  useEffect(() => {
    async function fetchBanners() {
      try {
        const apiBanners: Herobanner[] = await herobannerService.findAllMiddle();
        // Map API banners to Banner type
        const mapped = apiBanners.map((b) => ({
          id: b.id,
          image: b.img || "/placeholder.svg",
        }));
        setBanners(mapped);
      } catch {
        setBanners([]);
      }
    }
    fetchBanners();
  }, []);

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

  // Show only the first banner
  const banner = banners[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted">
      <div className="relative w-full" style={{ aspectRatio: "1920/600" }}>
        <Image
          src={banner.image || "/placeholder.svg"}
          alt={banner.title || "Banner"}
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
