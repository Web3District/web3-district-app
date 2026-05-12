import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/admin/landmarks
 * Create or update a landmark with grid position
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubLogin = session.user.user_metadata?.user_name ?? 
                        session.user.user_metadata?.full_name ?? 
                        session.user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(githubLogin.toLowerCase())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      grid_x,
      grid_z,
      building_type,
      accent_color,
      model_url,
      hitbox_radius,
      hitbox_height,
      active,
    } = body;

    // Validate grid position
    if (typeof grid_x !== "number" || typeof grid_z !== "number") {
      return NextResponse.json({ error: "Grid position (grid_x, grid_z) is required" }, { status: 400 });
    }

    if (id) {
      // Update existing landmark
      const { data, error } = await supabase
        .from("landmarks")
        .update({
          name,
          description,
          grid_x,
          grid_z,
          building_type: building_type ?? "default",
          accent_color: accent_color ?? "#ed0584",
          model_url: model_url ?? null,
          hitbox_radius: hitbox_radius ?? 80,
          hitbox_height: hitbox_height ?? 550,
          active: active ?? true,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ landmark: data, message: "Landmark updated" });
    } else {
      // Create new landmark
      const { data, error } = await supabase
        .from("landmarks")
        .insert({
          name,
          description,
          grid_x,
          grid_z,
          building_type: building_type ?? "default",
          accent_color: accent_color ?? "#ed0584",
          model_url: model_url ?? null,
          hitbox_radius: hitbox_radius ?? 80,
          hitbox_height: hitbox_height ?? 550,
          active: active ?? true,
          lat: 0, // Keep for backward compat
          lng: 0, // Keep for backward compat
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ landmark: data, message: "Landmark created" }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error in /api/admin/landmarks:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/landmarks?id=<id>
 * Delete a landmark
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubLogin = session.user.user_metadata?.user_name ?? 
                        session.user.user_metadata?.full_name ?? 
                        session.user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(githubLogin.toLowerCase())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Landmark ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("landmarks").delete().eq("id", parseInt(id));

    if (error) throw error;
    return NextResponse.json({ message: "Landmark deleted" });
  } catch (error: any) {
    console.error("Error in /api/admin/landmarks DELETE:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}
