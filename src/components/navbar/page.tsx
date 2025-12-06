// components/Navbar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
// Importing the Supabase client utility correctly
import { createClient } from '@supabase/supabase-js'; // Assuming your client utility uses createClient or similar
import supabaset from '@/api/client'; // Corrected import name: supabaset
import AuthContent from '@/components/auth/Auth';
import ProfileSettingsForm from '@/components/form/profilesetting/ProfileSettingsForm';
import Logo from '../../../public/optimuslogo.png';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogHeader
} from '@/components/ui/dialog';
import { set } from 'date-fns';

// --- Types and Data ---

interface NavItem {
    name: string;
    href: string;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/event-page' },
    // { name: 'Post', href: '/posts' },
    { name: 'Join Us', href: 'form/joinus' },
]

// The base profile menu items
const baseProfileMenuItems: NavItem[] = [
    { name: 'Profile', href: '/profile' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', href: '#' },
];

// New item for Admin Dashboard
const adminDashboardItem: NavItem = { name: 'Admin Dashboard', href: '/admin-dashboard/${userId}' };



// --- Component ---

const Navbar: React.FC = () => {
    const router = useRouter();
    const supabase = supabaset;            
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null); 
    // components/Navbar.tsx (Inside Navbar component)
    const [avatarUrl, setAvatarUrl] = useState<string>('https://via.placeholder.com/150/007bff/ffffff?text=U');

    // Helper function to fetch user profile role (Corrected for role_type)
    const fetchUserProfile = async (id: string) => { // Renamed from fetchUserRole for clarity
        const { data, error } = await supabase
            .from('profiles')
            // FIX: Combine both fields into a single .select() string
            .select('role_type, avatar_url') 
            // NOTE: I'm using 'avatar_url' (snake_case) as is common in Supabase, 
            // please verify if your column is actually named 'avtar_url' or 'avatar_url'.
            .eq('uuid', id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error); 
            // Return a structured object with nulls/defaults on error
            return { 
                role: null, 
                avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=U' 
            };
        }

        // FIX: Return an object containing both values
        return { 
            role: data?.role_type || null, 
            avatar: data?.avatar_url || 'https://via.placeholder.com/150/007bff/ffffff?text=U' 
        }; 
    }

    // 1. Session Check and Listener
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const id = session.user.id;
                setIsLoggedIn(true);
                setUserId(id); 
                const role = await fetchUserProfile(id);
                setUserRole(role.role);
                setAvatarUrl(role.avatar); // Set avatar URL from profile data
            } else {
                setIsLoggedIn(false);
                setUserId(null);
                setUserRole(null); 
            }
        };
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const id = session.user.id;
                setIsLoggedIn(true);
                setUserId(id);
                fetchUserProfile(id).then(role => {
                    setUserRole(role.role);
                    setAvatarUrl(role.avatar); // Set avatar URL from profile data
                });
            } else {
                setIsLoggedIn(false);
                setUserId(null);
                setUserRole(null); 
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, [supabase]);

    // 2. Logout Handler
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setIsProfileMenuOpen(false);
        setIsAuthModalOpen(false);
        setUserId(null);
        setUserRole(null); 
        router.push('/');
    };

    // 3. Auth Success Handler
    const handleAuthSuccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setUserId(user.id); 
            
            const role = await fetchUserProfile(user.id);
            setUserRole(role.role);
            setAvatarUrl(role.avatar); // Set avatar URL from profile data

            router.push(`/dashboard/${user.id}`); 
        }
    };
    
    // 4. Settings Modal Handlers
    const handleSettingsClick = () => {
        setIsProfileMenuOpen(false); 
        setIsSettingModalOpen(true); 
    }

    const handleSettingsUpdateComplete = () => {
        setIsSettingModalOpen(false);
    };


    // Dashboard Link Generation: If userId exists, use a dynamic path.
    const dashboardHref = userId ? `/dashboard/${userId}` : '/dashboard';

    // 🌟 CONDITIONAL MENU CREATION LOGIC (Role is 'admin')
    let updatedProfileMenuItems = [...baseProfileMenuItems];

    // Check if the user is an 'admin' and add the Admin Dashboard
    if (userRole === 'organiser' || userRole === 'admin') { // <-- Role changed to 'admin'
        updatedProfileMenuItems.unshift(adminDashboardItem); 
    }

    // Map profile menu items, replacing the generic Dashboard link
    updatedProfileMenuItems = updatedProfileMenuItems.map(item => {
        if(item.name === 'Dashboard') {
            return { ...item, href: dashboardHref };
        }
        return item;
    });

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10 w-full max-w-full overflow-x-hidden">
            <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-full">
                <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

                    {/* Logo and App Name (omitted for brevity) */}
                    <div className="flex items-center flex-shrink-0">
                        {/* <div className="flex-shrink-0 bg-cyan-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg mr-2"> O </div>
                        <span className="text-white text-xl font-semibold tracking-wider"> Optimus </span> */}

                        <img src={Logo.src} alt="Optimus Logo" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-full object-contain" />
                    </div>

                    <div className="flex-1 flex justify-center min-w-0">

                        {/* Desktop Navigation Links - Modern Link Usage (No <a> tag needed) */}
                        <div className="hidden md:flex space-x-2 lg:space-x-4">
                            {navItems.map((item) => (
                               <Link 
                                    key={item.name} 
                                    href={item.href} 
                                    className="text-gray-300 hover:bg-gray-800 hover:text-cyan-400 px-2 lg:px-3 py-2 rounded-md text-sm lg:text-base xl:text-xl font-medium transition duration-150 ease-in-out whitespace-nowrap"
                                    >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">

                        {/* Search Button (omitted for brevity) */}
                        
                        {/* Authentication (Sign In Button or Profile Menu) */}
                        {!isLoggedIn ? (
                            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 px-3 sm:px-4 rounded-lg transition duration-150 ease-in-out text-xs sm:text-sm whitespace-nowrap">
                                        Sign In
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                                    <DialogHeader className="sr-only">
                                        <DialogTitle>Authentication</DialogTitle>
                                    </DialogHeader>
                                    
                                    <AuthContent onSuccess={handleAuthSuccess} />
                                </DialogContent>
                            </Dialog>

                        ) : (
                            // Profile Menu when logged in
                            <div className="relative">
                                {/* Profile Picture Button (omitted for brevity) */}
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white p-0.5"
                                    aria-expanded={isProfileMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <img className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-600 border-2 border-white object-cover" src={avatarUrl} alt="User Profile" />
                                    <svg className={`ml-0.5 sm:ml-1 h-3 w-3 sm:h-4 sm:w-4 text-white transform ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown Menu */}
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 md:w-64 rounded-lg shadow-lg py-1 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] max-w-[90vw]"
                                        role="menu"
                                        tabIndex={-1}
                                        >
                                        {updatedProfileMenuItems.map((item) => {
                                            const className =
                                            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors duration-150 ease-in-out rounded-md";

                                            const isAction = item.name === "Logout" || item.name === "Settings";

                                            if (isAction) {
                                            const handleClick = item.name === "Logout" ? handleLogout : handleSettingsClick;
                                            return (
                                                <div
                                                key={item.name}
                                                onClick={handleClick}
                                                className={`${className} cursor-pointer`}
                                                role="menuitem"
                                                tabIndex={-1}
                                                >
                                                {item.name}
                                                </div>
                                            );
                                            }

                                            return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={className}
                                                role="menuitem"
                                                tabIndex={-1}
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                            );
                                        })}
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Profile Settings Dialog --- */}
            {userId && (
                <Dialog 
                    open={isSettingModalOpen}
                    onOpenChange={setIsSettingModalOpen}
                >
                    <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                        
                        
                        <ProfileSettingsForm 
                            userId={userId} 
                            onUpdateComplete={handleSettingsUpdateComplete}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </nav>
    );
};

export default Navbar;