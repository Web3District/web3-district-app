import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  const { adId } = await params;
  const sb = getSupabaseAdmin();
  const period = request.nextUrl.searchParams.get("period") ?? "7d";
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10), 200);
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const eventType = request.nextUrl.searchParams.get("event_type") ?? "";

  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "all" ? null : 7;
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : null;

  // ── Build query ──
  let query = sb
    .from("sky_ad_events")
    .select("id, ad_id, event_type, github_login, country, device, ip_hash, click_id, user_agent, created_at", { count: "exact" })
    .eq("ad_id", adId);

  if (since) query = query.gte("created_at", since);
  if (search) query = query.ilike("github_login", `%${search}%`);
  if (eventType && ["impression", "click", "cta_click"].includes(eventType)) {
    query = query.eq("event_type", eventType);
  }

  // Order by most recent first
  query = query.order("created_at", { ascending: false });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: events, count: total } = await query.range(from, to);

  if (total === 0 || !events || events.length === 0) {
    return NextResponse.json({
      events: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
      summary: {
        uniqueUsers: 0,
        impressions: 0,
        clicks: 0,
        ctaClicks: 0,
        conversions: 0,
      },
    });
  }

  // ── Get conversions for these events ──
  const clickIds = events
    .filter((e) => e.click_id)
    .map((e) => e.click_id);

  let conversions = new Map<string, any>();
  if (clickIds.length > 0) {
    const { data: convData } = await sb
      .from("sky_ad_conversions")
      .select("click_id, event_name, revenue_cents, currency, created_at")
      .in("click_id", clickIds);

    if (convData) {
      for (const c of convData) {
        conversions.set(c.click_id, c);
      }
    }
  }

  // ── Aggregate unique users ──
  let userQuery = sb
    .from("sky_ad_events")
    .select("github_login", { count: "exact", distinct: true, head: true })
    .eq("ad_id", adId)
    .not("github_login", "is", null);

  if (since) userQuery = userQuery.gte("created_at", since);
  const { count: uniqueUsers } = await userQuery;

  // ── Summary counts ──
  let summaryQuery = sb
    .from("sky_ad_events")
    .select("event_type")
    .eq("ad_id", adId);
  if (since) summaryQuery = summaryQuery.gte("created_at", since);
  const { data: summaryData } = await summaryQuery;

  const summary = {
    uniqueUsers: uniqueUsers ?? 0,
    impressions: 0,
    clicks: 0,
    ctaClicks: 0,
    conversions: 0,
  };

  if (summaryData) {
    for (const e of summaryData) {
      if (e.event_type === "impression") summary.impressions++;
      else if (e.event_type === "click") summary.clicks++;
      else if (e.event_type === "cta_click") summary.ctaClicks++;
    }
    summary.conversions = conversions.size;
  }

  // ── Enrich events with conversion data ──
  const enrichedEvents = events.map((e) => ({
    ...e,
    conversion: e.click_id ? conversions.get(e.click_id) ?? null : null,
  }));

  // ── Country/device breakdown ──
  const countryCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};

  for (const e of events) {
    if (e.country) countryCounts[e.country] = (countryCounts[e.country] ?? 0) + 1;
    if (e.device) deviceCounts[e.device] = (deviceCounts[e.device] ?? 0) + 1;
  }

  const countries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  const devices = Object.entries(deviceCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ type, count }));

  return NextResponse.json({
    events: enrichedEvents,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    summary,
    breakdown: {
      countries,
      devices,
    },
  });
}
