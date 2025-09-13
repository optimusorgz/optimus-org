import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Clock,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ScannerDashboardProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    ticketCode: string;
    checkedInAt?: string;
  };
}

interface CheckInRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  ticket_code: string;
  checked_in_at: string;
}

const ScannerDashboard: React.FC<ScannerDashboardProps> = ({
  eventId,
  eventTitle,
  onClose
}) => {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_COOLDOWN_MS = 2000; // 2 seconds cooldown

  useEffect(() => {
    fetchRegistrationStats();
    fetchCheckInRecords();
    setupScanner();

    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, [eventId]);

  const setupScanner = () => {
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.clear().catch(console.error);
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

  const fetchRegistrationStats = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, checked_in')
        .eq('event_id', eventId);

      if (error) throw error;

      setTotalRegistrations(data?.length || 0);
      setCheckedInCount(data?.filter(r => r.checked_in).length || 0);
    } catch (error) {
      console.error('Error fetching registration stats:', error);
    }
  };

  const fetchCheckInRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, name, email, phone, ticket_code, checked_in_at')
        .eq('event_id', eventId)
        .eq('checked_in', true)
        .order('checked_in_at', { ascending: false });

      if (error) throw error;
      setCheckInRecords(data || []);
    } catch (error) {
      console.error('Error fetching check-in records:', error);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) {
      return; // Ignore rapid scans
    }
    lastScanTimeRef.current = now;

    try {
      let ticketCode: string;
      
      // Try to parse as JSON first (for QR codes with structured data)
      try {
        const qrData = JSON.parse(decodedText);
        ticketCode = qrData.ticketCode || qrData.ticket_code || qrData.registrationId;
      } catch {
        // If not JSON, treat as plain ticket code
        ticketCode = decodedText;
      }

      if (!ticketCode) {
        setScanResult({
          success: false,
          message: "Invalid QR code format",
        });
        return;
      }

      // Call Supabase function to check in attendee
      const { data, error } = await supabase.rpc('check_in_attendee', {
        ticket_code_param: ticketCode
      });

      if (error) throw error;

      setScanResult({
        success: data.success,
        message: data.message,
        data: data.data ? {
          name: data.data.name,
          email: data.data.email,
          ticketCode: ticketCode,
          checkedInAt: data.data.checked_in_at
        } : undefined
      });

      if (data.success) {
        // Refresh stats and records
        fetchRegistrationStats();
        fetchCheckInRecords();
        
        toast({
          title: "✅ Check-in successful",
          description: `${data.data.name} has been checked in.`,
        });
      } else {
        toast({
          title: data.message.includes('Already') ? "⚠️ Already checked in" : "❌ Invalid ticket",
          description: data.message,
          variant: data.message.includes('Already') ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult({
        success: false,
        message: "Error processing ticket",
      });
      toast({
        title: "Error",
        description: "Failed to process ticket scan.",
        variant: "destructive",
      });
    }
  };

  const onScanError = (errorMessage: string) => {
    // Silently handle scan errors to avoid spam
    console.debug('QR scan error:', errorMessage);
  };

  const downloadCheckInReport = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('name, email, phone, checked_in, checked_in_at, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const reportData = data?.map(record => ({
        Name: record.name,
        Email: record.email,
        Phone: record.phone || 'N/A',
        'Registration Date': new Date(record.created_at).toLocaleDateString(),
        'Check-in Status': record.checked_in ? 'Checked In' : 'Not Checked In',
        'Check-in Time': record.checked_in_at 
          ? new Date(record.checked_in_at).toLocaleString()
          : 'N/A'
      })) || [];

      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Check-in Report');
      XLSX.writeFile(workbook, `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_checkin_report.xlsx`);

      toast({
        title: "Download complete",
        description: "Check-in report downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download failed",
        description: "Failed to download check-in report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registered</p>
                <p className="text-2xl font-bold">{totalRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{totalRegistrations - checkedInCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="qr-code-reader" className="w-full max-w-md mx-auto"></div>
          
          {scanResult && (
            <Alert className={`mt-4 ${scanResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2">
                {scanResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>{scanResult.message}</strong>
                  {scanResult.data && (
                    <div className="mt-2 text-sm">
                      <p>Name: {scanResult.data.name}</p>
                      <p>Email: {scanResult.data.email}</p>
                      {scanResult.data.checkedInAt && (
                        <p>Checked in at: {new Date(scanResult.data.checkedInAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Check-ins</CardTitle>
          <Button onClick={downloadCheckInReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </CardHeader>
        <CardContent>
          {checkInRecords.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No check-ins yet. Start scanning tickets!
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {checkInRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-muted-foreground">{record.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      Checked In
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(record.checked_in_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScannerDashboard;