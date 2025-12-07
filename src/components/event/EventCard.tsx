import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    ticket_price: number | null;
    category: string;
    banner_url: string | null;
    organizer_name: string;
  };
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const isFree = (event.ticket_price ?? 0) === 0;
  const isEnded = new Date(event.end_date) < new Date();
  const dateObj = new Date(event.start_date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="opacity-0" data-animate-on-visible="fade-up" style={{ animationDelay: `${(index || 0) * 0.1}s` }}>
      <Link href={`/event-page/event-details?id=${event.id}`}>
      <div
        className="
          w-full max-w-full m-auto sm:max-w-[90%] md:max-w-[420px]
          rounded-2xl overflow-hidden bg-[#0f172a] 
          border border-gray-800
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          group transition-all duration-300 
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]
          hover:-translate-y-2
        "
      >          
          {/* IMAGE SECTION */}
          <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
            <img
              src={event.banner_url || "/placeholder.jpg"}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 max-w-full"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 to-transparent" />

            {/* Category */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 backdrop-blur-md border border-blue-500/30">
                {event.category || "Event"}
              </span>
            </div>

            {/* Price */}
            <div className="absolute top-4 right-4">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border",
                  isFree
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-gray-900/40 text-white border-gray-700"
                )}
              >
                {isFree ? "Free" : `₹${event.ticket_price}`}
              </span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 space-y-2 sm:space-y-3">

            {/* Title */}
            <h3 className="font-bold text-base sm:text-lg md:text-xl text-white leading-tight group-hover:text-blue-400 transition line-clamp-2">
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-3 hidden sm:hidden">
              {event.description}
            </p>

            {/* DETAILS LIST */}
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
              
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{formattedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">Organizer: {event.organizer_name}</span>
              </div>

            </div>

            {/* CTA BUTTON */}
            {isEnded ? (
              <div
                className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 md:py-4 
                          text-sm sm:text-base font-semibold rounded-xl
                          bg-green-700 text-white-300 text-center 
                          border border-gray-600 cursor-not-allowed"
              >
                Completed
              </div>
            ) : (
              <Button
                className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 md:py-4 
                          text-sm sm:text-base font-semibold rounded-xl 
                          bg-gradient-to-r from-blue-500 to-cyan-400 
                          hover:from-blue-600 hover:to-cyan-500 transition"
              >
                Register Now
              </Button>
            )}


          </div>

        </div>
      </Link>
    </div>
  );
}
