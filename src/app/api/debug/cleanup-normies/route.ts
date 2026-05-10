import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Cleanup endpoint - deletes normies_style from developer_customizations
 * This fixes the bug where old normies data conflicts with custom_color
 */
export async function POST() {
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
    .select("id, github_login")
    .eq("github_login", githubLogin)
    .single();

  if (!dev) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }

  // Delete normies_style customization (if exists)
  const { error: deleteError } = await sb
    .from("developer_customizations")
    .delete()
    .eq("developer_id", dev.id)
    .eq("item_id", "normies_style");

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete normies_style", details: deleteError },
      { status: 500 }
    );
  }

  // Also delete normies_style from purchases (if exists)
  const { error: deletePurchaseError } = await sb
    .from("purchases")
    .delete()
    .eq("developer_id", dev.id)
    .eq("item_id", "normies_style");

  return NextResponse.json({
    success: true,
    message: "Normies style cleaned up from database",
    github_login: githubLogin,
    developer_id: dev.id,
    note: "Now set your custom_color in the shop - it will work correctly!",
  });
}
