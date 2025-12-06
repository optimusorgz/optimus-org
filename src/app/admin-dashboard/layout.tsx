// /src/app/dashboard/layout.tsx
'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin-dashboard/sidebar';
import { Menu } from 'lucide-react';
import createClient from '@/api/client'; // Assuming this is your CLIENT-SIDE Supabase client utility
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserProvider } from '@/context/UserContext';

// Define the target role for dashboard access
const REQUIRED_ROLES = ['organiser', 'admin']; // array of allowed roles

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    // ⚠️ FIX 1: Initialize the Supabase client by CALLING the createClient function
    const supabase = createClient; 

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const fetchUser = async () => {
            let currentUserId: string | null = null;
            let accessGranted = false;

            try {
                // 1. Check Authentication
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session?.user) {
                    toast.error('You must be logged in to access this page.');
                    router.push('/');
                    return;
                }

                currentUserId = session.user.id;

                // 2. Check Role Type
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role_type')
                    .eq('uuid', currentUserId)
                    .single();

              if (profileError || !profile || !REQUIRED_ROLES.includes(profile.role_type)) {
                    toast.error(`Access denied. Must be one of: ${REQUIRED_ROLES.join(', ')}.`);
                    router.push('/');
                    return;
                }


                // If code reaches here, authentication and role check passed
                accessGranted = true;
                setUserId(currentUserId);

            } catch (error) {
                console.error("Dashboard Auth Error:", error);
                toast.error('An unexpected error occurred during authorization.');
                router.push('/');
            } finally {
                setLoading(false);
                // Redirect if access was not granted in the try block
                if (!accessGranted) {
                    // This is mostly a fallback since successful checks already call setUserId/setLoading
                    // and failed checks already redirect.
                }
            }
        };

        fetchUser();
    // Dependency array updated to ensure it re-runs if router or supabase changes (though supabase is stable here)
    }, [router]); 

    if (loading) return <p className="text-center text-gray-300 py-10">Loading...</p>;
    
    // Redirect should happen inside useEffect, but this handles the split-second render before redirect
    if (!userId) return null; 

    return (
        // The component is wrapped in UserProvider only if the user is authorized and userId is set
        <UserProvider value={{ userId }}>
            <div className="flex h-screen bg-gray-900 w-full overflow-x-hidden max-w-full">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} userId={userId} />
                <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                    <header className="flex items-center p-3 sm:p-4 bg-gray-800 border-b border-gray-700 shadow-md md:hidden w-full">
                        <button onClick={toggleSidebar} className="text-gray-300 mr-3 sm:mr-4 flex-shrink-0">
                            <Menu size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <h1 className="text-base sm:text-lg font-semibold text-white truncate">Admin Dashboard</h1>
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-900 w-full max-w-full">
                        {children}
                    </main>
                </div>
            </div>
        </UserProvider>
    );
}