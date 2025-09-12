import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Camera, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    ticketNumber: string;
    eventTitle: string;
    alreadyCheckedIn: boolean;
  };
}

interface EventScannerProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

const EventScanner = ({ eventId, eventTitle, onClose }: EventScannerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);

  useEffect(() => {
    fetchRegistrationStats();
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const fetchRegistrationStats = async () => {
    try {
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('id, checked_in')
        .eq('event_id', eventId);

      if (error) throw error;

      setTotalRegistrations(registrations?.length || 0);
      setCheckedInCount(registrations?.filter(r => r.checked_in).length || 0);
    } catch (error) {
      console.error('Error fetching registration stats:', error);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    setScanner(html5QrcodeScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      const { registrationId, ticketNumber } = qrData;

      if (!registrationId || !ticketNumber) {
        setScanResult({
          success: false,
          message: "Invalid QR code format"
        });
        return;
      }

      // Verify ticket and check-in
      const result = await verifyAndCheckIn(registrationId, ticketNumber);
      setScanResult(result);
      
      if (result.success) {
        fetchRegistrationStats(); // Refresh stats
      }

    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult({
        success: false,
        message: "Invalid QR code or processing error"
      });
    }
  };

  const onScanFailure = (error: string) => {
    // Handle scan failures silently - they happen frequently during scanning
    console.log('Scan failed:', error);
  };

  const verifyAndCheckIn = async (registrationId: string, ticketNumber: string): Promise<ScanResult> => {
    try {
      // Fetch registration details
      const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          name,
          email,
          checked_in,
          event_id,
          events!inner(title)
        `)
        .eq('id', registrationId)
        .eq('event_id', eventId)
        .single();

      if (regError || !registration) {
        return {
          success: false,
          message: "Registration not found or invalid"
        };
      }

      // Verify ticket number matches
      const { data: ticket, error: ticketError } = await supabase
        .from('digital_tickets')
        .select('ticket_number')
        .eq('registration_id', registrationId)
        .eq('ticket_number', ticketNumber)
        .single();

      if (ticketError || !ticket) {
        return {
          success: false,
          message: "Invalid ticket number"
        };
      }

      // Check if already checked in
      if (registration.checked_in) {
        return {
          success: false,
          message: "Already checked in",
          data: {
            name: registration.name,
            email: registration.email,
            ticketNumber,
            eventTitle: registration.events.title,
            alreadyCheckedIn: true
          }
        };
      }

      // Mark as checked in
      const { error: updateError } = await supabase
        .from('event_registrations')
        .update({ checked_in: true })
        .eq('id', registrationId);

      if (updateError) {
        return {
          success: false,
          message: "Failed to check in"
        };
      }

      return {
        success: true,
        message: "Successfully checked in",
        data: {
          name: registration.name,
          email: registration.email,
          ticketNumber,
          eventTitle: registration.events.title,
          alreadyCheckedIn: false
        }
      };

    } catch (error) {
      console.error('Error in verifyAndCheckIn:', error);
      return {
        success: false,
        message: "Verification failed"
      };
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Event Scanner - {eventTitle}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Checked In: {checkedInCount}/{totalRegistrations}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scanner Controls */}
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startScanning} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive">
                Stop Scanning
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              Close Scanner
            </Button>
          </div>

          {/* QR Scanner */}
          {scanning && (
            <div className="border rounded-lg overflow-hidden">
              <div id="qr-reader" className="w-full"></div>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <Card className={`border-2 ${
              scanResult.success 
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {scanResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      scanResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {scanResult.message}
                    </p>
                    {scanResult.data && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Name:</strong> {scanResult.data.name}</p>
                        <p><strong>Email:</strong> {scanResult.data.email}</p>
                        <p><strong>Ticket:</strong> {scanResult.data.ticketNumber}</p>
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

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Point the camera at the QR code on the attendee's ticket to check them in.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventScanner;