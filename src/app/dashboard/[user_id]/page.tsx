'use client';
import React, { useEffect, useState } from 'react';
import supabase from '@/api/client'; // Supabase client
import { useRouter } from 'next/navigation';
import TicketModal from '@/components/dashboard/TicketModal';
import Loader from '@/components/ui/Loader';



// Define modal feature types
type ActiveFeature = 'edit' | 'registrations' | 'form' | 'overview' | null;

// --- 1. TYPE DEFINITIONS ---
interface StatsCardData {
  icon: string;
  value: string;
  label: string;
  change: string;
  trend: 'positive' | 'negative';
}

interface EventData {
  id: string;
  title: string;
  date: string;
  registered: number;
  imageUrl: string;
  ticketPrice?: number;
}

interface OrganizationData {
  id: string;
  name: string;
  members: number;
  logoUrl: string;
  status?: 'Pending' | 'Approved' | 'rejected';
}

interface RegistrationData {
  id: string;
  eventTitle: string;
  ticketType: string;
  status: 'confirmed' | 'pending';
}

interface EventCardProps {
  data: EventData;
  onClick?: () => void; // optional click handler
}





// --- 2. COMPONENTS ---
const StatCard: React.FC<{ data: StatsCardData; bgColor: string; index: number }> = ({ data, bgColor, index }) => (
  <div className={`p-3 sm:p-4 md:p-6 rounded-xl shadow-lg ${bgColor} opacity-0`} data-animate-on-visible="pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="flex justify-between items-start mb-2">
      <div className="min-w-0 flex-1">
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white truncate">{data.value}</p>
        <p className="text-xs sm:text-sm md:text-base font-medium text-gray-100 mt-1 truncate">{data.label}</p>
      </div>
      <div className="text-xl sm:text-2xl md:text-3xl opacity-70 mt-1 flex-shrink-0 ml-2">{data.icon}</div>
    </div>
    <p className="text-xs sm:text-sm font-light text-gray-200 truncate">{data.change}</p>
  </div>
);

const EventCard: React.FC<{ data: EventData; onClick?: () => void; index?: number }> = ({ data, onClick, index = 0 }) => (
  
  <div
    onClick={onClick}
    className="flex items-center p-3 sm:p-4 bg-gray-800 rounded-lg transition duration-150 hover:bg-gray-700/70 cursor-pointer w-full max-w-full opacity-0"
    data-animate-on-visible="fade-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-600 rounded-lg flex-shrink-0 mr-3 sm:mr-4 overflow-hidden">
      <img
        src={data.imageUrl}
        alt={data.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://placehold.co/100x100/374151/FFFFFF?text=?';
        }}
      />
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-sm sm:text-base md:text-lg font-semibold truncate text-white">{data.title}</p>
      <p className="text-xs sm:text-sm text-gray-400 truncate">
        {data.date} • <span className="text-blue-400 font-medium">{data.registered} registered</span>
      </p>
    </div>
    <svg
      className="ml-2 sm:ml-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
);


const OrganizationPill: React.FC<{ data: OrganizationData }> = ({ data }) => (
  <a className="p-3 sm:p-4 bg-gray-800 rounded-xl text-center cursor-pointer transition duration-150 hover:bg-gray-700/70 w-full max-w-full">
    <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-full mb-2 sm:mb-3 flex items-center justify-center text-lg sm:text-xl font-bold text-white">
      {data.logoUrl}
    </div>
    <p className="font-semibold truncate text-white text-sm sm:text-base">{data.name}</p>
    <p className="text-xs text-gray-400">{data.members} members</p>
  </a>
);

const RegistrationRow: React.FC<{ data: RegistrationData }> = ({ data }) => {
  const isConfirmed = data.status === 'confirmed';
  const statusClasses = isConfirmed ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400';
  return (
    <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-800 rounded-lg w-full max-w-full">
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">{data.eventTitle}</p>
        <p className="text-xs sm:text-sm text-gray-400 truncate">
          Ticket: <span className="font-medium">{data.ticketType}</span>
        </p>
      </div>
      {/* <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>{data.status}</div> */}
    </div>
  );
};



const HostedOrganizationProfile: React.FC<{ data: OrganizationData }> = ({ data }) => (
<div
  className="p-4 sm:p-5 md:p-6 bg-gray-800 rounded-t-xl rounded-b-none shadow-lg border-b-0 border-2 border-purple-500/50 w-full max-w-full opacity-0"
  data-animate-on-visible="fade-in-scale"
>
      {data.status == 'Pending' && (
        <p className="text-yellow-400 italic text-s sm:text-base pb-3 border-b border-yellow-400/50 mb-4">
          Pending approval - You cannot make the event until approved
        </p>
      )}
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-purple-600">
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt={data.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/100x100/6b21a8/FFFFFF?text=?';
            }}
          />
        ) : (
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{data.name[0]}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-white truncate">{data.name}</p>
        <p className="text-xs sm:text-sm text-gray-400">{data.members} Total Members</p>
      </div>
    </div>
    
  </div>
);

// --- 3. MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [hostedOrganization, setHostedOrganization] = useState<OrganizationData | null>(null);
  const [memberOrganizations, setMemberOrganizations] = useState<OrganizationData[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [hostedEvents, setHostedEvents] = useState<EventData[]>([]);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);

  const router = useRouter();


  // Move this outside useEffect
  const openEventModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveFeature('overview');
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
    setActiveFeature(null);
  };

  const handleEventClick = (eventData: EventData) => {
  setSelectedEvent(eventData);
  setIsModalOpen(true);
  };

  const handleClick = () => {
    if (!hostedOrganization) return;

    router.push(`/form/organisation-edit/${hostedOrganization.id}`);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {

        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        const userId = userData.user.id;
        
        // Hosted org
        const { data: hostedOrgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId)
        .single();
        if (hostedOrgData) {
          setHostedOrganization({
          id: hostedOrgData.id,
          name: hostedOrgData.name,
          members: 0,
          logoUrl: hostedOrgData.avatar_url || hostedOrgData.name[0],
          status: hostedOrgData.status,
        });
      }
      console.log('Hosted organization data:', hostedOrgData);
      
      
      // Member orgs
      const { data: profileData } = await supabase
      .from('profiles')
      .select('organisation_id')
      .eq('id', userId)
      .single();
      
      if (profileData?.organisation_id) {
        const { data: orgData } = await supabase
        .from('organizations')
        .select('id, name, avatar_url')
        .eq('id', profileData.organisation_id);
        
        const memberOrgsData = orgData?.map((org: any) => ({
          id: org.id,
          name: org.name,
          members: 0,
          logoUrl: org.avatar_url || org.name[0],
        })) || [];
        setMemberOrganizations(memberOrgsData);
      }
      
      // Upcoming events
      const { data: eventsData } = await supabase
      .from('event_registrations')
      .select('event_id, events!inner(title, start_date, banner_url)')
      .eq('user_id', userId);
      
      if (eventsData) {
        const today = new Date();
        const upcoming = eventsData
        .filter((e: any) => new Date(e.events.start_date) >= today)
        .map((e: any) => ({
          id: e.event_id,
          title: e.events.title,
          date: new Date(e.events.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          registered: 0,
          imageUrl: e.events.banner_url || 'https://placehold.co/100x100/1e293b/FFFFFF?text=Event',
        }));
        setUpcomingEvents(upcoming);
      }
      
      // Registrations
      const { data: regsData } = await supabase
      .from('event_registrations')
      .select('id, ticket_uid, status, events!inner(title)')
      .eq('user_id', userId);
      
      if (regsData) {
        setRegistrations(
          regsData.map((r: any) => ({
            id: r.id,
            eventTitle: r.events.title,
            ticketType: 'General',
            status: r.status === 'paid' ? 'confirmed' : 'pending',
          }))
        );
      }
      
      // Hosted events
      const { data: hostedEventsData } = await supabase
      .from('events')
      .select('id, title, start_date, banner_url, ticket_price')
      .eq('created_by', userId);
      
      if (hostedEventsData) {
        const eventsWithRevenue = await Promise.all(
          hostedEventsData.map(async (e: any) => {
            // 1. Fetch registration count
            const { count } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('is_paid', 'PAID')
              .eq('event_id', e.id);
              
              // 2. Convert ticket price to number
              const price = Number(e.ticket_price) || 0;
              
              const registered = count || 0;
              console.log('Registered count for event', e.id, ':', registered);
            console.log('Ticket price for event', e.id, ':', price);
            
            return {
              id: e.id,
              title: e.title,
              date: new Date(e.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              registered,
              ticketPrice: price,
              revenue: registered * price, // 💥 FIX HERE
              imageUrl:
              e.banner_url ||
              'https://placehold.co/100x100/1e293b/FFFFFF?text=Event',
            };
          })
        );

        setHostedEvents(eventsWithRevenue );
        
        // 3. FINAL REVENUE CALCULATION
        const totalRevenue = eventsWithRevenue.reduce(
          (acc, e) => acc + e.revenue,
          0
        );
        
        setRevenue(totalRevenue - totalRevenue * 0.05); // Assuming 10% platform fee
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
    
    };

    fetchData();
  }, []);

  

  const statsData: StatsCardData[] = [
    { icon: '📅', value: hostedEvents.length.toString(), label: 'Events Hosted', change: 'this year', trend: 'positive' },
    { icon: '👥', value: registrations.length.toString(), label: 'Total Attendees', change: 'this year', trend: 'positive' },
   
    { icon: '📈', value: '0', label: 'Member', change: 'Organisation member', trend: 'positive' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Loader />
    </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-6 lg:p-10 font-sans mt-10 sm:mt-12 md:mt-16 w-full overflow-x-hidden max-w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 flex items-center fade-down">
        Welcome back! <span className="ml-2">👋</span>
      </h1>
      <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 fade-in animate-delay-100">Here&apos;s what&apos;s happening with your events</p>

      <section className="mb-6 sm:mb-8 md:mb-10 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={stat.label} data={stat} bgColor={['bg-teal-600', 'bg-gray-700', 'bg-blue-600', 'bg-gray-700'][index]} index={index} />
        ))}
      </section>

      <div className="lg:grid lg:grid-cols-3 lg:gap-10">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Upcoming Events */}
          <section className="mb-6 sm:mb-8 md:mb-10 opacity-0" data-animate-on-visible="fade-left">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Upcoming Events</h2>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((e, index) => (
                  <div
                    key={e.id}
                    className="transform transition duration-300 hover:shadow-lg rounded-lg"
                    onClick={() => handleEventClick(e)}
                  >
                    <EventCard data={e} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No upcoming events.</p>
            )}
          </section>


          {/* Registrations */}
          <section className="mb-6 sm:mb-8 md:mb-10 opacity-0" data-animate-on-visible="fade-left">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Recent Registrations</h2>
            </div>
            {registrations.length > 0 ? (
              <div className="space-y-4">{registrations.map((r, index) => (
                <div key={r.id} className="opacity-0" data-animate-on-visible="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <RegistrationRow data={r} />
                </div>
              ))}</div>
            ) : (
              <p className="text-gray-400 italic">No registrations yet.</p>
            )}
          </section>

          {/* Hosted Events */}
          <section className="mb-6 sm:mb-8 md:mb-10 opacity-0" data-animate-on-visible="fade-left">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Hosted Events</h2>
              {/* create event button */}
              <button
                onClick={() => router.push('/form/create-event')}
                className="px-2 sm:px-4 py-2 bg-cyan-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                + Create Event
                </button>
            </div>
            {hostedEvents.length > 0 ? (
              <div className="space-y-4">
                {hostedEvents.map((e, index) => (
                  <EventCard
                    key={e.id}
                    data={e}
                    index={index}
                    onClick={() => router.push(`/dashboard/eventmanage?id=${e.id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">You haven’t hosted any events yet.</p>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Organisation</h2>

            {!hostedOrganization && (
              <button
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
                onClick={() => {
                  // Redirect to organization registration page
                  window.location.href = "/form/organisation-register";
                }}
              >
                Register Your Organization
              </button>
            )}
          </div>

          {hostedOrganization ? (
            <>
              <HostedOrganizationProfile data={hostedOrganization} />
              <div
                className="mt-0 px-4 pb-4 sm:px-5 md:px-6 bg-gray-800 rounded-b-xl shadow-lg 
                border-l-2 border-r-2 border-b-2 border-t-0 border-purple-500/50 w-full max-w-full mb-3"
                
              >
                <button
                  onClick={handleClick}
                  className="w-full px-3 sm:px-4 py-2 bg-purple-600 text-white text-xs sm:text-sm 
                  font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
                  data-animate-on-visible="fade-in-scale"
                >
                  Manage Profile & Settings
                </button>
              </div>

            </>
          ) : (
            <p className="text-gray-400 italic mb-6">
              Start hosting by registering your organization.
            </p>
          )}


          <section className="opacity-0" data-animate-on-visible="fade-right">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Member of Organizations</h2>
            </div>
            {memberOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                {memberOrganizations.map((org, index) => (
                  <div
                    key={org.id}
                    className="opacity-0"
                    data-animate-on-visible="fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <OrganizationPill data={org} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm sm:text-base">
                You are not a member of any organization.
              </p>
            )}
          </section>
        </div>


      </div>
      {selectedEvent && (
        <TicketModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          ticketId={selectedEvent.id}  // pass the ID as ticketId
          eventId={selectedEvent.id}   // pass the ID as eventId
        />
      )}
    </div>
  );
};

export default App;
