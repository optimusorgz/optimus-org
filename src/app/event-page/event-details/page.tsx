// src/app/event-page/event-details/page.tsx

// 🛑 DO NOT put "use client" here. This must remain a Server Component.
import { Suspense } from 'react';
import EventDetailsClientContent from './EventDetailsClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        // Skeleton layout roughly matching banner + content grid.
        <div className="min-h-screen bg-gray-900 text-white font-sans w-full overflow-x-hidden max-w-full">
          <div className="relative h-[25rem] sm:h-[30rem] md:h-[35rem] lg:h-[40rem] overflow-hidden pb-5 w-full max-w-full">
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex flex-col justify-end pt-12 sm:pt-16 pb-4 sm:pb-6 md:pb-8 w-full">
              <div className="flex flex-col space-y-3 max-w-xl">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 md:p-6 lg:p-8 mt-[-1rem] sm:mt-[-2rem] md:mt-[-3rem] relative w-full overflow-x-hidden">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 md:space-y-8">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <EventDetailsClientContent />
    </Suspense>
  );
}