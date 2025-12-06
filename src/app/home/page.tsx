  'use client';
  
  import React, {useEffect, useState, useMemo, useRef } from 'react';
  import supabase from '@/api/client';
  import { motion } from "framer-motion";
  import Link from "next/link";
  import { Button } from '@/components/ui/button';
  import Loader from '@/components/ui/Loader';
  import { ArrowRight, Router } from 'lucide-react';
  import { useRouter } from 'next/navigation'; // add this at the top



  // Assuming lucide-react is available for icons
  import { Zap, Users, CheckCircle, Search, CreditCard, Ticket, Star, ChevronLeft, ChevronRight, Briefcase, Globe, TrendingUp, Cpu } from 'lucide-react';

  // --- 1. TYPE DEFINITIONS ---

  interface Stat {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }

  interface Event {
    id: string;             
    title: string;
    description: string;
    category?: string;
    location?: string;
    organizer_name?: string;
    start_date?: string;    
    end_date?: string;      
    ticket_price?: number;   // note: number, not string
    max_participants?: number;
    banner_url?: string;
  }

  interface Step {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
  }

  interface Testimonial {
    id: number;
    quote: string;
    name: string;
    role: string;
    rating: number; // 1 to 5
  }

  interface Partner {
    id: string;
    name: string;
    icon?: React.ReactNode;
    avatar_url?: string;
  }

  interface LogoMarqueeProps {
    partners: Partner[];
  }


  interface EventCardProps extends Event {
    onRegister?: (event: Event) => void; // optional callback for registration
  }
  // --- 2. MOCK DATA ---




  const MOCK_STEPS: Step[] = [
    {
      id: 1,
      icon: <Search className="w-8 h-8 text-cyan-400" />,
      title: 'Browse Events',
      description: 'Explore thousands of events across various categories and locations.',
    },
    {
      id: 2,
      icon: <CreditCard className="w-8 h-8 text-cyan-400" />,
      title: 'Register & Pay',
      description: 'Securely confirm and utilize multiple payment options for paid events.',
    },
    {
      id: 3,
      icon: <Ticket className="w-8 h-8 text-cyan-400" />,
      title: 'Get QR Ticket',
      description: 'Receive your unique, digital ticket directly via email.',
    },
    {
      id: 4,
      icon: <CheckCircle className="w-8 h-8 text-cyan-400" />,
      title: 'Check-in',
      description: 'Quick and easy access to the venue with your QR code.',
    },
  ];

  const MOCK_TESTIMONIALS: Testimonial[] = [
    {
      id: 1,
      quote: '"OPTIMUS transformed how I manage events. The QR check-in feature alone saved us hours at our last conference!"',
      name: 'Sarah Johnson',
      role: 'Event Organizer',
      rating: 5,
    },
    {
      id: 2,
      quote: '"The variety of events is incredible, and the booking process is seamless. Highly recommend this platform."',
      name: 'Michael Chen',
      role: 'Frequent Attendee',
      rating: 5,
    },
  ];



  // --- 3. SUB-COMPONENTS ---



  const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex justify-center my-3">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 transition-colors duration-200 ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  );

  const EventCard: React.FC<EventCardProps> = (event) => {
  const handleRegister = () => {
    console.log("Register clicked for event:", event.id);
    // TODO: Call your Supabase registration API here
    // Example:
    // supabase.from('registrations').insert({ event_id: event.id, user_id: currentUser.id });
    if (event.onRegister) event.onRegister(event);
  };

  return (
    <div className="bg-[#181d29] rounded-xl shadow-2xl overflow-hidden flex-shrink-0 w-full max-w-full snap-center hover:scale-[1.01] transition-transform duration-300 border border-[#1f2430]">
      {/* Image with overlays */}
      <div className="relative h-40 flex items-center justify-center">
        <img
          src={event.banner_url ? event.banner_url : '/placeholder.png'}
          alt={event.title}
          className="w-full h-full object-cover max-w-full"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <span className="absolute top-2 right-2 z-10 bg-cyan-600 text-white text-sm font-bold px-3 py-1 rounded-full">
          {event.ticket_price ? `$${event.ticket_price}` : 'Free'}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-cyan-400" />
            <span>
              {event.start_date
                ? new Date(event.start_date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
                : ''}
              {' '}
            </span>
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-cyan-400" />
            <span>{event.organizer_name}</span>

          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="mt-3 sm:mt-4 md:mt-5 w-full bg-cyan-600 hover:bg-cyan-500 transition duration-200 text-white font-semibold text-sm sm:text-base py-2 sm:py-2.5 rounded-lg shadow-lg"
        >
          Register Now
        </button>
      </div>
    </div>
  );
};


  const HowItWorksStep: React.FC<{ step: Step }> = ({ step }) => (
    // The line is handled by the parent container's CSS
    <div className="relative h-full z-10">
      <div className="bg-[#1f2430] rounded-xl p-3 sm:p-4 md:p-6 pt-4 sm:pt-6 md:pt-10 shadow-2xl border border-[#2c3240] h-full flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-300">

        {/* 1. Number at Top Left */}
        <span className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-cyan-600 border-2 border-cyan-400 rounded-full shadow-lg z-20">
          {step.id}
        </span>

        {/* 2. Increased Icon Size (moved to top center) */}
        <div className="mx-auto mb-4 sm:mb-5 md:mb-6 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center bg-[#181d29] rounded-full border-2 border-cyan-400 shadow-xl">
          {/* Adjusted icon size class directly here (w-10 h-10 is larger than w-8 h-8 used previously) */}
        {React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 text-cyan-400" })}
        </div>

        {/* 3. Content below Icon (vertical layout) */}
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">{step.title}</h3>
        <p className="text-xs sm:text-sm text-gray-400 px-1">{step.description}</p>
      </div>
    </div>
  );

  const TestimonialSection: React.FC = () => {
    const [current, setCurrent] = useState(0);

    const total = MOCK_TESTIMONIALS.length;
    const testimonial = MOCK_TESTIMONIALS[current];

    const next = () => setCurrent((prev) => (prev + 1) % total);
    const prev = () => setCurrent((prev) => (prev - 1 + total) % total);

    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full overflow-x-hidden">
        <h2 className="text-xs sm:text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-1 fade-down">
          What People Say
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-6 sm:mb-8 md:mb-12 px-2 fade-up animate-delay-100">
          Hear from our community of event organizers and attendees
        </p>

        <div className="relative max-w-full sm:max-w-2xl mx-auto bg-[#181d29] rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-[#1f2430] mx-2 sm:mx-auto fade-in-scale animate-delay-200">
          <StarRating rating={testimonial.rating} />
          <p className="text-sm sm:text-base md:text-lg lg:text-xl italic text-gray-200 leading-relaxed px-2">
            {testimonial.quote}
          </p>
          <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-700 flex flex-col items-center">
            {/* Avatar Placeholder */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base">
              {testimonial.name.charAt(0)}
            </div>
            <p className="text-sm sm:text-base md:text-lg font-semibold text-white">{testimonial.name}</p>
            <p className="text-xs sm:text-sm text-cyan-400">{testimonial.role}</p>
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition hidden md:block"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition hidden md:block"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          {/* Mobile Dots */}
          <div className="flex justify-center space-x-2 mt-6 md:hidden">
            {MOCK_TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current ? 'bg-cyan-500 w-4' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

const LogoMarquee: React.FC<LogoMarqueeProps> = ({ partners }) => {
    const allPartners = useMemo(() => [...partners, ...partners], [partners]);

    return (
      <section className="py-6 sm:py-8 md:py-10 border-gray-800 overflow-hidden w-full max-w-[90%] sm:max-w-[85%] md:max-w-[80%] mx-auto my-8 sm:my-12 md:my-16 rounded-lg">
        {/* <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-300">
            Trusted by leading organizations 
          </h3>
        </div> */}

        <div className="w-full overflow-hidden border-t border-b">
          <div className="flex whitespace-nowrap animate-marquee">
            {allPartners.map((partner, index) => (
              <div
              key={`${partner.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center w-48 sm:w-56 md:w-64 h-12 sm:h-14 md:h-16 opacity-70 hover:opacity-100 transition duration-300 group px-2"
              >
                <div className="mr-1 sm:mr-2">{partner.icon}</div>
                <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white group-hover:text-cyan-400 transition whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
    

        {/* Inline Tailwind animation */}
        <style jsx global>{`
          @layer utilities {
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 20s linear infinite;
            }
          }
        `}</style>
      </section>
    );
  };



  // --- 4. MAIN COMPONENT (App) ---

  const App: React.FC = () => {
    // Use ref to target the scrollable container for featured events
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // initialize router




    useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true); // start loading

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gt('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError.message);
      } else if (eventsData) {
        const formattedEvents: Event[] = eventsData.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          category: e.category,
          location: e.location,
          organizer_name: e.organizer_name,
          start_date: e.start_date,
          end_date: e.end_date,
          ticket_price: e.ticket_price,
          max_participants: e.max_participants,
          banner_url: e.banner_url,
        }));
        setEvents(formattedEvents);
      }

      // Fetch partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: true });

      if (partnersError) {
        console.error('Error fetching organizations:', partnersError.message);
      } else if (partnersData) {
        const formattedPartners: Partner[] = partnersData.map((org: any) => ({
          id: org.id,
          name: org.name,
          avatar_url: org.avatar_url,
          icon: org.avatar_url ? (
            <img src={org.avatar_url} alt={org.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center">
              {org.name[0]}
            </div>
          ),
        }));
        setPartners(formattedPartners);
      }
    } finally {
      setLoading(false); // stop loading
    }
  };

  fetchData();
}, []);

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f18]">
      <Loader />
    </div>
  );
}


    // Function to handle horizontal scrolling of the event carousel
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            // Scroll amount equal to roughly one card width (350px)
            const scrollAmount = 350;
            if (direction === 'left') {
                scrollContainerRef.current.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth',
                });
            } else {
                scrollContainerRef.current.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth',
                });
            }
        }
    };

    // Custom dark background color and gradient for the hero section
    const heroStyle: React.CSSProperties = {
      backgroundColor: '#0a0f18',
      backgroundImage:
        'radial-gradient(at 10% 20%, #0d121c 0%, #172a3a 50%, #0a0f18 100%)',
    };

    return (
      <div className="min-h-screen font-sans w-full overflow-x-hidden max-w-full" style={heroStyle}>
        {/* -------------------- HERO SECTION -------------------- */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-10 md:pt-24 md:pb-32 text-center w-full max-w-full px-4">

      {/* ================= BACKGROUND + GLOW ================= */}
      <div className="absolute inset-0 [background:var(--gradient-hero)]" />

      {/* Glow you already had */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] bg-cyan-500 rounded-full mix-blend-lighten opacity-50 blur-[100px] absolute -top-[10%] -left-[10%]"></div>
        <div className="w-[70vw] h-[70vw] sm:w-[60vw] sm:h-[60vw] bg-indigo-500 rounded-full mix-blend-lighten opacity-50 blur-[120px] absolute -bottom-[10%] -right-[10%]"></div>
      </div>

      {/* ================= ROTATING DECORATIVE CIRCLES ================= */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full opacity-30"
        >
          <div className="w-full h-full rounded-full border border-cyan-400/20" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full opacity-20"
        >
          <div className="w-full h-full rounded-full border border-indigo-400/20" />
        </motion.div>
      </div>

      {/* ================= FLOATING GRADIENT BLOBS ================= */}
      <motion.div
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-400 opacity-20 blur-xl"
      />

      <motion.div
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 opacity-20 blur-xl"
      />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 w-full pt-20">
        

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold text-white mb-4 sm:mb-6 leading-tight px-2 fade-up animate-delay-100">
          Discover and Host <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 drop-shadow-lg">
            Amazing Events
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2 fade-in animate-delay-200">
          Connect with thousands of attendees, manage registrations effortlessly,
          and create unforgettable experiences with OPTIMUS.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2 fade-up animate-delay-300">
            <Link href="/event-page" className="w-full sm:w-auto">
              <Button className="group bg-transparent border-2 border-cyan-500 hover:bg-cyan-600 hover:border-cyan-600 text-white font-bold text-sm sm:text-base md:text-lg gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:p-5 rounded-md flex items-center justify-center w-full sm:w-auto">
                Explore Events
              </Button>
            </Link>
            <Link href="/dashboard/{userID}" className="w-full sm:w-auto">
              <Button className="group bg-cyan-500 hover:border-cyan-600 text-white font-bold text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2.5 sm:py-3 md:p-5 flex items-center justify-center gap-2 w-full sm:w-auto">
                Host Your Event
              </Button>
            </Link>
          </div>

      </div>
    </section>
        
        {/* -------------------- NEW LOGO MARQUEE SECTION -------------------- */}
        <LogoMarquee partners={partners}/>

        {/* -------------------- FEATURED EVENTS SECTION -------------------- */}
        <section className="py-8 sm:py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4 fade-up">
            <div className="w-full sm:w-auto">
              <h2 className="text-xs sm:text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-1">
                Featured Events
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white">
                Discover the most popular events happening soon
              </p>
            </div>
            {/* NAVIGATION BUTTONS: Now functional */}
            <div className="flex space-x-2 text-gray-500 hidden sm:flex">
              <button 
                onClick={() => scroll('left')}
                className="p-2 border border-gray-700 rounded-full hover:bg-[#181d29] transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-2 border border-gray-700 rounded-full hover:bg-[#181d29] transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Event Cards Carousel (Horizontal Scroll on mobile) */}
          <div
            ref={scrollContainerRef} // Ref attached here for scrolling control
            className="flex space-x-4 sm:space-x-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide w-full max-w-full"
          >
            {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                onRegister={() => {
                  router.push(`/event-page`);
                  // Add API call logic here if needed
                }}
              />
            ))
          ) : (
            <p className="text-gray-400">Loading events...</p>
          )}

            {/* Faked scrollbar utility for better mobile experience */}
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }

              /* --- BACKGROUND ANIMATION KEYFRAMES --- */
              @keyframes moveGlow1 {
                0% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(20%, 30%) scale(1.1); }
                100% { transform: translate(0, 0) scale(1); }
              }

              @keyframes moveGlow2 {
                0% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(-20%, -30%) scale(1.2); }
                100% { transform: translate(0, 0) scale(1); }
              }

              .glow-blur-1 {
                animation: moveGlow1 30s ease-in-out infinite;
              }

              .glow-blur-2 {
                animation: moveGlow2 35s ease-in-out infinite alternate;
              }
              
              /* --- CSS for How It Works Steps Line (Desktop) --- */
              .steps-container {
                position: relative;
              }
              
              /* Draw the thin connecting line behind the step boxes on large screens */
              @media (min-width: 1024px) { /* lg breakpoint */
                .steps-container::before {
                  content: '';
                  position: absolute;
                  top: 50%; /* Center vertically */
                  left: 0;
                  right: 0;
                  height: 2px;
                  background-color: rgba(6, 182, 212, 0.4); /* Cyan/Blue, semi-transparent */
                  z-index: 1;
                  transform: translateY(-50%);
                }
              }
              
              /* --- CSS for Logo Marquee (Infinite Scroll) --- */
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); } /* Slides one full copy of the list */
              }
              .marquee-container {
                overflow: hidden;
                white-space: nowrap;
              }
              .marquee-content {
                display: flex;
                width: 200%; /* Must be double to hold two copies of the logos */
                animation: marquee 30s linear infinite;
              }
            `}</style>
          </div>
        </section>

        {/* -------------------- HOW IT WORKS SECTION -------------------- */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full overflow-x-hidden">
          <h2 className="text-xs sm:text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-1 fade-down">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-6 sm:mb-8 md:mb-12 px-2 fade-up animate-delay-100">
            Get started with OPTIMUS in four simple steps
          </p>
          
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-6 sm:mt-8 md:mt-12 steps-container">
            {MOCK_STEPS.map((step, index) => (
              <div key={step.id} className={`fade-in-scale animate-delay-${(index + 1) * 100}`}>
                <HowItWorksStep step={step} />
              </div>
            ))}
          </div>
        </section>

        {/* -------------------- TESTIMONIAL SECTION -------------------- */}
        <TestimonialSection />

        {/* -------------------- FOOTER (Basic) -------------------- */}
        
      </div>
    );
  };

  export default App;