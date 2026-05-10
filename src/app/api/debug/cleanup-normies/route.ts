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

  let deleted = [];

  // Delete normies_style customization (if exists)
  const { error: deleteNormiesError } = await sb
    .from("developer_customizations")
    .delete()
    .eq("developer_id", dev.id)
    .eq("item_id", "normies_style");

  if (deleteNormiesError) {
    console.error("Failed to delete normies_style:", deleteNormiesError);
  } else {
    deleted.push("normies_style customization");
  }

  // Also delete normies_style from purchases (if exists)
  const { error: deleteNormiesPurchaseError } = await sb
    .from("purchases")
    .delete()
    .eq("developer_id", dev.id)
    .eq("item_id", "normies_style");

  if (deleteNormiesPurchaseError) {
    console.error("Failed to delete normies_style purchase:", deleteNormiesPurchaseError);
  } else {
    deleted.push("normies_style purchase");
  }

  // CRITICAL: Also delete custom_color (old normies code saved it there)
  const { error: deleteColorError } = await sb
    .from("developer_customizations")
    .delete()
    .eq("developer_id", dev.id)
    .eq("item_id", "custom_color");

  if (deleteColorError) {
    console.error("Failed to delete custom_color:", deleteColorError);
  } else {
    deleted.push("custom_color (old normies data)");
  }

  // Delete custom_color purchase if it exists (was auto-created by old code)
  const { error: deleteColorPurchaseError } = await sb
    .from("purchases")
    .delete()
    .eq("developer_id", dev.id)
    .eq("item_id", "custom_color");

  if (deleteColorPurchaseError) {
    console.error("Failed to delete custom_color purchase:", deleteColorPurchaseError);
  } else {
    deleted.push("custom_color purchase");
  }

  return NextResponse.json({
    success: true,
    message: "All normies data cleaned up from database",
    github_login: githubLogin,
    developer_id: dev.id,
    deleted: deleted,
    note: "Now buy custom_color in the shop and set YOUR color - it will work correctly!",
  });
}
