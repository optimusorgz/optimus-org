import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Calendar, Users, MapPin, Clock, Tag, Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
}

const EventHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const priceFilters = [
    { id: "free", label: "Free" },
    { id: "paid", label: "Paid" },
  ];

  // Removed categoryFilters

  // Removed statusFilters

  useEffect(() => {
    fetchEvents();
  }, [selectedFilter, searchQuery, sortBy]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Base query - select all fields from events table
      let query = supabase
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
          status
        `)

        .eq("status", "approved"); 
        // Only fetch approved events by default

      // Removed status filter

      // Apply upcoming/all events filter
      if (!showAllEvents) {
        query = query.gte("start_date", new Date().toISOString());
      }

      // Apply price filter
      if (selectedFilter === "free") {
        query = query.or("ticket_price.is.null,ticket_price.eq.0");
      } else if (selectedFilter === "paid") {
        query = query.gt("ticket_price", 0);
      }

      // Removed category filter

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,organizer_name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
        );
      }

      // Apply sorting
      if (sortBy === "date") {
        query = query.order("start_date", { ascending: true });
      } else if (sortBy === "created") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "title") {
        query = query.order("title", { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched events:", data); // Debug log
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "Invalid Time";
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    // First check database status
    if (event.status !== "approved") {
      return {
        status: event.status === "pending" ? "Pending Approval" : "Not Approved",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        disabled: true
      };
    }

    // Then check date-based status
    if (now > endDate) {
      return {
        status: "Event Ended",
        color: "bg-gray-100 text-gray-600 border-gray-300",
        disabled: true
      };
    } else if (now >= eventDate && now <= endDate) {
      return {
        status: "Live Now",
        color: "bg-red-100 text-red-700 border-red-300",
        disabled: false
      };
    } else {
      return {
        status: "Open",
        color: "bg-green-100 text-green-700 border-green-300",
        disabled: false
      };
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      workshop: "bg-blue-100 text-blue-700 border-blue-200",
      "tech-talk": "bg-green-100 text-green-700 border-green-200",
      hackathon: "bg-purple-100 text-purple-700 border-purple-200",
      bootcamp: "bg-orange-100 text-orange-700 border-orange-200",
      conference: "bg-indigo-100 text-indigo-700 border-indigo-200",
      meetup: "bg-pink-100 text-pink-700 border-pink-200",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleEventClick = (eventId: string) => {
    console.log("Navigating to event:", eventId);
    navigate(`/events/${eventId}`);
  };

  const handleButtonClick = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    handleEventClick(eventId);
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-glow mb-2">Optimus Events Hub</h1>
            <p className="text-sm md:text-base text-muted-foreground">Discover amazing events and join the community</p>
          </div>
          {user && (
            <Button onClick={() => navigate('/create-event')} className="btn-hero w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events by title, description, organizer, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Upcoming/All Events Toggle */}
            <div className="flex gap-2">
              <Button
                variant={!showAllEvents ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllEvents(false)}
              >
                Upcoming Events
              </Button>
            </div>

            {/* Price Filters */}
            <div className="flex flex-wrap gap-2">
              {priceFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Removed category filter UI */}

            {/* Removed status filter UI */}

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Event Date</SelectItem>
                <SelectItem value="created">Recently Added</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {events.length} event{events.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <Card key={idx} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Calendar className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No events match your search for "${searchQuery}". Try adjusting your filters or search term.`
                : "No events match your current filters. Try adjusting the filters or check back later for new events."
              }
            </p>
            <div className="flex gap-2 justify-center">
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFilter("all");
                  setSearchQuery("");
                }}
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {events.map((event) => {
              const { status, color, disabled } = getEventStatus(event);
              const isUpcoming = new Date(event.start_date) >= new Date();
              return (
                <Card
                  key={event.id}
                  className={`cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200 overflow-hidden group ${
                    isUpcoming ? 'ring-2 ring-primary/20 shadow-lg' : 'opacity-75'
                  }`}
                  onClick={() => handleEventClick(event.id)}
                >
                  {/* Event Banner */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                    {event.banner_url ? (
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Calendar className="h-16 w-16 text-primary/60" />
                    )}
                  </div>

                  {/* Event Content */}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${getCategoryColor(event.category)} text-xs whitespace-nowrap`}
                      >
                        {event.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{new Date(event.start_date).toLocaleDateString('en-GB')}</span>

                        <Clock className="h-4 w-4 ml-2 flex-shrink-0" />
                        <span>
                          {(() => {
                            const date = new Date(event.start_date);
                            const hours = date.getUTCHours().toString().padStart(2, '0');
                            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                            return `${hours}:${minutes}`;
                          })()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.organizer_name}</span>
                      </div>
                      {event.max_participants && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Max {event.max_participants} participants</span>
                        </div>
                      )}
                      {/* Price Display */}
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4 flex-shrink-0" />
                        {event.ticket_price !== null && event.ticket_price > 0 ? (
                          <span className="text-green-600">₹{event.ticket_price}</span>
                        ) : (
                          <span className="text-blue-600">Free</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full ${color} hover:opacity-80 transition-opacity`}
                      disabled={disabled}
                      onClick={(e) => handleButtonClick(e, event.id)}
                    >
                      {disabled ? status : `${status} - View Details`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHub;
