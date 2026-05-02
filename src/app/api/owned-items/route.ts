import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const login = url.searchParams.get("login");

  if (!login) {
    return NextResponse.json({ error: "login required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Get developer ID
  const { data: dev } = await sb
    .from("developers")
    .select("id")
    .eq("github_login", login.toLowerCase())
    .single();

  if (!dev) {
    return NextResponse.json({ items: [] });
  }

  // Get owned items (purchases + gifts)
  const [ownPurchases, giftPurchases] = await Promise.all([
    sb.from("purchases")
      .select("item_id")
      .eq("developer_id", dev.id)
      .is("gifted_to", null)
      .eq("status", "completed"),
    sb.from("purchases")
      .select("item_id")
      .eq("gifted_to", dev.id)
      .eq("status", "completed"),
  ]);

  const items = [
    ...(ownPurchases.data ?? []).map((r) => r.item_id),
    ...(giftPurchases.data ?? []).map((r) => r.item_id),
  ];

  return NextResponse.json({ items });
}
