import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Debug endpoint - returns ALL customizations for the logged-in user
 * Use this to diagnose normies color issues
 */
export async function GET() {
  // Auth required
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const githubLogin = (
    user.user_metadata?.user_name ??
    user.user_metadata?.preferred_username ??
    ""
  ).toLowerCase();

  if (!githubLogin) {
    return NextResponse.json({ error: "No GitHub login found" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Get developer record
  const { data: dev } = await sb
    .from("developers")
    .select("id, github_login, claimed, claimed_by")
    .eq("github_login", githubLogin)
    .single();

  if (!dev) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }

  // Get ALL customizations (not filtering by item_id)
  const { data: allCustomizations } = await sb
    .from("developer_customizations")
    .select("item_id, config, created_at, updated_at")
    .eq("developer_id", dev.id)
    .order("created_at", { ascending: false });

  // Get ALL purchases
  const { data: allPurchases } = await sb
    .from("purchases")
    .select("item_id, status, created_at")
    .eq("developer_id", dev.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  // Get current custom_color specifically
  const { data: customColorRow } = await sb
    .from("developer_customizations")
    .select("config")
    .eq("developer_id", dev.id)
    .eq("item_id", "custom_color")
    .maybeSingle();

  // Get normies_style specifically (if it exists)
  const { data: normiesRow } = await sb
    .from("developer_customizations")
    .select("config")
    .eq("developer_id", dev.id)
    .eq("item_id", "normies_style")
    .maybeSingle();

  return NextResponse.json({
    github_login: githubLogin,
    developer_id: dev.id,
    claimed: dev.claimed,
    all_customizations: allCustomizations ?? [],
    all_purchases: allPurchases ?? [],
    custom_color: customColorRow?.config ?? null,
    normies_style: normiesRow?.config ?? null,
    debug_note: "If normies_style exists but custom_color doesn't, that's the bug! Delete normies_style entry.",
  });
}
