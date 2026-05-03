"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import type { SkyAd } from "@/lib/skyAds";

const site = typeof window !== "undefined" ? window.location.origin : "https://web4city.xyz";

interface AdminAd {
  id: string;
  brand: string;
  campaign?: string;
  image_url?: string;
  logo_url?: string;
  cta_text?: string;
  cta_url?: string;
  target_url?: string;
  active: boolean;
  paid: boolean;
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  priority: number;
  type: string;
  placement?: string;
  created_at: string;
  updated_at: string;
}

export function useAdminAds() {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: adsError } = await supabase
        .from("ads")
        .select("*")
        .eq("active", true)
        .order("priority", { ascending: false });

      if (adsError) throw adsError;

      setAds(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  }

  return { ads, loading, error, refetch: fetchAds };
}

/**
 * Convert admin ads to SkyAd format for the city
 */
export function adminAdsToSkyAds(adminAds: AdminAd[]): SkyAd[] {
  return adminAds
    .filter(ad => ad.active)
    .map(ad => {
      const vehicle = ad.type === "blimp" ? "blimp" : ad.type === "plane" ? "plane" : "billboard" as const;
      
      return {
        id: ad.id,
        text: ad.brand || ad.campaign || "ADVERTISEMENT",
        brand: ad.brand,
        description: ad.campaign,
        color: "#f8d880",
        bgColor: "#1a1018",
        link: ad.cta_url || ad.target_url || site,
        vehicle,
        priority: ad.priority || 10,
      } as SkyAd;
    });
}
