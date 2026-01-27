// src/app/event-page/event-details/EventDetailsClientContent.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, MapPin, Clock, Calendar,CheckCircle, XCircle, User, DollarSign, List, Users, Mail, Phone, Share2, AlertTriangle, Loader2, Check, ExternalLink, Ticket, X
} from 'lucide-react';
import supabase from "@/api/client" // Ensure this path is correct
import { toast, Toaster } from 'react-hot-toast';
import { max } from 'date-fns';
import TicketModal from '@/components/dashboard/TicketModal';


// --- 1. TYPE DEFINITIONS ---

interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    start_date: string; // timestamptz
    end_date: string;    // timestamptz
    location: string;
    organizer_name: string;
    contact_email: string | null;
    contact_phone: string | null;
    ticket_price: number | null;
    max_participants: number | null;
    banner_url: string | null;
    status: 'draft' | 'pending' | 'approved' | 'cancelled' | 'ended';
}


const statusConfig = {
  registered: {
    icon: <CheckCircle className="w-5 h-5 text-green-400 mr-2" />,
    colorClass: "bg-gray-500 cursor-not-allowed text-white",
  },
  pending_payment: {
    icon: <Clock className="w-5 h-5 text-yellow-400 mr-2" />,
    colorClass: "bg-yellow-500 text-gray-900 hover:bg-yellow-600",
  },
  full: {
    icon: <XCircle className="w-5 h-5 text-red-400 mr-2" />,
    colorClass: "bg-red-500 cursor-not-allowed text-white",
  },
  Completed: {
    icon: null,
    colorClass: "bg-gray-500 cursor-not-allowed text-white",
  },
  unregistered: {
    icon: null,
    colorClass: "bg-cyan-600 text-white hover:bg-cyan-700",
  },
};

// Custom type for registration status
type RegistrationStatus = 'unregistered' | 'pending_payment' | 'registered' | 'full' | 'Completed';


// --- 2. UTILITY FUNCTIONS (Kept here for simplicity) ---

const formatPrice = (price: number | null) => {
    if (price === 0 || price === null) return 'Free';
    return `₹${price.toFixed(0)}`;
};

const formatEventDate = (dateStr: string, includeTime: boolean = true) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
    }
    return date.toLocaleDateString('en-US', options).replace(/, \d{4},/, ',').replace(' at', '');
};

const getDuration = (startStr: string, endStr: string): string => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';

    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 'Same Day';

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};


// --- 3. DUMMY DATA FOR WHY ATTEND SECTION ---


// --- 4. SHARED UI COMPONENTS (Kept here for simplicity) ---

const Card: React.FC<{ children: React.ReactNode, title: string, icon: React.ReactNode, className?: string }> = ({ children, title, icon, className = '' }) => {
    // Extract animation classes from className if present
    const hasAnimation = className.includes('opacity-0') || className.includes('data-animate-on-visible');
    return (
        <div className={`p-4 sm:p-5 md:p-6 bg-gray-800/70 border border-gray-700 rounded-xl shadow-lg ${className} w-full max-w-full`}>
            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4 border-b border-gray-700 pb-2">
                {icon}
                <span className="ml-2">{title}</span>
            </h3>
            {children}
        </div>
    );
};

// MODIFIED DetailItem for better mobile alignment
const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number | null }> = ({ icon, label, value }) => (
    <div className="flex items-start text-gray-300">
        <div className="flex-shrink-0 w-6 h-6 mr-3 text-cyan-500">{icon}</div>
        <div className="flex justify-between w-full text-sm sm:text-base"> {/* Added text-sm for mobile */}
            <span className="font-medium text-white mr-2 flex-shrink-0">{label}:</span> {/* Added flex-shrink-0 */}
            <span className="text-right truncate">{value ?? 'N/A'}</span> {/* Added truncate for long text */}
        </div>
    </div>
);



// --- 5. MAIN CONTENT COMPONENT ---

export default function EventDetailsClientContent() {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    
    // Get the ID from the search parameters
    const eventId = searchParams.get('id') || 'placeholder-uuid'; 

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentRegistrations, setCurrentRegistrations] = useState<number>(0);

    // NEW STATE: Registration and Ticket Status
    const [regStatus, setRegStatus] = useState<RegistrationStatus>('unregistered');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [ticketId, setTicketId] = useState<string>('');



    // Utility to simulate Razorpay button opening
    const openRazorpay = (event: Event) => {
        const isMobile = window.innerWidth <= 640;
        toast('Simulating Razorpay Payment...', {
            icon: '💳',
            duration: 5000,
            style: {
                background: '#1F2937',
                color: '#34D399',
                fontWeight: 'bold',
                padding: '16px',
                borderRadius: '10px',
                width: isMobile ? '90vw' : 'full',
                maxWidth: '600px',
            },
        });
        
        // **In a real app, this is where you'd initiate the Razorpay instance**
        // For simulation, let's auto-transition to 'registered' after a delay
        setTimeout(() => {
            // Simulate successful payment
            setRegStatus('registered');
            toast.success('Payment successful! You are now registered.', { duration: 3000 });
        }, 2000);
    };


    // --- Data Fetching Logic (Modified to check user-specific status) ---
    const fetchEventDetails = useCallback(async () => {
        // ... (existing error/loading checks)
        if (eventId === 'placeholder-uuid') {
            setError('No event ID provided. Cannot fetch data.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Fetch Event Details
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError) {
            console.error('Error fetching event:', eventError);
            setError(eventError.message || 'Failed to fetch event details. Check RLS policy.');
            setEvent(null);
            setLoading(false);
            return;
        }

        const event: Event = { 
            // Apply mock data to fill gaps for presentation if needed
            title: 'Nature Hackathon',
            location: 'LPU',
            organizer_name: 'drogon',
            category: 'Hackathon',
            contact_email: 'piyushsaini0404@gmail.com',
            contact_phone: '987654321',
            ...eventData 
        } as Event;
        setEvent(event);
        
        // Fetch Current User
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        setCurrentUserId(userId || null);
        
        // Fetch current registrations count (for capacity check)
        const { count: regCount, error: regCountError } = await supabase
            .from('registrations')
            .select('*', { count: 'exact' })
            .eq('event_id', event.id);
        
        const currentCount = regCount || 0;
        setCurrentRegistrations(currentCount);
        const now = new Date().toISOString();

        if (event.end_date < now) {
            setRegStatus('Completed');
        } else if (event.max_participants && currentCount >= event.max_participants) {
            setRegStatus('full');
        } else if (userId) {
            const { data: userReg } = await supabase
                .from('event_registrations')
                .select('is_paid')
                .eq('event_id', event.id)
                .eq('user_id', userId)
                .single();

            if (userReg) {
                if (userReg.is_paid === 'PAID' || event.ticket_price === 0 || event.ticket_price === null) {
                    setRegStatus('registered');
                } else if (userReg.is_paid === 'pending' && event.ticket_price! > 0) {
                    setRegStatus('pending_payment');
                } else {
                    setRegStatus('unregistered');
                }
            } else {
                setRegStatus('unregistered');
            }
        } else {
            setRegStatus('unregistered');
        }
        
        setLoading(false);
    }, [eventId]);

    useEffect(() => {
        fetchEventDetails();
    }, [fetchEventDetails]);

    
    
    // --- Render Loading/Error States ---
    if (loading) {
        // ... (Loading UI)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
                <p className="text-xl">Loading event data...</p>
            </div>
        );
    }

    if (error || !event) {
        // ... (Error UI)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-red-400">Error: Could not load event</h1>
                <p className="text-gray-400 text-center max-w-lg">
                    {error || 'The requested event was not found or the connection failed.'}
                </p>
                <button
                    onClick={() => router.push('/event-page')}
                    className="mt-6 text-cyan-400  hover:text-cyan-500 flex items-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
                </button>
            </div>
        );
    }

    // --- Derived Data for UI ---
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const duration = getDuration(event.start_date, event.end_date);
    const priceDisplay = formatPrice(event.ticket_price);
    const isPaid = (event.ticket_price ?? 0) > 0;
    const isUpcoming = event.status === 'approved' || event.status === 'pending';
    
    // Format UTC HH:MM
    const formatUTC = (date: Date) => {
        const hours = date.getUTCHours().toString().padStart(2,'0');
        const minutes = date.getUTCMinutes().toString().padStart(2,'0');
        return `${hours}:${minutes}`;
    };


    const handleregistration = async () => {
        if (!event) return;

        // Check login (simplified, as status check already assumed logged in or not)
        if (!currentUserId) {
            toast.error('Please log in', {
                duration: 1000,
                className: 'cyan-text-400',
            });
            return;
        }

        let registrationUrl = `/event-page/${event.id}/register`;
        // If unregistered and free, go straight to registration process (or simply mark as registered for free events)
        if (regStatus === 'pending_payment') {
        // 💡 Case: RESUME REGISTRATION / PAY NOW (Pass resume flag and user ID)
            registrationUrl = `/event-page/${event.id}/register?status=resume&user_id=${currentUserId}`;
            toast('Resuming registration to complete payment...', { icon: '📝' });
        
        } else if (regStatus === 'unregistered') {
            // 💡 Case: NEW REGISTRATION (Pass user ID)
            registrationUrl = `/event-page/${event.id}/register?user_id=${currentUserId}`;
            toast('Starting new registration...', { icon: '✍️' });
        }
        
        // Use Next.js router for navigation
        router.push(registrationUrl);
    };

    // --- Button Logic based on Registration Status ---

    let buttonText = 'Register for Event';
    let buttonAction: () => void = handleregistration;
    let isButtonDisabled = false;
    let buttonClass = 'bg-cyan-600 text-white hover:bg-cyan-700';

    switch (regStatus) {
        case 'registered':
            buttonText = 'Registered! 🎉';
            isButtonDisabled = true;
            buttonAction = () => {}; // No action
            buttonClass = 'bg-green-500 cursor-not-allowed text-white';
            break;
        case 'pending_payment':
            buttonText = 'Registration Pending: Pay Now';
            buttonAction = handleregistration;
            buttonClass = 'bg-yellow-500 text-gray-900 hover:bg-yellow-600';
            break;
        case 'full':
            buttonText = 'Registration Full';
            isButtonDisabled = true;
            buttonAction = () => {};
            buttonClass = 'bg-red-500 cursor-not-allowed text-white';
            break;
        case 'Completed':
            buttonText = 'Event Completed';
            isButtonDisabled = true;
            buttonAction = () => {};
            buttonClass = 'bg-green-500 cursor-not-allowed text-white';
            break;
        case 'unregistered':
        default:
            buttonText = isPaid ? `Register & Pay ${priceDisplay}` : 'Register for Event';
            buttonAction = handleregistration;
            buttonClass = 'bg-cyan-600 text-white hover:bg-cyan-700';
            break;
    }

    const { icon, colorClass } = statusConfig[regStatus];
    


    // --- Render Main Page ---
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans w-full overflow-x-hidden max-w-full">
            
            
            {/* Ticket Modal */}
            {regStatus === 'registered' && (
                <TicketModal
                    ticketId={ticketId}
                    eventId={eventId}
                    isOpen={showTicketModal}
                    onClose={() => setShowTicketModal(false)}
                    />

            )}

            
            {/* 1. Header and Banner */}
            {/* ... (Existing Banner/Header UI) ... */}
            <div className="relative h-[25rem] sm:h-[30rem] md:h-[35rem] lg:h-[40rem] overflow-hidden pb-5 w-full max-w-full"> 
                {/* Banner Image (Nature Theme Background) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                    style={{ 
                        backgroundImage: `url(${event.banner_url || ''})`,
                        // Dark overlay for text readability
                        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)',
                        backgroundColor: '#1E2D2B' // Deep cyan/Charcoal fallback
                    }}
                >
                    {/* Fallback color if no image */}
                    {!event.banner_url && <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>}
                </div>

                {/* Adjusted Outer Content Wrapper (Increased mobile top padding to pt-16 for overall shift down) */}
                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex flex-col justify-end pt-12 sm:pt-16 pb-4 sm:pb-6 md:pb-8 w-full"> 
                    
                    {/* Back Button - Remains anchored to the top (z-10 ensures it's above the content shift) */}
                    <button
                        onClick={() => router.push('/event-page')}
                        className="absolute top-4 sm:top-6 md:top-8 left-3 sm:left-4 md:left-6 lg:left-8 flex items-center text-gray-200 hover:text-cyan-400 transition text-xs sm:text-sm bg-gray-900/50 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg z-10"
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Back to Events</span><span className="sm:hidden">Back</span>
                    </button>

                    {/* Main Title and Details (Added pt-12 to push content down and clear the back button) */}
                    <div className="flex flex-col pt-8 sm:pt-12 md:pt-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Date Tag */}
                            <span className="text-sm sm:text-base md:text-xl font-medium text-gray-200">{formatEventDate(event.start_date, false)}</span>
                            {/* Upcoming Badge */}
                            {isUpcoming && (
                                <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${isPaid ? 'bg-cyan-600 text-white' : 'bg-cyan-400 text-gray-900'}`}>
                                    Upcoming
                                </span>
                            )}
                        </div>

                        {/* Main Title */}
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3 sm:mb-4 leading-tight tracking-tight drop-shadow-lg fade-up animate-delay-200" style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.8)' }}>
                            {event.title}
                        </h1>

                        {/* Sub-Details */}
                        <div className="flex flex-wrap items-center text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 gap-2 sm:gap-3 md:gap-4">
                            <span className="flex items-center">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2 text-red-400 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                            </span>
                            <span className="flex items-center">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2 text-purple-400 flex-shrink-0" />
                                <span className="truncate">Organized by <a href="#" className="font-bold text-cyan-400 hover:underline ml-1">{event.organizer_name}</a></span>
                            </span>
                            <span className="flex items-center">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2 text-blue-400 flex-shrink-0" />
                                {/* Changed span to block/flex for better wrapping on small screens */}
                                <span className="flex flex-wrap">
                                    {formatUTC(startDate)} - {formatUTC(endDate)} <span className="ml-1">({duration})</span>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 md:p-6 lg:p-8 mt-[-1rem] sm:mt-[-2rem] md:mt-[-3rem] relative w-full overflow-x-hidden">
                
                {/* 4. Main Content Cards (Left Column - Span 2) */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
                    
                    {/* Card B: Registration CTA (Modified) */}
                    
                        <div className="p-4 sm:p-5 md:p-6 bg-gray-800 border border-cyan-600 rounded-xl shadow-2xl space-y-3 sm:space-y-4 w-full max-w-full" data-animate-on-visible="fade-in-scale">
                        <h3 className="text-xl sm:text-2xl font-bold text-white border-b border-gray-700 pb-2 sm:pb-3">Registration</h3>
                        
                        {/* Ticket Info */}
                        <div className="flex justify-between items-center bg-gray-700 p-2 sm:p-3 rounded-lg">
                            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{priceDisplay}</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-300">{isPaid ? 'Ticket Fee' : 'Entry Cost'}</span>
                        </div>
                       
                       <p className="text-yellow-300 text-xs sm:text-sm border-l-4 border-yellow-500 p-2 rounded-lg">
                            Limit: {event.max_participants} participants only
                        </p>

                        {/* Action Buttons (Modified) */}
                        <button
                            onClick={buttonAction}
                            disabled={isButtonDisabled || regStatus === "Completed"}
                            className={`w-full py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-bold rounded-lg shadow-md transition duration-150 flex items-center justify-center ${colorClass}`}
                            >
                            {icon}
                            {buttonText}
                        </button>

                        {/* NEW: Show Ticket Button if Registered */}
                        
                        

                        <button
                            // Conditional check for navigator.share is good practice
                            onClick={() => navigator.share ? navigator.share({ title: event.title, url: window.location.href }) : toast.error('Share function unavailable.')}
                            className="w-full py-2.5 sm:py-3 border border-gray-600 text-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-700 transition duration-150 text-sm sm:text-base"
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Share Event
                        </button>
                    </div>

                    {/* Card A: About the Event */}
                    <Card title="About the Event" icon={<List />} className="bg-gray-800/90" data-animate-on-visible="fade-up">

                    <p
                    className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: (event.description || "Default description").replace(/\n/g, '<br />')
                    }}
                    />

                    </Card>

                    {/* Card B: Event Details and Timeline */}
                    <Card title="Event Details" icon={<Calendar />} className="bg-gray-800/90" data-animate-on-visible="fade-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">

                            {/* Essentials Section */}
                            <div className="space-y-2 sm:space-y-3">
                            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">Essentials</h4>

                            {/* Each Detail Item (Using the general DetailItem component for consistency) */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-cyan-500" />
                                <span className="font-medium text-white">Venue:</span>
                                </div>
                                <span className="text-gray-300">{event.location}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-purple-400" />
                                <span className="font-medium text-white">Organized by:</span>
                                </div>
                                <span className="text-gray-300">{event.organizer_name}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <span className="font-medium text-white">Duration:</span>
                                </div>
                                <span className="text-gray-300">{duration}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <List className="w-5 h-5 text-yellow-400" />
                                <span className="font-medium text-white">Category:</span>
                                </div>
                                <span className="text-gray-300">{event.category}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5 text-cyan-400 " />
                                <span className="font-medium text-white">Event Type:</span>
                                </div>
                                <span className="text-gray-300">{isPaid ? 'Paid' : 'Free'}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-pink-400" />
                                <span className="font-medium text-white">Max Participants:</span>
                                </div>
                                <span className="text-gray-300">{event.max_participants}</span>
                            </div>
                            </div>

                            {/* Event Timeline Section */}
                            <div className="space-y-2 sm:space-y-3">
                            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">Event Timeline</h4>
                            <div className="p-3 sm:p-4 border-l-4 border-cyan-500 bg-gray-700/50 rounded-md space-y-2">
                                <p className="text-gray-300 text-sm sm:text-base">
                                <span className="font-semibold text-white">Start Time:</span> {formatUTC(startDate)}
                                </p>
                                <p className="text-gray-300 text-sm sm:text-base">
                                <span className="font-semibold text-white">End Time:</span> {formatUTC(endDate)}
                                </p>
                            </div>
                            </div>

                        </div>
                        </Card>
                    {/* Card C: Why Attend? (Value Proposition) (Moved to the bottom of the left column before the final standalone section) */}
                    

                    
                </div>

                {/* 3. Registration / CTA Sidebar (Right Column) */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6 md:space-y-8 lg:sticky lg:top-8 h-fit">
                    
                    {/* Card F: Event Information Summary (Chips) */}
                    <Card title="Event Summary" icon={<List />} data-animate-on-visible="fade-right">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-center">
                            {/* Chip 1: Price */}
                            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-cyan-400">{priceDisplay}</div>
                                <div className="text-xs text-gray-400 mt-1">Entry Fee</div>
                            </div>
                            {/* Chip 2: Max Participants */}
                            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-white">{event.max_participants || '∞'}</div>
                                <div className="text-xs text-gray-400 mt-1">Max Participants</div>
                            </div>
                            {/* Chip 3: Category */}
                            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-white truncate">{event.category}</div>
                                <div className="text-xs text-gray-400 mt-1">Category</div>
                            </div>
                            {/* Chip 4: Duration */}
                            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-white">{duration}</div>
                                <div className="text-xs text-gray-400 mt-1">Duration</div>
                            </div>
                        </div>
                    </Card>

                    {/* Card D: Contact Information - Uses the fixed DetailItem */}
                    <Card title="Contact Information" icon={<User />} data-animate-on-visible="fade-right">
                        <div className="space-y-2 sm:space-y-3">
                            <DetailItem icon={<Mail />} label="Email" value={event.contact_email} />
                            <DetailItem icon={<Phone />} label="Phone" value={event.contact_phone} />
                            <DetailItem icon={<User />} label="Organizer" value={event.organizer_name} />
                        </div>
                    </Card>
                    
                    {/* Card E: Quick Actions */}
                    <Card title="Quick Actions" icon={<ExternalLink />} data-animate-on-visible="fade-right">
                        <div className="flex flex-col space-y-2">
                            {/* Quick Action: Register/Pay Button */}
                            <button onClick={buttonAction} className="text-cyan-400 hover:text-cyan-500 text-left font-medium disabled:text-gray-500 text-sm sm:text-base" disabled={isButtonDisabled}>
                                {regStatus === 'pending_payment' ? 'Complete Payment' : 'Register for Event'}
                            </button>
                            {/* Quick Action: View Ticket Button */}
                            {regStatus === 'registered' && (
                                <button onClick={() => setShowTicketModal(true)} className="text-cyan-400 hover:text-cyan-500 text-left font-medium text-sm sm:text-base">
                                    View My Ticket
                                </button>
                            )}
                            <button onClick={() => navigator.share ? navigator.share({ title: event.title, url: window.location.href }) : toast.error('Share function unavailable.')} className="text-gray-400 hover:text-gray-300 text-left font-medium text-sm sm:text-base">
                                Share with Friends
                            </button>
                            <a href={`mailto:${event.contact_email || 'support@example.com'}`} className="text-gray-400 hover:text-gray-300 text-left font-medium text-sm sm:text-base break-all">
                                Ask a Question
                            </a>
                            <a href={`tel:${event.contact_phone || '#'}`} className="text-gray-400 hover:text-gray-300 text-left font-medium text-sm sm:text-base">
                                Call Organizer
                            </a>
                        </div>
                    </Card>

                </div>
            </div>
            
        </div>
    );
}
