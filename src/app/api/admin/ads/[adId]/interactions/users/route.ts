import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  const { adId } = await params;
  const sb = getSupabaseAdmin();
  const period = request.nextUrl.searchParams.get("period") ?? "7d";

  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "all" ? null : 7;
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : null;

  // Get all events for this ad
  let query = sb
    .from("sky_ad_events")
    .select("github_login, event_type, country, device, click_id, created_at")
    .eq("ad_id", adId)
    .order("created_at", { ascending: true });

  if (since) query = query.gte("created_at", since);
  const { data: events } = await query.limit(10000);

  if (!events || events.length === 0) {
    return NextResponse.json({ users: [] });
  }

  // Get conversions
  const clickIds = events.filter((e) => e.click_id).map((e) => e.click_id);
  const convMap = new Map<string, any>();
  if (clickIds.length > 0) {
    const { data: convData } = await sb
      .from("sky_ad_conversions")
      .select("click_id, event_name, revenue_cents, currency")
      .in("click_id", clickIds);
    if (convData) {
      for (const c of convData) convMap.set(c.click_id, c);
    }
  }

  // Group by github_login
  const userMap = new Map<string, {
    login: string;
    country: string | null;
    device: string | null;
    impressions: number;
    clicks: number;
    ctaClicks: number;
    conversions: number;
    firstSeen: string;
    lastSeen: string;
    funnel: string;
    events: Array<{ type: string; time: string; clickId?: string; conversion?: any }>;
  }>();

  for (const e of events) {
    if (!e.github_login) continue;
    const login = e.github_login;

    if (!userMap.has(login)) {
      userMap.set(login, {
        login,
        country: e.country,
        device: e.device,
        impressions: 0,
        clicks: 0,
        ctaClicks: 0,
        conversions: 0,
        firstSeen: e.created_at,
        lastSeen: e.created_at,
        funnel: "",
        events: [],
      });
    }

    const user = userMap.get(login)!;
    user.lastSeen = e.created_at;
    if (e.country) user.country = e.country;
    if (e.device) user.device = e.device;

    if (e.event_type === "impression") user.impressions++;
    else if (e.event_type === "click") user.clicks++;
    else if (e.event_type === "cta_click") {
      user.ctaClicks++;
      const conv = e.click_id ? convMap.get(e.click_id) : null;
      if (conv) user.conversions++;
      user.events.push({ type: "cta_click", time: e.created_at, clickId: e.click_id ?? undefined, conversion: conv });
    } else {
      user.events.push({ type: e.event_type, time: e.created_at });
    }
  }

  // Compute funnel string
  const users = Array.from(userMap.values()).map((u) => {
    const parts: string[] = [];
    if (u.impressions > 0) parts.push("viewed");
    if (u.clicks > 0) parts.push("clicked");
    if (u.ctaClicks > 0) parts.push("visited");
    if (u.conversions > 0) parts.push("converted");
    u.funnel = parts.join(" → ") || "unknown";
    return u;
  });

  // Sort by engagement score: conversions > ctaClicks > clicks > impressions
  users.sort((a, b) => {
    const scoreA = a.conversions * 1000 + a.ctaClicks * 100 + a.clicks * 10 + a.impressions;
    const scoreB = b.conversions * 1000 + b.ctaClicks * 100 + b.clicks * 10 + b.impressions;
    return scoreB - scoreA;
  });

  return NextResponse.json({ users });
}
