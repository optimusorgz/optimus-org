import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Activity, CheckCircle, Edit3, Eye, Ticket } from 'lucide-react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileCard from '@/components/ProfileCard';
import MyEventsTicket from '@/components/MyEventsTicket';
import RegisterOrganizationModal from '@/components/RegisterOrganizationModal';

interface UserProfile {
  name: string;
  role: string;
  location?: string;
  phone_number?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_name: string;
  max_participants: number;
  ticket_price: number;
  status: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  event: {
    title: string;
    start_date: string;
    location: string;
  } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<{
    eventId: string;
    eventTitle: string;
    registrationId?: string;
  } | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [userOrganization, setUserOrganization] = useState<any>(null);
  const [stats, setStats] = useState({
    eventsParticipated: 0,
    totalEventsParticipated: 0,
    activeEventsOrganised: 0,
    completedEventsParticipated: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserEvents();
      fetchRegisteredEvents();
      fetchStats();
      fetchUserOrganization();
    }
  }, [user]);

  const fetchUserOrganization = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching organization:', error);
        return;
      }

      setUserOrganization(data);
    } catch (error) {
      console.error('Error in fetchUserOrganization:', error);
    }
  };

  const handleCreateEventClick = () => {
    if (!userOrganization) {
      toast({
        title: "Organization Required",
        description: "You need to register an organization before creating events.",
        variant: "destructive",
      });
      setShowOrgModal(true);
      return;
    }

    if (userOrganization.status === 'pending') {
      toast({
        title: "Organization Pending",
        description: "Your organization is pending approval. Please wait for admin approval.",
        variant: "destructive",
      });
      return;
    }

    if (userOrganization.status === 'rejected') {
      toast({
        title: "Organization Rejected",
        description: "Your organization was rejected. Please contact admin for more information.",
        variant: "destructive",
      });
      return;
    }

    navigate('/create-event');
  };

  const handleRegisterOrganization = async (orgData: {
    name: string;
    description: string;
    website: string;
    contact_email: string;
    phone_number: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          description: orgData.description,
          owner_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setUserOrganization(data);
      setShowOrgModal(false);
      toast({
        title: "Success",
        description: "Organization registered successfully! Awaiting approval.",
      });
    } catch (error) {
      console.error('Error registering organization:', error);
      
      if (error.code === '23505' || error.message?.includes('organizations_name_unique')) {
        toast({
          title: "Organization Name Taken",
          description: "An organization with this name already exists. Please choose a different name.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to register organization.",
          variant: "destructive",
        });
      }
    }
  };
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserEvents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load your events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          created_at,
          name,
          email,
          phone,
          events!inner(title, start_date, location)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        event: Array.isArray(item.events) ? item.events[0] : item.events
      })) || [];
      
      setRegisteredEvents(transformedData);
    } catch (error) {
      console.error("Error fetching registered events:", error);
      toast({
        title: "Error",
        description: "Failed to load registered events.",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Events participated (registered for)
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("id, event_id, events!inner(start_date, end_date)")
        .eq("user_id", user.id);

      // Events organised by user
      const { data: organisedEvents } = await supabase
        .from("events")
        .select("id, start_date, end_date, status")
        .eq("created_by", user.id);

      const totalEventsParticipated = registrations?.length || 0;
      const completedEventsParticipated = registrations?.filter(reg => {
        const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
        return event && new Date(event.end_date) < new Date();
      }).length || 0;
      const activeEventsOrganised = organisedEvents?.filter(event =>
        event.status === 'approved' && new Date(event.start_date) > new Date()
      ).length || 0;

      setStats({
        eventsParticipated: totalEventsParticipated,
        totalEventsParticipated,
        activeEventsOrganised,
        completedEventsParticipated,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateProfile = async (updatedData: { name: string; avatar_url: string | null }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedData.name,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, name: updatedData.name } : null);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Workshop": "bg-primary/20 text-primary",
      "Tech Talk": "bg-success/20 text-success",
      "Hackathon": "bg-warning/20 text-warning",
      "Bootcamp": "bg-danger/20 text-danger",
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
         
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-glow mb-2">
                Dashboard Overview
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                Track your events and community impact.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
              <Button onClick={handleCreateEventClick} className="btn-hero w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>

              {(profile?.role === 'organiser' || profile?.role === 'admin') && (
                <Button
                  onClick={() => navigate('/admin-dashboard')}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>

           {/* Profile Card */}
          <ProfileCard 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />

          {/* Organization Status Card */}
          {userOrganization && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Organization Status</h3>
                    <p className="text-muted-foreground">{userOrganization.name}</p>
                  </div>
                  <Badge 
                    variant={
                      userOrganization.status === 'approved' ? 'default' : 
                      userOrganization.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {userOrganization.status}
                  </Badge>
                </div>
                {userOrganization.status === 'pending' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Your organization is pending approval. You'll be able to create events once approved.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-8">
            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Events Participated</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.eventsParticipated}</p>
                  </div>
                  <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Total Events</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.totalEventsParticipated}</p>
                  </div>
                  <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Active Events Organised</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.activeEventsOrganised}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Completed Events</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.completedEventsParticipated}</p>
                  </div>
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Registered Events Section */}
          <Card className="card-modern px-0 md:px-4">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">My Registered Events</CardTitle>
            </CardHeader>
            <CardContent>
              {registeredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't registered for any events yet.</p>
                  <Button onClick={() => navigate('/events')} className="mt-4 btn-hero">
                    Explore Events
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto px-4 md:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-0 md:p-1 font-medium">Event</th>
                        <th className="text-left p-0 md:p-1 font-medium">Date</th>
                        <th className="text-left p-0 md:p-1 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredEvents.map((event) => (
                        <tr key={event.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                          <td className="p-2 md:p-1">
                            <div>
                              <p className="font-medium text-sm md:text-base">{event.event?.title || 'Unknown Event'}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">{event.event?.location}</p>
                            </div>
                          </td>
                          <td className="p-2 md:p-3 text-xs md:text-sm text-muted-foreground">
                            {event.event?.start_date ? formatDate(event.event.start_date) : 'N/A'}
                          </td>
                          <td className="p-2 md:p-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTicketEvent({
                                  eventId: event.event_id,
                                  eventTitle: event.event?.title || 'Unknown Event',
                                  registrationId: event.id
                                })}
                              >
                                <Ticket className="h-4 w-4 mr-1" />
                                Ticket
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Events Section */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">My Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't created any events yet.</p>
                  <Button onClick={handleCreateEventClick} className="mt-4 btn-hero">
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1 mb-2 md:mb-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm md:text-base">{event.title}</h4>
                          <Badge className={getCategoryColor(event.category || 'Workshop')}>
                            {event.category || 'Workshop'}
                          </Badge>
                          {event.ticket_price && event.ticket_price > 0 && (
                            <Badge variant="outline">₹{event.ticket_price}</Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {formatDate(event.start_date)} • {event.location || 'Online'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {event.created_by === user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/scanner/${event.id}`)}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Scanner
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {selectedTicketEvent && (
          <MyEventsTicket
            eventId={selectedTicketEvent.eventId}
            userId={user?.id || ''}
            eventTitle={selectedTicketEvent.eventTitle}
            registrationId={selectedTicketEvent.registrationId}
            isOpen={!!selectedTicketEvent}
            onClose={() => setSelectedTicketEvent(null)}
          />
        )}
      </div>
    </div>

    {/* Organization Registration Modal */}
    <RegisterOrganizationModal
      isOpen={showOrgModal}
      onClose={() => setShowOrgModal(false)}
      onRegisterOrganization={handleRegisterOrganization}
    />
  );
};

export default Dashboard;