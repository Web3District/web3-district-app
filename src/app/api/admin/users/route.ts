import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const sb = getSupabaseAdmin();

  const { data: devs, error } = await sb
    .from("developers")
    .select("id, github_login, name, avatar_url, visit_count, contributions, public_repos, district, account_created_at, xp_total, current_streak, claimed, claimed_by")
    .order("xp_total", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: devs ?? [] });
}

export async function POST(request: Request) {
  const sb = getSupabaseAdmin();
  const body = await request.json();
  const { action, user_id, reason } = body;

  if (action === "ban") {
    const { error } = await sb
      .from("banned_users")
      .insert({
        user_id,
        reason: reason ?? "Banned by admin",
        banned_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "User banned" });
  }

  if (action === "unban") {
    const { error } = await sb
      .from("banned_users")
      .delete()
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "User unbanned" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
