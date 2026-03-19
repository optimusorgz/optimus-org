import { NextResponse } from "next/server";
import supabaseAdmin from "@/api/admin";

export async function POST(req: Request) {  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { ticket_uid, event_id } = body;

  console.log("📥 Incoming:", body);

  if (!ticket_uid || !event_id) {
    return NextResponse.json(
      { message: "Missing fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("event_registrations")
    .select("*")
    .eq("event_id", event_id)
    .single();

  if (!data && error) {
    return NextResponse.json(
      { message: "Invalid Ticket" },
      { status: 404 }
    );
  }

  if (data.check_in === "checked_in") {
    return NextResponse.json({
      message: "Already Checked In",
    });
  }

  const { error: updateError } = await supabaseAdmin
    .from("event_registrations")
    .update({
      check_in: "checked_in",
      check_in_time: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Check-in successful for ${
      data.form_data?.["Team lead name"] || "Participant"
    }`,
  });
}