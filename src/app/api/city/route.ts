import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Edge cache for 60s

export async function GET(request: Request) {
  const sb = getSupabaseAdmin();
  const url = new URL(request.url);
  const lite = url.searchParams.has("lite");

  // Fetch all developers in batches (Supabase max is 1000 per request)
  const allDevs: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data, error } = await sb
      .from("developers")
      .select(
        "id, github_login, name, avatar_url, contributions, total_stars, public_repos, primary_language, rank, claimed, kudos_count, visit_count, contributions_total, contribution_years, total_prs, total_reviews, repos_contributed_to, followers, following, organizations_count, account_created_at, current_streak, active_days_last_year, language_diversity, app_streak, rabbit_completed, district, home_district, district_chosen, xp_total, xp_level"
      )
      .order("rank", { ascending: true })
      .range(offset, offset + batchSize - 1);
    
    if (error || !data || data.length === 0) break;
    allDevs.push(...data);
    if (data.length < batchSize) break;
    offset += batchSize;
  }

  const statsResult = await sb.from("city_stats").select("*").eq("id", 1).single();

  const devs = allDevs as Record<string, any>[];

  // Basic response - just developer data (fast)
  const basicDevs = devs.map((dev) => ({
    ...dev,
    kudos_count: dev.kudos_count ?? 0,
    visit_count: dev.visit_count ?? 0,
    owned_items: [],
    custom_color: null,
    billboard_images: [],
    achievements: [],
    loadout: null,
    app_streak: dev.app_streak ?? 0,
    raid_xp: dev.raid_xp ?? 0,
    current_week_contributions: dev.current_week_contributions ?? 0,
    current_week_kudos_given: dev.current_week_kudos_given ?? 0,
    current_week_kudos_received: dev.current_week_kudos_received ?? 0,
    active_raid_tag: null,
    rabbit_completed: dev.rabbit_completed ?? false,
    xp_total: dev.xp_total ?? 0,
    xp_level: dev.xp_level ?? 1,
  }));

  // Lite mode: skip heavy joins, return immediately
  // Note: We still load purchases even for large cities - they're essential for owned_items
  if (lite) {
    return NextResponse.json(
      {
        developers: basicDevs,
        _d: [],
        stats: statsResult.data ?? { total_developers: 0, total_contributions: 0 },
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  }

  const devIds = devs.map((d: Record<string, any>) => d.id);

  if (devIds.length === 0) {
    return NextResponse.json(
      {
        developers: [],
        stats: statsResult.data ?? { total_developers: 0, total_contributions: 0 },
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  }

  // Full mode: enrich with purchases, customizations, etc.
  console.log('[city-api] Fetching purchases for', devIds.length, 'developers');
  const purchasesResult = await sb.from("purchases").select("developer_id, item_id").in("developer_id", devIds).is("gifted_to", null).eq("status", "completed");
  console.log('[city-api] Purchases result:', purchasesResult.error ?? 'OK', 'rows:', purchasesResult.data?.length ?? 0);
  
  const [giftPurchasesResult, customizationsResult, achievementsResult, raidTagsResult, activeDropsResult] = await Promise.all([
    sb.from("purchases").select("gifted_to, item_id").in("gifted_to", devIds).eq("status", "completed"),
    sb.from("developer_customizations").select("developer_id, item_id, config").in("developer_id", devIds).in("item_id", ["custom_color", "billboard", "loadout"]),
    sb.from("developer_achievements").select("developer_id, achievement_id").in("developer_id", devIds),
    sb.from("raid_tags").select("building_id, attacker_login, tag_style, expires_at").in("building_id", devIds).eq("active", true),
    sb.from("building_drops").select("id, building_id, rarity, points, max_pulls, pull_count, expires_at").in("building_id", devIds).gt("expires_at", new Date().toISOString()),
  ]);

  const ownedItemsMap: Record<number, string[]> = {};
  for (const row of purchasesResult.data ?? []) {
    if (!ownedItemsMap[row.developer_id]) ownedItemsMap[row.developer_id] = [];
    ownedItemsMap[row.developer_id].push(row.item_id);
  }
  for (const row of giftPurchasesResult.data ?? []) {
    const devId = row.gifted_to as number;
    if (!ownedItemsMap[devId]) ownedItemsMap[devId] = [];
    ownedItemsMap[devId].push(row.item_id);
  }

  const customColorMap: Record<number, string> = {};
  const billboardImagesMap: Record<number, string[]> = {};
  const loadoutMap: Record<number, { crown: string | null; roof: string | null; aura: string | null }> = {};
  for (const row of customizationsResult.data ?? []) {
    const config = row.config as Record<string, unknown>;
    if (row.item_id === "custom_color" && typeof config?.color === "string") customColorMap[row.developer_id] = config.color;
    if (row.item_id === "billboard") {
      if (Array.isArray(config?.images)) billboardImagesMap[row.developer_id] = config.images as string[];
      else if (typeof config?.image_url === "string") billboardImagesMap[row.developer_id] = [config.image_url];
    }
    if (row.item_id === "loadout") loadoutMap[row.developer_id] = { crown: (config?.crown as string) ?? null, roof: (config?.roof as string) ?? null, aura: (config?.aura as string) ?? null };
  }

  const achievementsMap: Record<number, string[]> = {};
  for (const row of achievementsResult.data ?? []) {
    if (!achievementsMap[row.developer_id]) achievementsMap[row.developer_id] = [];
    achievementsMap[row.developer_id].push(row.achievement_id);
  }

  const raidTagMap: Record<number, { attacker_login: string; tag_style: string; expires_at: string }> = {};
  for (const row of raidTagsResult.data ?? []) raidTagMap[row.building_id] = { attacker_login: row.attacker_login, tag_style: row.tag_style, expires_at: row.expires_at };

  const idToRank = new Map<number, number>();
  for (const dev of devs) idToRank.set(dev.id, dev.rank);

  const _d: { n: number; id: string; r: string; p: number; m: number; c: number; x: string }[] = [];
  for (const row of activeDropsResult.data ?? []) {
    if (row.pull_count < row.max_pulls) {
      const rank = idToRank.get(row.building_id);
      if (rank !== undefined) _d.push({ n: rank, id: row.id, r: row.rarity, p: row.points, m: row.max_pulls, c: row.pull_count, x: row.expires_at });
    }
  }

  const developersWithItems = devs.map((dev) => ({
    ...dev,
    kudos_count: dev.kudos_count ?? 0,
    visit_count: dev.visit_count ?? 0,
    owned_items: ownedItemsMap[dev.id] ?? [],
    custom_color: customColorMap[dev.id] ?? null,
    billboard_images: billboardImagesMap[dev.id] ?? [],
    achievements: achievementsMap[dev.id] ?? [],
    loadout: loadoutMap[dev.id] ?? null,
    app_streak: dev.app_streak ?? 0,
    raid_xp: dev.raid_xp ?? 0,
    current_week_contributions: dev.current_week_contributions ?? 0,
    current_week_kudos_given: dev.current_week_kudos_given ?? 0,
    current_week_kudos_received: dev.current_week_kudos_received ?? 0,
    active_raid_tag: raidTagMap[dev.id] ?? null,
    rabbit_completed: dev.rabbit_completed ?? false,
    xp_total: dev.xp_total ?? 0,
    xp_level: dev.xp_level ?? 1,
  }));

  return NextResponse.json(
    { developers: developersWithItems, _d, stats: statsResult.data ?? { total_developers: 0, total_contributions: 0 } },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
