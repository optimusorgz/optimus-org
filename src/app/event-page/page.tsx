// src/app/event-page/page.tsx

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { EventCard } from '@/components/event/EventCard';
import Loader from '@/components/ui/Loader';
import { FilterBar } from "@/components/event/FilterBar";
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  XCircleIcon,
  AlertTriangle,
} from 'lucide-react';

import supabase from '@/api/client';


// --- 1. TYPE DEFINITIONS ---
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
  status: 'approved' | 'pending' | 'ended' | 'draft';
}

/// 🔥 NEW: Added "All Events"
type PriceFilter = 'All Events' | 'Upcoming Events' | 'Free' | 'Paid';

type SortOption = 'Event Date' | 'Recently Added' | 'Title (A-Z)';

export interface Filters {
  searchQuery: string;
  priceFilter: PriceFilter;
  sortOption: SortOption;
  eventDateFilter: string;
}


// --- 2. FILTER + SORT LOGIC ---
const filterAndSortEvents = (events: Event[], filters: Filters): Event[] => {
  const { searchQuery, priceFilter, sortOption } = filters;
  const now = new Date();

  let filtered = events.filter(e => {
    if (e.status !== 'approved' && e.status !== 'pending') return false;

    const isUpcoming = new Date(e.end_date) >= now;

    // 🔥 NEW: Show all approved + pending events
    if (priceFilter === 'All Events') {
      return true;
    }

    // Existing filters
    if (priceFilter === 'Upcoming Events') {
      return isUpcoming;
    }
    if (priceFilter === 'Free') {
      return (e.ticket_price ?? 0) === 0 && isUpcoming;
    }
    if (priceFilter === 'Paid') {
      return (e.ticket_price ?? 0) > 0 && isUpcoming;
    }

    return true;
  });

  // Search Filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.organizer_name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }

  // Sorting
  let sorted = [...filtered];

// Special sorting rule for "All Events"
    if (priceFilter === 'All Events') {
    // Sort by newest first (created_at descending)
    sorted.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    } else {
    // Existing sorting logic
    sorted.sort((a, b) => {
        if (sortOption === 'Event Date') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
        if (sortOption === 'Recently Added') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOption === 'Title (A-Z)') {
        return a.title.localeCompare(b.title);
        }
        return 0;
    });
    }

  return sorted;
};


// --- 3. MAIN PAGE ---
export default function EventsPage() {
  const router = useRouter();

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    priceFilter: 'Upcoming Events',
    sortOption: 'Event Date',
    eventDateFilter: '',
  });

 const fetchEvents = useCallback(async () => {
    setError(null);

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(100);

      if (error) {
        throw error;
      }

      setAllEvents(data as Event[]);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load events');
      setAllEvents([]);
    } finally {
      setLoading(false); // GUARANTEED stop
    }
  }, []);


  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return filterAndSortEvents(allEvents, filters);
  }, [allEvents, filters]);

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

  if(loading){
    return(
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4 md:p-6 w-full overflow-x-hidden max-w-full">

      <header className="text-center mt-16 sm:mt-20 max-w-3xl mx-auto px-4 w-full fade-down">
        <h1 className="text-cyan-400 text-4xl font-extrabold">Explore Events</h1>
        <p className="text-gray-300 mt-2">Discover events happening around you</p>
      </header>

      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6">

        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center py-10 flex flex-col items-center bg-red-900/20 border border-red-800 rounded-lg p-6">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
            <h2 className="text-xl font-semibold text-red-400">Error Fetching Events</h2>
            <p className="text-red-300">{error}</p>
          </div>
        ) : (
          <>
            {/* 🔥 UPDATED FilterBar */}
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            <div className="text-gray-400 mb-6">
              <p className="text-lg">Showing {eventCount} events</p>
            </div>

            <section className="w-full opacity-0" data-animate-on-visible="fade-left">
              {hasEvents ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-20 text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-600 mb-4" />
                  <h2 className="text-2xl font-semibold">No events found</h2>
                  <p className="text-gray-400 max-w-sm mt-2">
                    Try adjusting your filters or check back later.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2 mt-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  );
}
