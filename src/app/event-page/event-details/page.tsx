// src/app/event-page/event-details/page.tsx

// 🛑 DO NOT put "use client" here. This must remain a Server Component.
import { Suspense } from 'react';
import EventDetailsClientContent from './EventDetailsClient'; 
import Loader from '@/components/ui/Loader';

export default function EventDetailsPage() {
    return (
        <Suspense fallback={
            // ... your loading UI (uses Tailwind CSS)
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mb-4" />
                <div className='flex items-center justify-center min-h-screen'>
                    <Loader />
                </div>
            </div>
        }>
            <EventDetailsClientContent />
        </Suspense>
    );
}