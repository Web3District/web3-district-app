import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Get completion stats per mission
    const { data, error } = await supabase
      .from("daily_mission_completions")
      .select("mission_id, developer_id")
      .gte("completed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (error || !data) {
      return NextResponse.json({ stats: {} });
    }

    // Aggregate stats
    const stats: Record<string, { completions: number; users: Set<number> }> = {};
    
    for (const row of data) {
      if (!stats[row.mission_id]) {
        stats[row.mission_id] = { completions: 0, users: new Set() };
      }
      stats[row.mission_id].completions++;
      stats[row.mission_id].users.add(row.developer_id);
    }

    // Convert to serializable format
    const serializableStats: Record<string, { completions: number; uniqueUsers: number }> = {};
    for (const [missionId, stat] of Object.entries(stats)) {
      serializableStats[missionId] = {
        completions: stat.completions,
        uniqueUsers: stat.users.size,
      };
    }

    return NextResponse.json({ stats: serializableStats });
  } catch (err) {
    console.error("Failed to load stats:", err);
    return NextResponse.json({ stats: {} });
  }
}
