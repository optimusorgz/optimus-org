import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ScannerDashboard from '@/components/events/ScannerDashboard';

const ScannerDashboardPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user && eventId) {
      checkAccess();
    }
  }, [user, eventId]);

  const checkAccess = async () => {
    if (!user || !eventId) return;

    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title, created_by')
        .eq('id', eventId)
        .single();

      if (eventError) {
        toast({
          title: "Event not found",
          description: "The event you're trying to scan for doesn't exist.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setEvent(eventData);

      // Check if user has access (event creator or admin/organiser)
      const isEventCreator = eventData.created_by === user.id;
      const isAdmin = userRole === 'admin' || userRole === 'organiser';

      if (!isEventCreator && !isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to scan tickets for this event.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setHasAccess(true);
    } catch (error) {
      console.error('Error checking access:', error);
      toast({
        title: "Error",
        description: "Failed to verify access permissions.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading scanner...</div>
      </div>
    );
  }

  if (!hasAccess || !event) {
    return (
      <div className="min-h-screen pt-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this scanner.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scanner Dashboard</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>

        {/* Scanner Component */}
        <ScannerDashboard
          eventId={eventId!}
          eventTitle={event.title}
          onClose={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default ScannerDashboardPage;