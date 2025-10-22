import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share,
  Phone,
  Mail,
  Check,
  Info,
  User,
  Tag,
  Activity,
  ExternalLink,
  Building,
  ArrowLeft,
  Ticket,
} from "lucide-react";
import MyEventsTicket from "@/components/MyEventsTicket";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  registration_link: string | null;
  max_participants: number | null;
  ticket_price: number | null;
  banner_url: string | null;
  created_by: string | null;
  created_at: string;
  organization_id: string | null;
  status: string;
  questions?: string[];
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // Use the useAuth hook to get user information
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      const { data: eventData, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          category,
          start_date,
          end_date,
          location,
          organizer_name,
          contact_email,
          contact_phone,
          registration_link,
          max_participants,
          ticket_price,
          banner_url,
          created_by,
          created_at,
          organization_id,
          status,
          questions
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!eventData) {
        navigate("/events");
        toast({
          title: "Event not found",
          description: "The event you're looking for doesn't exist.",
          variant: "destructive",
        });
        return;
      }

      // Check if event is accessible (approved or user's own event)
      if (eventData.status !== "approved" && eventData.created_by !== user?.id) {
        toast({
          title: "Event not available",
          description: "This event is not currently available for public viewing.",
          variant: "destructive",
        });
        navigate("/events");
        return;
      }

      console.log("Fetched event details:", eventData);
      setEvent(eventData as Event);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      });
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    if (!user || !id) return;
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching registration status:", error);
        throw error;
      }

      if (data) {
        setIsRegistered(true);
        setRegistrationData(data);
      } else {
        setIsRegistered(false);
        setRegistrationData(null);
      }
    } catch (error) {
      console.error("Error fetching registration status:", error);
      // Don't show error toast for registration status check
      setIsRegistered(false);
      setRegistrationData(null);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Share failed",
        description: "Unable to share the event link.",
        variant: "destructive",
      });
    }
  };

  const handleRegisterClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to register for the event.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setShowRegistrationModal(true);
  };

  const handleViewTicket = () => {
    setShowTicketModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch {
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  const getEventStatus = () => {
    if (!event) return { status: "Unknown", color: "gray" };
    
    const now = new Date();
    const eventDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (event.status !== "approved") {
      return { status: "Not Approved", color: "yellow" };
    }
    
    if (now > endDate) {
      return { status: "Event Ended", color: "gray" };
    } else if (now >= eventDate && now <= endDate) {
      return { status: "Live Now", color: "red" };
    } else {
      return { status: "Upcoming", color: "green" };
    }
  };

  const getDuration = () => {
    if (!event) return "";
    
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffHours / 24);
    
    if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      if (user) {
        fetchRegistrationStatus();
      }
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-foreground text-xl mb-4">Event not found</div>
        <Button onClick={() => navigate("/events")} variant="outline">
          Back to Events
        </Button>
      </div>
    );
  }

  const { date, time } = formatDate(event.start_date);
  const endDate = formatDate(event.end_date);
  const eventStatus = getEventStatus();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Banner Background */}
      <motion.div 
        className="relative overflow-hidden"
        style={{
          backgroundImage: event.banner_url 
            ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${event.banner_url})`
            : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-foreground)))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Blur overlay for better text readability */}
        {event.banner_url && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-6 backdrop-blur-sm bg-black/20"
            onClick={() => navigate("/events")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-sm text-white font-medium">
                  {date}
                </div>
                <Badge 
                  className={`${eventStatus.color === 'green' ? 'bg-green-500/20 text-green-200 border-green-400' : 
                    eventStatus.color === 'red' ? 'bg-red-500/20 text-red-200 border-red-400' :
                    eventStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400' :
                    'bg-gray-500/20 text-gray-200 border-gray-400'} backdrop-blur-sm`}
                >
                  {eventStatus.status}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                {event.title}
              </h1>
              
              <div className="space-y-3 text-lg text-white">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 flex-shrink-0 drop-shadow" />
                  <span className="drop-shadow">{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-3 flex-shrink-0 drop-shadow" />
                  <span className="drop-shadow">Organized by {event.organizer_name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 flex-shrink-0 drop-shadow" />
                  <span className="drop-shadow">{time} - {endDate.time} ({getDuration()})</span>
                </div>
              </div>
            </div>
            
            {/* Registration Card */}
            <Card className="bg-white text-gray-900 w-full lg:w-80 shadow-2xl">
              <CardHeader className="text-center">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Registration</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {eventStatus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    {event.ticket_price && event.ticket_price > 0 ? "Ticket Price" : "Entry"}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {event.ticket_price && event.ticket_price > 0 
                      ? `₹${event.ticket_price}` 
                      : "FREE"
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.max_participants 
                      ? `Limited to ${event.max_participants} participants` 
                      : "Full access pass"
                    }
                  </div>
                </div>
                
                {isRegistered ? (
                  <div className="space-y-2">
                    <p className="text-center text-green-500 font-semibold">You are registered!</p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-primary-foreground py-3 text-lg font-semibold"
                      onClick={handleViewTicket}
                    >
                      <Ticket className="h-5 w-5 mr-2" />
                      View Ticket
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-semibold"
                    onClick={handleRegisterClick}
                    disabled={eventStatus.status === "Event Ended"}
                  >
                    Register for Event
                  </Button>
                )}
                
                {/* {event.registration_link && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(event.registration_link!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    
                  </Button>
                )}
                 */}
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-200 hover:bg-gray-50"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Event Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold text-foreground">Event Details</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Venue</div>
                      <div className="text-foreground font-medium">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="text-foreground font-medium capitalize">{event.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Organized by</div>
                      <div className="text-foreground font-medium">{event.organizer_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Event Type</div>
                      <div className="text-foreground font-medium">
                        {event.ticket_price && event.ticket_price > 0 ? "PAID" : "FREE"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="text-foreground font-medium">{getDuration()}</div>
                    </div>
                  </div>
                  {event.max_participants && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">Max Participants</div>
                        <div className="text-foreground font-medium">{event.max_participants}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Event Timeline */}
                <div className="border-t border-border pt-4">
                  <div className="text-foreground font-medium mb-3">Event Timeline</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="text-foreground">{date} at {time}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="text-foreground">{endDate.date} at {endDate.time}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About the Event */}
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-primary/20">
                <h2 className="text-xl font-bold text-foreground">About the Event</h2>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event Benefits */}
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-green-500/20">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <h2 className="text-xl font-bold text-foreground">Why Attend?</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-foreground font-medium">Expert Knowledge</div>
                    <div className="text-muted-foreground text-sm">
                      Learn from industry experts and gain valuable insights in {event.category}.
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-foreground font-medium">Networking Opportunities</div>
                    <div className="text-muted-foreground text-sm">
                      Connect with like-minded professionals and expand your network.
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-foreground font-medium">Practical Skills</div>
                    <div className="text-muted-foreground text-sm">
                      Gain hands-on experience and practical skills you can apply immediately.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-primary/20">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {event.contact_email}
                    </a>
                  </div>
                </div>
                {event.contact_phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <a
                        href={`tel:${event.contact_phone}`}
                        className="text-foreground font-medium hover:text-primary transition-colors"
                      >
                        {event.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Organizer</div>
                    <div className="text-foreground font-medium">{event.organizer_name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-primary/20">
                <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleRegisterClick}
                  disabled={eventStatus.status === "Event Ended"}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Register for Event
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share with Friends
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${event.contact_email}?subject=Question about ${event.title}`, "_blank")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Ask a Question
                </Button>
                {event.contact_phone && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`tel:${event.contact_phone}`, "_blank")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Organizer
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-primary/20">
                <h2 className="text-xl font-bold text-foreground">Event Information</h2>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {event.ticket_price && event.ticket_price > 0 ? `₹${event.ticket_price}` : "FREE"}
                    </div>
                    <div className="text-sm text-muted-foreground">Entry Fee</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {event.max_participants || "∞"}
                    </div>
                    <div className="text-sm text-muted-foreground">Max Participants</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary capitalize">
                      {event.category}
                    </div>
                    <div className="text-sm text-muted-foreground">Category</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {getDuration()}
                    </div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventPrice={event.ticket_price || 0}
        customQuestions={event.questions || []}
      />

      {isRegistered && registrationData && (
        <MyEventsTicket
          eventId={event.id}
          userId={user?.id || ""}
          eventTitle={event.title}
          registrationId={registrationData.id}
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
};

export default EventDetail;