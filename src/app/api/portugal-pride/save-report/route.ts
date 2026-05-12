import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/portugal-pride/save-report
 * Receives completed conversation data from RetellAI webhook
 * Saves pinkwashing report to database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      conversation_id,
      transcript,
      organization_name,
      description,
      location_date,
      evidence,
      pinkwashing_indicators,
      contact_preference,
      contact_value,
      anonymity,
      consent,
      timestamp,
      user_email,
    } = body;

    // Validate required fields
    if (!organization_name || !description || !consent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate report ID
    const reportId = `PPR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert report into database
    const { data, error } = await supabase
      .from("pinkwashing_reports")
      .insert({
        report_id: reportId,
        conversation_id: conversation_id ?? null,
        organization_name: organization_name.trim(),
        description: description.trim(),
        location_date: location_date ?? null,
        evidence: evidence ?? null,
        pinkwashing_indicators: pinkwashing_indicators ?? null,
        contact_preference: contact_preference ?? null,
        contact_value: contact_value ?? null,
        anonymity_preference: anonymity ?? "no",
        consent_given: consent ?? false,
        user_email: user_email ?? null,
        status: "received", // received, analyzing, human_review, contact_sent, resolved, archived
        risk_level: null, // AI will classify: 0, 1, 2, 3, 4
        created_at: timestamp ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Optional: Send notification to Portugal Pride team
    // await notifyTeam(data);

    return NextResponse.json({
      success: true,
      report_id: reportId,
      message: "Reporte guardado com sucesso",
    });
  } catch (error: any) {
    console.error("Error saving pinkwashing report:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
