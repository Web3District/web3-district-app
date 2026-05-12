import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/analytics/landmark
 * Track landmark interaction events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landmark_slug, event_type, user_github_login, user_developer_id, session_id, url, metadata } = body;

    if (!landmark_slug || !event_type) {
      return NextResponse.json({ error: "landmark_slug and event_type required" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("landmark_events")
      .insert({
        landmark_slug,
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
    console.error("Error tracking landmark event:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/analytics/landmark
 * Get landmark analytics (admin only)
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
      // Get user activity (who shared what)
      const { data, error } = await supabase
        .from("landmark_user_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return NextResponse.json({ activity: data ?? [] });
    }

    // Default: summary view
    const { data, error } = await supabase
      .from("landmark_analytics_summary")
      .select("*");

    if (error) throw error;
    return NextResponse.json({ summary: data ?? [] });

  } catch (error: any) {
    console.error("Error fetching landmark analytics:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}
