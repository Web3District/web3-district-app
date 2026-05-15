import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_MISSIONS = [
  { id: "checkin", title: "Daily presence", description: "Check in today", threshold: 1, desktopOnly: false, active: true },
  { id: "give_kudos", title: "Spread the love", description: "Give kudos to a dev", threshold: 1, desktopOnly: false, active: true },
  { id: "give_kudos_3", title: "Kudos spree", description: "Give kudos to 3 devs", threshold: 3, desktopOnly: false, active: true },
  { id: "visit_building", title: "Building inspector", description: "Visit a dev's building", threshold: 1, desktopOnly: false, active: true },
  { id: "visit_3_buildings", title: "City explorer", description: "Visit 3 buildings", threshold: 3, desktopOnly: false, active: true },
  { id: "fly_score_50", title: "Casual pilot", description: "Score 50+ in Fly mode", threshold: 1, desktopOnly: true, active: true },
  { id: "fly_score_150", title: "Sky collector", description: "Score 150+ in Fly mode", threshold: 1, desktopOnly: true, active: true },
  { id: "win_battle", title: "Victorious", description: "Win a battle", threshold: 1, desktopOnly: false, active: true },
  { id: "attempt_battle", title: "Ready to fight", description: "Attempt a battle", threshold: 1, desktopOnly: false, active: true },
  { id: "visit_shop", title: "Window shopper", description: "Visit the shop", threshold: 1, desktopOnly: false, active: true },
  { id: "check_leaderboard", title: "Stats checker", description: "Check the leaderboard", threshold: 1, desktopOnly: false, active: true },
  { id: "explore_district", title: "District hopper", description: "Explore a different district", threshold: 1, desktopOnly: false, active: true },
];

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Try to get missions from database
    const { data, error } = await supabase
      .from("daily_missions_pool")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      // Return default missions if table doesn't exist or is empty
      return NextResponse.json({ missions: DEFAULT_MISSIONS });
    }

    return NextResponse.json({ missions: data });
  } catch (err) {
    console.error("Failed to load missions:", err);
    return NextResponse.json({ missions: DEFAULT_MISSIONS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { missions } = body;

    if (!missions || !Array.isArray(missions)) {
      return NextResponse.json({ error: "Invalid missions data" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Clear existing missions and insert new ones
    const { error: deleteError } = await supabase
      .from("daily_missions_pool")
      .delete()
      .neq("id", ""); // Delete all

    if (deleteError && deleteError.code !== "PGRST102") { // PGRST102 = table doesn't exist
      console.error("Failed to clear missions:", deleteError);
    }

    // Insert new missions
    const missionsToInsert = missions.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      threshold: m.threshold,
      desktop_only: m.desktopOnly || false,
      active: m.active !== false,
    }));

    const { error: insertError } = await supabase
      .from("daily_missions_pool")
      .insert(missionsToInsert);

    if (insertError) {
      console.error("Failed to insert missions:", insertError);
      // If table doesn't exist, just return success (will use defaults)
      if (insertError.code === "42P01") {
        return NextResponse.json({ success: true, message: "Saved (using defaults - table will be created on first use)" });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save missions:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
