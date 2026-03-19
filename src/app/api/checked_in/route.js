import { NextResponse } from "next/server";
import supabaseAdmin from "@/api/client";

export async function POST(req) {
  const { ticket_uid, event_id, token } = await req.json();

  // 🔐 1. Validate scanner access
  const { data: access } = await supabaseAdmin
    .from("scanner_access")
    .select("*")
    .eq("token", token)
    .single();

  if (!access || new Date(access.expires_at) < new Date()) {
    return NextResponse.json(
      { message: "Access Denied / Link Expired" },
      { status: 403 }
    );
  }

  // 🎫 2. Find registration
  const { data, error } = await supabaseAdmin
    .from("event_registrations")
    .select("*")
    .eq("ticket_uid", ticket_uid)
    .eq("event_id", event_id)
    .single();

  if (!data) {
    return NextResponse.json(
      { message: "Invalid Ticket" },
      { status: 404 }
    );
  }

  // ⚠️ 3. Already checked
  if (data.check_in === "checked_in") {
    return NextResponse.json({
      message: "Already Checked In",
    });
  }

  // ✅ 4. Update
  await supabaseAdmin
    .from("event_registrations")
    .update({
      check_in: "checked_in",
      check_in_time: new Date().toISOString(),
    })
    .eq("id", data.id);

  return NextResponse.json({
    message: `Check-in successful for ${
      data.form_data?.["Team lead name"] || "Participant"
    }`,
  });
}