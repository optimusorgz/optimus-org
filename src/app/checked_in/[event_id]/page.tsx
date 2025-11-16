"use client";

import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useParams } from "next/navigation";
import supabase from "@/api/client";
import { CheckCircle, XCircle } from "lucide-react";

interface Registration {
  id: string;
  event_id: string;
  ticket_uid: string;
  check_in: string | null;
  check_in_time: string | null;
  form_data: Record<string, any>;
}

export default function EventScannerPage() {
  const { event_id } = useParams() as { event_id: string };

  const [ticket, setTicket] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!event_id) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(handleScanSuccess, handleScanError);

    function handleScanSuccess(decodedText: string) {
      scanner.clear();
      handleTicketScan(decodedText);
    }

    function handleScanError(err: any) {
      console.warn("QR Scan Error:", err);
    }
  }, [event_id]);

  // ----------------- MAIN CHECK-IN LOGIC -----------------
  const handleTicketScan = async (ticketUid: string) => {
    setTicket(ticketUid);
    setStatus("");
    setMessage("");

    // 1️⃣ Fetch registration **for this event only**
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("ticket_uid", ticketUid)
      .eq("event_id", event_id) // <-- important
      .single();

    const registration = data as Registration | null;

    if (error || !registration) {
      setStatus("error");
      setMessage("❌ Invalid ticket for this event.");
      return;
    }

    // 2️⃣ Check if already checked in
    if (registration.check_in === "checked_in") {
      setStatus("error");
      setMessage("⚠️ Ticket already checked-in.");
      return;
    }

    // 3️⃣ Update check-in
    const { error: updateError } = await supabase
      .from("event_registrations")
      .update({
        check_in: "checked_in",
        check_in_time: new Date().toISOString(),
      })
      .eq("id", registration.id);

    if (updateError) {
      setStatus("error");
      setMessage("❌ Something went wrong. Try again.");
      return;
    }

    setStatus("success");
    setMessage(
      `✔️ Check-in successful for ${registration.form_data["Team lead name"] || "Participant"
      }`
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-green-400 mb-2">
        Event Check-In Scanner
      </h1>
      <p className="text-gray-300 mb-6 text-sm">
        Event ID: <span className="text-green-400">{event_id}</span>
      </p>

      {/* QR Scanner */}
      <div
        id="qr-reader"
        className="w-full max-w-sm bg-gray-800 p-4 rounded-xl shadow-md"
      ></div>

      {/* Ticket Output */}
      {ticket && (
        <div className="mt-6 w-full max-w-sm bg-gray-800 p-5 rounded-xl shadow-md">

          <p className="text-xs text-gray-400">Scanned Ticket UID:</p>

          <p className="text-green-400 font-mono break-all text-sm">
            {ticket}
          </p>

          {/* STATUS MESSAGES */}
          {status === "success" && (
            <div className="mt-4 flex items-center text-green-400 gap-2">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 flex items-center text-red-400 gap-2">
              <XCircle className="w-6 h-6" />
              <span className="font-medium">{message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
