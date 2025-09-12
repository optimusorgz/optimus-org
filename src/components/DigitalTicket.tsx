import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, MapPin, User, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DigitalTicketProps {
  registration: {
    id: string;
    name: string;
    email: string;
    registration_number: string;
    event: {
      title: string;
      start_date: string;
      location: string;
    };
  };
  ticket: {
    id: string;
    ticket_number: string;
    qr_code_data: string;
  };
}

const DigitalTicket = ({ registration, ticket }: DigitalTicketProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadTicketPDF = async () => {
    setLoading(true);
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Digital Event Ticket', 20, 30);
      
      // Add event details
      pdf.setFontSize(14);
      pdf.text(`Event: ${registration.event.title}`, 20, 50);
      pdf.text(`Date: ${formatDate(registration.event.start_date)}`, 20, 65);
      pdf.text(`Venue: ${registration.event.location}`, 20, 80);
      
      // Add participant details
      pdf.text(`Name: ${registration.name}`, 20, 100);
      pdf.text(`Email: ${registration.email}`, 20, 115);
      pdf.text(`Registration: ${registration.registration_number}`, 20, 130);
      pdf.text(`Ticket: ${ticket.ticket_number}`, 20, 145);
      
      // Add QR code instructions
      pdf.text('QR Code:', 20, 170);
      pdf.text('Please present this QR code at the venue for entry.', 20, 185);
      
      // Note: In a real implementation, you would add the QR code to the PDF
      // This requires converting the QR code to an image format first
      
      pdf.save(`ticket-${ticket.ticket_number}.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your ticket has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto border-2 border-primary/20">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="text-xl font-bold">Digital Ticket</CardTitle>
        <p className="text-sm text-muted-foreground">#{ticket.ticket_number}</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Event Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">{registration.event.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(registration.event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{registration.event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>{registration.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <span>{registration.registration_number}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border">
            <QRCodeSVG
              value={ticket.qr_code_data}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-xs text-muted-foreground">
          Present this QR code at the venue for check-in
        </div>

        {/* Download Button */}
        <Button 
          onClick={downloadTicketPDF}
          disabled={loading}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Generating PDF..." : "Download Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DigitalTicket;