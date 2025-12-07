'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/client';
import { Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            // Get the current session after redirect
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                toast.error('Login failed. Please try again.');
                router.push('/404'); // or redirect to login page
                return;
            }

            if (session) {
                // User is logged in
                toast.success('✅ Successfully logged in!');
                router.push('/event-page'); // redirect to desired page
            } else {
                // No session (user not logged in)
                router.push('/404'); // show 404
            }
        }

        handleAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
            <p className="text-xl">Logging you in...</p>
            <Toaster position="top-right" />
        </div>
    );
}
