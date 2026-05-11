import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const sb = getSupabaseAdmin();
  const period = request.nextUrl.searchParams.get("period") ?? "7d";

  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "all" ? null : 7;
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : null;

  // Get all ads
  const { data: ads } = await sb
    .from("sky_ads")
    .select("id, brand, text, vehicle, active, advertiser_id")
    .order("created_at", { ascending: false });

  if (!ads || ads.length === 0) {
    return NextResponse.json({ ads: [] });
  }

  // Get all events for all ads in period
  let eventsQuery = sb
    .from("sky_ad_events")
    .select("ad_id, event_type, github_login, country, device, click_id, created_at");

  if (since) eventsQuery = eventsQuery.gte("created_at", since);
  const { data: events } = await eventsQuery.limit(50000);

  // Get conversions
  const clickIds = events?.filter((e) => e.click_id).map((e) => e.click_id) ?? [];
  const convMap = new Map<string, number>();
  if (clickIds.length > 0) {
    const { data: convData } = await sb
      .from("sky_ad_conversions")
      .select("click_id")
      .in("click_id", clickIds.slice(0, 1000));
    if (convData) {
      for (const c of convData) {
        convMap.set(c.click_id, (convMap.get(c.click_id) ?? 0) + 1);
      }
    }
  }

  // Aggregate per ad
  const adStats = new Map<string, {
    id: string;
    brand: string;
    vehicle: string;
    active: boolean;
    impressions: number;
    clicks: number;
    ctaClicks: number;
    uniqueUsers: Set<string>;
    usersClicked: number;
    usersVisited: number;
    conversions: number;
    topCountry: string | null;
    topDevice: string | null;
    lastEvent: string | null;
  }>();

  for (const ad of ads) {
    adStats.set(ad.id, {
      id: ad.id,
      brand: ad.brand || ad.id,
      vehicle: ad.vehicle,
      active: ad.active,
      impressions: 0,
      clicks: 0,
      ctaClicks: 0,
      uniqueUsers: new Set(),
      usersClicked: 0,
      usersVisited: 0,
      conversions: 0,
      topCountry: null,
      topDevice: null,
      lastEvent: null,
    });
  }

  const countryCounts = new Map<string, Map<string, number>>();
  const deviceCounts = new Map<string, Map<string, number>>();
  const userClicks = new Map<string, Set<string>>();
  const userCtaClicks = new Map<string, Set<string>>();

  for (const e of events ?? []) {
    const stat = adStats.get(e.ad_id);
    if (!stat) continue;

    if (e.event_type === "impression") stat.impressions++;
    else if (e.event_type === "click") {
      stat.clicks++;
      if (e.github_login) {
        if (!userClicks.has(e.ad_id)) userClicks.set(e.ad_id, new Set());
        userClicks.get(e.ad_id)!.add(e.github_login);
      }
    }
    else if (e.event_type === "cta_click") {
      stat.ctaClicks++;
      if (e.github_login) {
        if (!userCtaClicks.has(e.ad_id)) userCtaClicks.set(e.ad_id, new Set());
        userCtaClicks.get(e.ad_id)!.add(e.github_login);
      }
      if (e.click_id && convMap.has(e.click_id)) {
        stat.conversions += convMap.get(e.click_id)!;
      }
    }

    if (e.github_login) stat.uniqueUsers.add(e.github_login);
    if (e.country) {
      if (!countryCounts.has(e.ad_id)) countryCounts.set(e.ad_id, new Map());
      const cm = countryCounts.get(e.ad_id)!;
      cm.set(e.country, (cm.get(e.country) ?? 0) + 1);
    }
    if (e.device) {
      if (!deviceCounts.has(e.ad_id)) deviceCounts.set(e.ad_id, new Map());
      const dm = deviceCounts.get(e.ad_id)!;
      dm.set(e.device, (dm.get(e.device) ?? 0) + 1);
    }

    if (!stat.lastEvent || e.created_at > stat.lastEvent) {
      stat.lastEvent = e.created_at;
    }
  }

  const result = Array.from(adStats.values()).map((s) => {
    // Top country
    const cm = countryCounts.get(s.id);
    if (cm && cm.size > 0) {
      s.topCountry = Array.from(cm.entries()).sort(([, a], [, b]) => b - a)[0][0];
    }
    // Top device
    const dm = deviceCounts.get(s.id);
    if (dm && dm.size > 0) {
      s.topDevice = Array.from(dm.entries()).sort(([, a], [, b]) => b - a)[0][0];
    }

    return {
      id: s.id,
      brand: s.brand,
      vehicle: s.vehicle,
      active: s.active,
      impressions: s.impressions,
      clicks: s.clicks,
      ctaClicks: s.ctaClicks,
      uniqueUsers: s.uniqueUsers.size,
      usersClicked: userClicks.get(s.id)?.size ?? 0,
      usersVisited: userCtaClicks.get(s.id)?.size ?? 0,
      conversions: s.conversions,
      topCountry: s.topCountry,
      topDevice: s.topDevice,
      lastEvent: s.lastEvent,
    };
  });

  // Sort by engagement: conversions > ctaClicks > uniqueUsers
  result.sort((a, b) => {
    const scoreA = a.conversions * 10000 + a.ctaClicks * 100 + a.uniqueUsers;
    const scoreB = b.conversions * 10000 + b.ctaClicks * 100 + b.uniqueUsers;
    return scoreB - scoreA;
  });

  return NextResponse.json({ ads: result });
}
