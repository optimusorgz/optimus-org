import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Camera, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  checked_in: boolean;
  event_id: string;
  ticket_id: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    ticketId: string; // Changed from ticketNumber to ticketId
    eventTitle: string;
    alreadyCheckedIn: boolean;
  };
}

const EventCheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventTitle, setEventTitle] = useState("Event Check-In");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const { toast } = useToast();
  const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_COOLDOWN_MS = 2000; // 2 seconds cooldown
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);


  useEffect(() => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "Event ID is missing from the URL.",
        variant: "destructive",
      });
      return;
    }

    const fetchEventDetails = async () => {
        const { data, error } = await supabase
            .from("events")
            .select("title")
            .eq("id", eventId)
            .single();

        if (error) {
            console.error("Error fetching event details:", error);
            toast({
                title: "Error",
                description: "Failed to load event details.",
                variant: "destructive",
            });
            setEventTitle("Unknown Event");
        } else if (data) {
            setEventTitle(data.title);
        }
    };

    const fetchRegistrations = async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching registrations:', error);
        toast({
          title: "Error",
          description: "Failed to load registrations.",
          variant: "destructive",
        });
        return;
      }
      setRegistrations(data || []);
      setTotalRegistrations(data?.length || 0);
      setCheckedInCount(data?.filter(r => r.checked_in).length || 0);
    };

    fetchEventDetails();
    fetchRegistrations();

    // Setup Supabase real-time subscription for registrations
    const registrationSubscription = supabase
      .channel('event_check_in_channel')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'registrations', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const updatedRegistration = payload.new as Registration;
          setRegistrations(prev =>
            prev.map(reg => (reg.id === updatedRegistration.id ? updatedRegistration : reg))
          );
          setCheckedInCount(prev => (updatedRegistration.checked_in ? prev + 1 : prev - 1));
          toast({
            title: "Update",
            description: `Registration for ${updatedRegistration.name} updated.`, 
          });
        }
      )
      .subscribe();

    const setupScanner = () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(err => console.error("Failed to clear html5-qrcode-scanner", err));
      }

      qrCodeScannerRef.current = new Html5QrcodeScanner(
        "qr-code-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          disableFlip: false,
          aspectRatio: 1.0
        },
        false
      );
      qrCodeScannerRef.current.render(onScanSuccess, onScanError);
      setScanning(true);
    };

    setupScanner();

    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(err => console.error("Failed to clear html5-qrcode-scanner", err));
      }
      registrationSubscription.unsubscribe();
    };
  }, [eventId, toast]);

  const onScanSuccess = async (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) {
      console.log("Scan on cooldown, ignoring.");
      return;
    }
    lastScanTimeRef.current = now;

    console.log(`QR Code scanned: ${decodedText}`);
    let ticketId: string;
    try {
      const qrData = JSON.parse(decodedText);
      ticketId = qrData.ticketId; // Assuming QR contains { ticketId: "..." }
      if (!ticketId) {
        throw new Error("ticketId not found in QR data");
      }
    } catch (e) {
      toast({
        title: "❌ Invalid QR Code",
        description: "QR code format is incorrect. Expected JSON with 'ticketId'.",
        variant: "destructive",
      });
      return;
    }

    // Find the registration in the current list
    const registrationIndex = registrations.findIndex(reg => reg.ticket_id === ticketId && reg.event_id === eventId);

    if (registrationIndex === -1) {
      toast({
        title: "❌ Invalid Ticket",
        description: "No registration found for this ticket ID and event.",
        variant: "destructive",
      });
      setScanResult({
        success: false,
        message: "Invalid Ticket",
        data: { name: "N/A", email: "N/A", ticketId: ticketId, eventTitle: eventTitle, alreadyCheckedIn: false }
      });
      return;
    }

    const registration = registrations[registrationIndex];

    if (registration.checked_in) {
      toast({
        title: "⚠️ Ticket already used",
        description: `Ticket for ${registration.name} has already been checked in.`, 
        variant: "warning",
      });
      setScanResult({
        success: false,
        message: "Ticket already used",
        data: { name: registration.name, email: registration.email, ticketId: ticketId, eventTitle: eventTitle, alreadyCheckedIn: true }
      });
      return;
    }

    // Mark as checked-in in Supabase
    const { error } = await supabase
      .from('registrations')
      .update({ checked_in: true })
      .eq('id', registration.id);

    if (error) {
      console.error('Error updating check-in status:', error);
      toast({
        title: "Error",
        description: "Failed to update check-in status.",
        variant: "destructive",
      });
      setScanResult({
        success: false,
        message: "Error checking in ticket",
        data: { name: registration.name, email: registration.email, ticketId: ticketId, eventTitle: eventTitle, alreadyCheckedIn: false }
      });
      return;
    }

    toast({
      title: "✅ Ticket Verified",
      description: `Successfully checked in ${registration.name}.`,
    });
    setScanResult({
      success: true,
      message: "Ticket Verified",
      data: { name: registration.name, email: registration.email, ticketId: ticketId, eventTitle: eventTitle, alreadyCheckedIn: false }
    });
  };

  const onScanError = (errorMessage: string) => {
    // console.error(errorMessage);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-4xl mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Camera className="h-7 w-7" />
            Event Check-In - {eventTitle}
          </CardTitle>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Checked In: {checkedInCount}/{totalRegistrations}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div id="qr-code-reader" className="w-full flex justify-center mb-4"></div>
          {scanResult && (
            <Card className={`border-2 ${scanResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {scanResult.success ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${scanResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      {scanResult.message}
                    </p>
                    {scanResult.data && ( // Render data only if present
                        <div className="mt-2 space-y-1 text-sm">
                            <p><strong>Name:</strong> {scanResult.data.name}</p>
                            <p><strong>Email:</strong> {scanResult.data.email}</p>
                            <p><strong>Ticket:</strong> {scanResult.data.ticketId}</p>
                            {scanResult.data.alreadyCheckedIn && (
                                <Badge variant="secondary" className="mt-1">
                                    Previously Checked In
                                </Badge>
                            )}
                        </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Registrations List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A live list of event registrations.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Checked In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No registrations found for this event.</TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell>{reg.phone}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={reg.checked_in ? "default" : "secondary"}>
                        {reg.checked_in ? <CheckCircle2 className="h-4 w-4 inline-block mr-1" /> : <XCircle className="h-4 w-4 inline-block mr-1" />}
                        {reg.checked_in ? "Checked In" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCheckIn;
