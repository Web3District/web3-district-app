import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/analytics/building
 * Track building interaction events (for ALL buildings)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { building_login, building_slug, event_type, user_github_login, user_developer_id, session_id, url, metadata } = body;

    if (!event_type) {
      return NextResponse.json({ error: "event_type required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("building_events")
      .insert({
        building_login: building_login ?? null,
        building_slug: building_slug ?? null,
        event_type,
        user_github_login: user_github_login ?? null,
        user_developer_id: user_developer_id ?? null,
        session_id: session_id ?? null,
        url: url ?? null,
        metadata: metadata ?? {},
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking building event:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/analytics/building
 * Get building analytics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const accessToken = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify admin session
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubLogin = user.user_metadata?.user_name ?? 
                        user.user_metadata?.full_name ?? 
                        user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(githubLogin.toLowerCase())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "summary";

    if (type === "users") {
      // Get user activity (who shared/visited what)
      const { data, error } = await supabase
        .from("building_user_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return NextResponse.json({ activity: data ?? [] });
    }

    if (type === "top") {
      // Get top buildings by engagement
      const { data, error } = await supabase
        .from("top_buildings_by_engagement")
        .select("*");

      if (error) throw error;
      return NextResponse.json({ top: data ?? [] });
    }

    // Default: summary view
    const { data, error } = await supabase
      .from("building_analytics_summary")
      .select("*")
      .limit(500);

    if (error) throw error;
    return NextResponse.json({ summary: data ?? [] });

  } catch (error: any) {
    console.error("Error fetching building analytics:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}
