import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DigitalTicket from './DigitalTicket';
import { useToast } from '@/hooks/use-toast';

interface MyEventsTicketProps {
  eventId: string;
  userId: string;
  eventTitle: string;
  registrationId?: string; // Add this prop
  isOpen: boolean; // Add this prop
  onClose: () => void; // Add this prop
}

const MyEventsTicket = ({ eventId, userId, eventTitle, registrationId, isOpen, onClose }: MyEventsTicketProps) => {
  const { toast } = useToast();
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTicket();
    }
  }, [isOpen]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('digital_tickets')
        .select(`
          *,
          registration:event_registrations(
            id,
            name,
            email,
            registration_number,
            event:events(
              title,
              start_date,
              location
            )
          )
        `)
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (ticketError) {
        if (ticketError.code === 'PGRST116') {
          toast({
            title: "No Ticket Found",
            description: "You don't have a ticket for this event yet.",
            variant: "destructive",
          });
          onClose(); // Close modal if no ticket
          return;
        }
        throw ticketError;
      }

      setTicketData(ticketData);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Failed to load your ticket.",
        variant: "destructive",
      });
      onClose(); // Close modal on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Ticket...</DialogTitle>
          </DialogHeader>
          <p>Please wait while we fetch your ticket details.</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticketData) {
    return null; // Or some fallback UI, but since we close on no ticket, this might not be reached
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Your Digital Ticket</DialogTitle>
        </DialogHeader>
        <DigitalTicket
          registration={ticketData.registration}
          ticket={ticketData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MyEventsTicket;