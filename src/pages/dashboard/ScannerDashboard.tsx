import React, { useState } from "react";
import QrReader from "react-qr-reader-es6"; // ✅ works with React 18
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ScannerDashboardProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

const ScannerDashboard: React.FC<ScannerDashboardProps> = ({
  eventId,
  eventTitle,
  onClose,
}) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(true);

  const handleScan = async (scannedData: string | null) => {
  if (!scannedData) return;

  try {
    // scannedData now = ticket_number (short string)
    const ticketNumber = scannedData.trim();

    const { data: ticket, error } = await supabase
      .from("digital_tickets")
      .select("id, user_id, event_id, ticket_number, checked_in")
      .eq("ticket_number", ticketNumber)
      .single();

    if (error || !ticket) {
      toast({ title: "Invalid Ticket", variant: "destructive" });
      return;
    }

    if (ticket.event_id !== eventId) {
      toast({ title: "Wrong Event", variant: "destructive" });
      return;
    }

    if (ticket.checked_in) {
      toast({ title: "Already Checked In", variant: "destructive" });
      return;
    }

    // Mark as checked in
    await supabase
      .from("digital_tickets")
      .update({ checked_in: true })
      .eq("id", ticket.id);

    toast({
      title: "Check-in Successful 🎉",
      description: `Ticket: ${ticket.ticket_number}`,
    });
  } catch (err) {
    console.error("Scan error:", err);
    toast({ title: "Scan Error", variant: "destructive" });
  }
};


  const handleError = (err: any) => {
    console.error("QR Reader Error:", err);
    toast({
      title: "Camera Error",
      description: err.message,
      variant: "destructive",
    });
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">
        Scan Tickets for {eventTitle}
      </h2>

      {scanning ? (
        <QrReader
          delay={300}
          onScan={handleScan}
          onError={handleError}
          style={{ width: "100%" }}
        />
      ) : (
        <p className="text-muted-foreground">Scanner Paused</p>
      )}

      <div className="flex gap-2 mt-4">
        <Button onClick={() => setScanning(!scanning)}>
          {scanning ? "Pause Scanner" : "Resume Scanner"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ScannerDashboard;
