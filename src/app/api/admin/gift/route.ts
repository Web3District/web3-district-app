import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/admin/gift
 * Send a shop item as a free gift to any user
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }
    
    const accessToken = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify admin session
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 });
    }

    const githubLogin = user.user_metadata?.user_name ?? 
                        user.user_metadata?.full_name ?? 
                        user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(githubLogin.toLowerCase())) {
      return NextResponse.json({ error: `Admin access required - Your login: ${githubLogin}` }, { status: 403 });
    }

    const body = await request.json();
    const { recipient_username, item_id, message } = body;

    // Validate inputs
    if (!recipient_username || !item_id) {
      return NextResponse.json({ error: "Recipient username and item ID required" }, { status: 400 });
    }

    // Find recipient by login
    const { data: recipient, error: recipientError } = await supabase
      .from("developers")
      .select("id, login, email")
      .eq("login", recipient_username)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json({ error: `User "${recipient_username}" not found` }, { status: 404 });
    }

    const recipientLogin = recipient.login;

    // Verify item exists and is active
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, name, price_usd_cents, is_active")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: `Item "${item_id}" not found` }, { status: 404 });
    }

    if (!item.is_active) {
      return NextResponse.json({ error: `Item "${item.name}" is not active` }, { status: 400 });
    }

    // Check if user already owns this item
    const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("developer_id", recipient.id)
      .eq("item_id", item_id)
      .eq("status", "completed")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ 
        error: `User already owns "${item.name}"`,
        already_owned: true 
      }, { status: 409 });
    }

    // Create free gift purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        developer_id: recipient.id,
        item_id: item_id,
        provider: "free",
        provider_tx_id: `admin-gift-${Date.now()}`,
        amount_cents: 0,
        currency: "usd",
        status: "completed",
        gifted_by: user.id, // Admin who sent the gift
        message: message || null,
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    return NextResponse.json({ 
      success: true,
      message: `Gift sent successfully!`,
      purchase,
      recipient: {
        username: recipientLogin,
        id: recipient.id,
      },
      item: {
        name: item.name,
        id: item.id,
      }
    });

  } catch (error: any) {
    console.error("Error in /api/admin/gift:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/gift
 * List recent gifts sent by admin
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

    // Get recent gifts
    const { data: gifts, error } = await supabase
      .from("purchases")
      .select(`
        id,
        item_id,
        developer_id,
        created_at,
        message,
        items ( name ),
        developers ( login )
      `)
      .eq("provider", "free")
      .not("gifted_by", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Map developers.login to username for frontend
    const mappedGifts = gifts?.map(g => ({
      ...g,
      developers: { username: (g.developers as any)?.login }
    })) ?? [];
    
    return NextResponse.json({ gifts: mappedGifts });

  } catch (error: any) {
    console.error("Error in /api/admin/gift GET:", error);
    return NextResponse.json({ error: error.message ?? "Internal server error" }, { status: 500 });
  }
}
