import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/sponsors
 * Returns all active landmarks with grid positions for rendering in the city.
 * Format matches SponsorConfig interface from registry.tsx
 */
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: landmarks, error } = await supabase
      .from("landmarks")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching landmarks:", error);
      return NextResponse.json({ error: "Failed to fetch landmarks" }, { status: 500 });
    }

    // Convert to SponsorConfig format
    const sponsors = (landmarks ?? []).map((landmark) => ({
      id: landmark.id,
      slug: `landmark-${landmark.id}`,
      name: landmark.name,
      tagline: landmark.description?.slice(0, 50) ?? "Sponsored Landmark",
      description: landmark.description ?? "",
      url: landmark.image_url ?? "#",
      accent: landmark.accent_color ?? "#ed0584",
      gridX: landmark.grid_x ?? 0,
      gridZ: landmark.grid_z ?? 0,
      buildingType: landmark.building_type ?? "default",
      modelUrl: landmark.model_url ?? null,
      hitboxRadius: landmark.hitbox_radius ?? 80,
      hitboxHeight: landmark.hitbox_height ?? 550,
    }));

    return NextResponse.json({ sponsors });
  } catch (error: any) {
    console.error("Error in /api/sponsors:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}
