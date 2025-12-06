// src/app/event-page/page.tsx

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
// Assuming EventCard component is imported from the correct path:
import { EventCard} from '@/components/event/EventCard';
import Loader from '@/components/ui/Loader'; 
// We will define the FilterBar component below for completeness!
import { FilterBar } from "@/components/event/FilterBar"; 
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  XCircleIcon,
  SearchIcon,
  ChevronDownIcon,
  MapPinIcon,
  DollarSign,
  IndianRupee,
  UserIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import supabase from '@/api/client'; 
import { Button } from '@/components/ui/button';

// --- 1. TYPE DEFINITIONS ---
// ----------------------------

// Event interface matching your Supabase table structure
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string; // timestamptz from Supabase
  end_date: string;   // timestamptz from Supabase
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
  status: 'approved' | 'pending' | 'ended' | 'draft';
}

type PriceFilter = 'Upcoming Events' | 'Free' | 'Paid';
type SortOption = 'Event Date' | 'Recently Added' | 'Title (A-Z)';

export interface Filters { // Exporting Filters as it's used elsewhere (e.g., FilterBar)
  searchQuery: string;
  priceFilter: PriceFilter;
  sortOption: SortOption;
  eventDateFilter: string;
}

// Interface for FilterBar to enable controlled component pattern
interface FilterBarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}


// --- 2. UTILITY FUNCTIONS (Filter/Sort Logic) ---
// --------------------------------------------------

const filterAndSortEvents = (events: Event[], filters: Filters): Event[] => {
  const { searchQuery, priceFilter, sortOption } = filters;
  const now = new Date();

  // 1. Filter by Status and Upcoming
  let filtered = events.filter(e => {
    // Only show 'approved' and 'pending' events
    if (e.status !== 'approved' && e.status !== 'pending') return false;

    // Check if the event's end date is in the future or today
    const isUpcoming = new Date(e.end_date) >= now;

    if (priceFilter === 'Upcoming Events') {
      return isUpcoming;
    } else if (priceFilter === 'Free') {
      // Check if price is 0 and event is upcoming
      return (e.ticket_price ?? 0) === 0 && isUpcoming;
    } else if (priceFilter === 'Paid') {
      // Check if price is > 0 and event is upcoming
      return (e.ticket_price ?? 0) > 0 && isUpcoming;
    }
    // If no price filter is active, default to show all approved/pending events
    return true;
  });

  // 2. Filter by Search Query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.organizer_name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }

  // 3. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'Event Date') {
      // Ascending by Start Date (Nearest first)
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    } else if (sortOption === 'Recently Added') {
      // Descending by Created At (Newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOption === 'Title (A-Z)') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return sorted;
};


// --- 3. MAIN PAGE COMPONENT ---
// --------------------------------

export default function EventsPage() {
  const router = useRouter();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    priceFilter: 'Upcoming Events', // Default filter as seen in the first image
    sortOption: 'Event Date',      // Default sort
    eventDateFilter: '',
  });

  // Function to fetch data from Supabase
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('events') 
      .select('*')     
      .limit(100);

    if (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
      setAllEvents([]);
    } else {
      setAllEvents(data as Event[]);
    }
    setLoading(false);
  }, []);

  // Run the fetch function once on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


  // Apply filters and sorting logic using useMemo for performance
  const filteredEvents = useMemo(() => {
    return filterAndSortEvents(allEvents, filters);
  }, [allEvents, filters]);

  // Generic handler to update a single filter field
  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAllFilters = () => {
    setFilters({
      searchQuery: '',
      priceFilter: 'Upcoming Events',
      sortOption: 'Event Date',
      eventDateFilter: '',
    });
  };

  const eventCount = filteredEvents.length;
  const hasEvents = eventCount > 0;

  // Handle navigation to the create event page
  const handleCreateEventClick = () => {
    router.push('/form/create-event'); 
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4 md:p-6 w-full overflow-x-hidden max-w-full">
        {/* 1. Header (Updated to match image content and center alignment) */}
            <header className="text-center mt-16 sm:mt-20 max-w-3xl mx-auto px-4 w-full">
                <h1 className="text-cyan-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold">Explore Events</h1>
                <p className="text-gray-300 mt-1 text-sm sm:text-base md:text-lg">Discover amazing events happening near you and around the world</p>
            </header>
        
        {/* 2. Main Content Area */}
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6">
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-gray-900">
                    <Loader />
                    </div>

            ) : error ? (
                <div className="text-center py-10 flex flex-col items-center bg-red-900/20 border border-red-800 rounded-lg p-6">
                    <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-red-400 mb-2">Error Fetching Data</h2>
                    <p className="text-red-300 max-w-lg">
                        A network error occurred or the Supabase connection failed: {error}
                    </p>
                </div>
            ) : (
                <>
                    {/* Filter Bar */}
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    
                    {/* Results Count & Create Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-400 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <p className="text-sm sm:text-base md:text-lg font-medium">Showing {eventCount} events</p>
                        
                        <Button 
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 w-full sm:w-auto" 
                            onClick={handleCreateEventClick}
                        >
                            Create New Event
                        </Button>
                    </div>

                    {/* Event Grid/List - Updated to match the grid structure of the second image */}
                    <section className="w-full overflow-x-hidden">
                        {hasEvents ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                                {filteredEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            /* No Events Found State */
                            !loading && !error && (
                                <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center px-4">
                                    <CalendarIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-600 mb-3 sm:mb-4" />
                                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">No events found</h2>
                                    <p className="text-gray-400 mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
                                        No events match your current filters. Try adjusting the filters or check back later for new events.
                                    </p>
                                    <button
                                        onClick={resetAllFilters}
                                        className="px-4 sm:px-6 py-2 border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition rounded-lg flex items-center text-sm sm:text-base"
                                    >
                                        <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                        Reset All Filters
                                    </button>
                                </div>
                            )
                        )}
                    </section>
                </>
            )}
        </div>
    </div>
  );
}