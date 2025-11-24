// src/app/event-page/event-details/EventDetailsClientContent.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, MapPin, Clock, Calendar, User, DollarSign, List, Users, Mail, Phone, Share2, AlertTriangle, Loader2, Check, ExternalLink, Ticket, X
} from 'lucide-react';
import supabase from "@/api/client" // Ensure this path is correct
import { toast, Toaster } from 'react-hot-toast';


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

// Custom type for registration status
type RegistrationStatus = 'unregistered' | 'pending_payment' | 'registered' | 'full';


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
const WHY_ATTEND_POINTS = [
    {
        title: "🚀 Expert Knowledge & Mentorship",
        detail: "Learn from industry experts and gain valuable insights in this Hackathon. **Connect with top-tier professionals from Google, Microsoft, and environmental tech startups.**"
    },
    {
        title: "🤝 Networking Opportunities",
        detail: "Connect with like-minded professionals and expand your network. **Build your future team and find potential collaborators/investors.**"
    },
    {
        title: "💡 Practical Skills & Portfolio",
        detail: "Gain hands-on experience and practical skills you can apply immediately. **Leave with a deployable project for your professional portfolio.**"
    },
    {
        title: "🌍 Drive Environmental Impact",
        detail: "Dedicate your skills to solving real-world ecological challenges. **Contribute code that matters to nature conservation and sustainability efforts.**"
    },
    {
        title: "🏆 Win Cash Prizes & Recognition",
        detail: "Compete for significant cash prizes and recognition from sponsoring organizations. **A great opportunity to boost your profile in the tech-for-good space.**"
    },
];

// --- 4. SHARED UI COMPONENTS (Kept here for simplicity) ---

const Card: React.FC<{ children: React.ReactNode, title: string, icon: React.ReactNode, className?: string }> = ({ children, title, icon, className = '' }) => (
    <div className={`p-6 bg-gray-800/70 border border-gray-700 rounded-xl shadow-lg ${className}`}>
        <h3 className="flex items-center text-xl font-semibold text-green-400 mb-4 border-b border-gray-700 pb-2">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        {children}
    </div>
);

// MODIFIED DetailItem for better mobile alignment
const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number | null }> = ({ icon, label, value }) => (
    <div className="flex items-start text-gray-300">
        <div className="flex-shrink-0 w-6 h-6 mr-3 text-green-500">{icon}</div>
        <div className="flex justify-between w-full text-sm sm:text-base"> {/* Added text-sm for mobile */}
            <span className="font-medium text-white mr-2 flex-shrink-0">{label}:</span> {/* Added flex-shrink-0 */}
            <span className="text-right truncate">{value ?? 'N/A'}</span> {/* Added truncate for long text */}
        </div>
    </div>
);

// --- New Ticket Modal Component ---
const TicketModal: React.FC<{ event: Event, onClose: () => void }> = ({ event, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-green-400 flex items-center">
                        <Ticket className="w-6 h-6 mr-2" /> Your Event Ticket
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-green-600/50 space-y-4">
                    <p className="text-lg font-semibold text-white">{event.title}</p>
                    <DetailItem icon={<User />} label="Attendee" value="Current User (Placeholder)" />
                    <DetailItem icon={<Calendar />} label="Date" value={formatEventDate(event.start_date)} />
                    <DetailItem icon={<MapPin />} label="Location" value={event.location} />
                    <DetailItem icon={<DollarSign />} label="Status" value="Payment Confirmed" />
                    <p className="text-sm text-center text-gray-400 pt-3 border-t border-gray-700">
                        Please keep this ticket for entry. A detailed email confirmation has been sent to your registered email.
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

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

        if (event.max_participants && currentCount >= event.max_participants) {
            setRegStatus('full');
        } else if (userId) {
            // Fetch User Registration Status
            const { data: userReg, error: userRegError } = await supabase
                .from('event_registrations') // Assuming a 'registrations' table
                .select('is_paid') // Assuming a 'payment_status' column ('pending', 'completed')
                .eq('event_id', event.id)
                .eq('user_id', userId)
                .single();

            if (userReg) {
                if (userReg.is_paid === 'PAID' || event.ticket_price === 0 || event.ticket_price === null) {
                    setRegStatus('registered');
                } else if (userReg.is_paid === 'pending' && event.ticket_price! > 0) {
                    setRegStatus('pending_payment');
                } else {
                     // Fallback in case of registration record but weird status
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
                <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
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
                    className="mt-6 text-green-400 hover:text-green-500 flex items-center"
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
        toast.error('Please log in first to register for this event.', { duration: 2500 });
        // Optionally redirect to login here: router.push('/login');
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
    let buttonClass = 'bg-green-600 text-white hover:bg-green-700';

    switch (regStatus) {
        case 'registered':
            buttonText = 'Registered! 🎉';
            isButtonDisabled = true;
            buttonAction = () => {}; // No action
            buttonClass = 'bg-gray-500 cursor-not-allowed text-white';
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
        case 'unregistered':
        default:
            buttonText = isPaid ? `Register & Pay ${priceDisplay}` : 'Register for Event';
            buttonAction = handleregistration;
            buttonClass = 'bg-green-600 text-white hover:bg-green-700';
            break;
    }


    


    // --- Render Main Page ---
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Toaster position="top-right" />
            
            {/* Ticket Modal */}
            {showTicketModal && event && <TicketModal event={event} onClose={() => setShowTicketModal(false)} />}
            
            {/* 1. Header and Banner */}
            {/* ... (Existing Banner/Header UI) ... */}
            <div className="relative h-[30rem] sm:h-130 overflow-hidden pb-5"> 
                {/* Banner Image (Nature Theme Background) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                    style={{ 
                        backgroundImage: `url(${event.banner_url || ''})`,
                        // Dark overlay for text readability
                        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)',
                        backgroundColor: '#1E2D2B' // Deep Green/Charcoal fallback
                    }}
                >
                    {/* Fallback color if no image */}
                    {!event.banner_url && <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>}
                </div>

                {/* Adjusted Outer Content Wrapper (Increased mobile top padding to pt-16 for overall shift down) */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pt-16 pb-4 sm:pb-8"> 
                    
                    {/* Back Button - Remains anchored to the top (z-10 ensures it's above the content shift) */}
                    <button
                        onClick={() => router.push('/event-page')}
                        className="absolute top-8 left-4 sm:left-6 lg:left-8 flex items-center text-gray-200 hover:text-green-400 transition text-sm bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-lg z-10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
                    </button>

                    {/* Main Title and Details (Added pt-12 to push content down and clear the back button) */}
                    <div className="flex flex-col pt-12 sm:pt-0">
                        <div className="flex items-center">
                            {/* Date Tag */}
                            <span className="text-base sm:text-xl font-medium text-gray-200">{formatEventDate(event.start_date, false)}</span>
                            {/* Upcoming Badge */}
                            {isUpcoming && (
                                <span className={`ml-3 px-3 py-1 text-xs font-bold rounded-full ${isPaid ? 'bg-green-600 text-white' : 'bg-green-400 text-gray-900'}`}>
                                    Upcoming
                                </span>
                            )}
                        </div>

                        {/* Main Title */}
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-lg" style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.8)' }}>
                            {event.title}
                        </h1>

                        {/* Sub-Details */}
                        <div className="flex flex-wrap items-center text-sm sm:text-lg text-gray-300 space-x-2 sm:space-x-4">
                            <span className="flex items-center mt-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-red-400" />
                                {event.location}
                            </span>
                            <span className="flex items-center mt-2">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-400" />
                                Organized by <a href="#" className="font-bold text-green-400 hover:underline ml-1">{event.organizer_name}</a>
                            </span>
                            <span className="flex items-center mt-2">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-400" />
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
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-6 lg:p-8 mt-[-1rem] sm:mt-[-3rem] relative">
                
                {/* 4. Main Content Cards (Left Column - Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Card B: Registration CTA (Modified) */}
                    
                        <div className="p-6 bg-gray-800 border border-green-600 rounded-xl shadow-2xl space-y-4">
                        <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">Registration</h3>
                        
                        {/* Ticket Info */}
                        <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                            <span className="text-3xl font-extrabold text-green-400">{priceDisplay}</span>
                            <span className="text-sm font-semibold text-gray-300">{isPaid ? 'Ticket Fee' : 'Entry Cost'}</span>
                        </div>
                       

                        {/* Action Buttons (Modified) */}
                        <button
                            onClick={buttonAction}
                            disabled={isButtonDisabled || !isUpcoming} // Disable if not upcoming as well
                            className={`w-full py-3 text-lg font-bold rounded-lg shadow-md transition duration-150 flex items-center justify-center
                                ${isButtonDisabled || !isUpcoming ? 'bg-gray-500 cursor-not-allowed' : buttonClass}`}
                        >
                            {isButtonDisabled && regStatus !== 'registered' ? <AlertTriangle className='w-5 h-5 mr-2' /> : null}
                            {buttonText}
                        </button>

                        {/* NEW: Show Ticket Button if Registered */}
                        {regStatus === 'registered' && (
                             <button
                                onClick={() => setShowTicketModal(true)}
                                className="w-full py-3 mt-2 border border-green-600 text-green-400 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white transition duration-150 font-bold"
                            >
                                <Ticket className="w-5 h-5 mr-2" /> View My Ticket
                            </button>
                        )}
                        

                        <button
                            // Conditional check for navigator.share is good practice
                            onClick={() => navigator.share ? navigator.share({ title: event.title, url: window.location.href }) : toast.error('Share function unavailable.')}
                            className="w-full py-3 border border-gray-600 text-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-700 transition duration-150"
                        >
                            <Share2 className="w-5 h-5 mr-2" /> Share Event
                        </button>
                    </div>

                    {/* Card A: About the Event */}
                    <Card title="About the Event" icon={<List />} className="bg-gray-800/90">

                    <p
                    className="text-gray-300 text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: (event.description || "Default description").replace(/\n/g, '<br />')
                    }}
                    />

                    </Card>

                    {/* Card B: Event Details and Timeline */}
                    <Card title="Event Details" icon={<Calendar />} className="bg-gray-800/90">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Essentials Section */}
                            <div className="space-y-3">
                            <h4 className="font-semibold text-white text-lg mb-2">Essentials</h4>

                            {/* Each Detail Item (Using the general DetailItem component for consistency) */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-green-500" />
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
                                <DollarSign className="w-5 h-5 text-green-400" />
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
                            <div className="space-y-3">
                            <h4 className="font-semibold text-white text-lg mb-2">Event Timeline</h4>
                            <div className="p-4 border-l-4 border-green-500 bg-gray-700/50 rounded-md space-y-2">
                                <p className="text-gray-300">
                                <span className="font-semibold text-white">Start Date:</span> {formatUTC(startDate)}
                                </p>
                                <p className="text-gray-300">
                                <span className="font-semibold text-white">End Date:</span> {formatUTC(endDate)}
                                </p>
                            </div>
                            </div>

                        </div>
                        </Card>
                    {/* Card C: Why Attend? (Value Proposition) (Moved to the bottom of the left column before the final standalone section) */}
                    <Card title="Why Attend?" icon={<Check className="text-green-500" />} className="lg:hidden block"> {/* Show only on mobile/md screens */}
                        <div className="space-y-5">
                            {WHY_ATTEND_POINTS.map((point, index) => (
                                <div key={index} className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-white" dangerouslySetInnerHTML={{ __html: point.title }} />
                                        <p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: point.detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    
                </div>

                {/* 3. Registration / CTA Sidebar (Right Column) */}
                <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 h-fit">
                    
                    {/* Card F: Event Information Summary (Chips) */}
                    <Card title="Event Summary" icon={<List />}>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {/* Chip 1: Price */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="text-xl font-bold text-green-400">{priceDisplay}</div>
                                <div className="text-xs text-gray-400 mt-1">Entry Fee</div>
                            </div>
                            {/* Chip 2: Max Participants */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="text-xl font-bold text-white">{event.max_participants || '∞'}</div>
                                <div className="text-xs text-gray-400 mt-1">Max Participants</div>
                            </div>
                            {/* Chip 3: Category */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="text-xl font-bold text-white">{event.category}</div>
                                <div className="text-xs text-gray-400 mt-1">Category</div>
                            </div>
                            {/* Chip 4: Duration */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="text-xl font-bold text-white">{duration}</div>
                                <div className="text-xs text-gray-400 mt-1">Duration</div>
                            </div>
                        </div>
                    </Card>

                    {/* Card D: Contact Information - Uses the fixed DetailItem */}
                    <Card title="Contact Information" icon={<User />}>
                        <div className="space-y-3">
                            <DetailItem icon={<Mail />} label="Email" value={event.contact_email} />
                            <DetailItem icon={<Phone />} label="Phone" value={event.contact_phone} />
                            <DetailItem icon={<User />} label="Organizer" value={event.organizer_name} />
                        </div>
                    </Card>
                    
                    {/* Card E: Quick Actions */}
                    <Card title="Quick Actions" icon={<ExternalLink />}>
                        <div className="flex flex-col space-y-2">
                            {/* Quick Action: Register/Pay Button */}
                            <button onClick={buttonAction} className="text-green-400 hover:text-green-500 text-left font-medium disabled:text-gray-500" disabled={isButtonDisabled}>
                                {regStatus === 'pending_payment' ? 'Complete Payment' : 'Register for Event'}
                            </button>
                            {/* Quick Action: View Ticket Button */}
                            {regStatus === 'registered' && (
                                <button onClick={() => setShowTicketModal(true)} className="text-green-400 hover:text-green-500 text-left font-medium">
                                    View My Ticket
                                </button>
                            )}
                            <button onClick={() => navigator.share ? navigator.share({ title: event.title, url: window.location.href }) : toast.error('Share function unavailable.')} className="text-gray-400 hover:text-gray-300 text-left font-medium">
                                Share with Friends
                            </button>
                            <a href={`mailto:${event.contact_email || 'support@example.com'}`} className="text-gray-400 hover:text-gray-300 text-left font-medium">
                                Ask a Question
                            </a>
                            <a href={`tel:${event.contact_phone || '#'}`} className="text-gray-400 hover:text-gray-300 text-left font-medium">
                                Call Organizer
                            </a>
                        </div>
                    </Card>

                </div>
            </div>

            {/* Card C: Why Attend? (Value Proposition) - Show on larger screens as a standalone section */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8'>
                    <Card title="Why Attend?" icon={<Check className="text-green-500" />} className="lg:block hidden">
                        <div className="space-y-5">
                            {WHY_ATTEND_POINTS.map((point, index) => (
                                <div key={index} className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-white" dangerouslySetInnerHTML={{ __html: point.title }} />
                                        <p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: point.detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
            </div>
        </div>
    );
}
