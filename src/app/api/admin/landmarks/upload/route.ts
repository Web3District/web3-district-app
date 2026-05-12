import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/admin/landmarks/upload
 * Upload a GLB model file to Supabase Storage
 * Returns the public URL for use in landmark creation
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["model/gltf-binary", "application/octet-stream"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    
    if (fileExtension !== "glb" && !validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload a .glb file" 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB" 
      }, { status: 400 });
    }

    // Create storage bucket if not exists (landmarks-models)
    // Note: You need to create this bucket manually in Supabase dashboard first
    // Or run: supabase storage bucket create landmarks-models --public

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `landmark-${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("landmarks-models")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "model/gltf-binary",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      
      // Check if bucket doesn't exist
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json({ 
          error: "Storage bucket 'landmarks-models' not found. Please create it in Supabase dashboard first.",
          instructions: "Go to Supabase Dashboard → Storage → Create bucket 'landmarks-models' (public)"
        }, { status: 500 });
      }
      
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("landmarks-models")
      .getPublicUrl(filename);

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/landmarks/upload:", error);
    return NextResponse.json({ error: error.message ?? "Upload failed" }, { status: 500 });
  }
}
