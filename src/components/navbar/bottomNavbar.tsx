"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import createClientComponentClient from '@/api/client';
import toast, { Toaster } from 'react-hot-toast';

const supabase = createClientComponentClient;

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean; // Only show toast if login required
}

// --- Icons ---
const HomeIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const EventsIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M8 21h14a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const JoinIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-1-10v-3m0 3h-3m0 0h3m0 0v3m0-3h3m-3 0v3m0-3h3" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.121 17.804A13.937 13.937 0 0112 18c2.61 0 8.08.773 7.121 2.074M18 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v18H3V3zm4 4h4v4H7V7zm0 6h4v4H7v-4zm6-6h4v4h-4V7zm0 6h4v4h-4v-4z" />
  </svg>
);

const BottomNavbar: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === href;
    return currentPath.startsWith(href);
  };

  const mobileNavItems: NavItem[] = [
    { name: 'Join Us', href: '/form/joinus', icon: <JoinIcon /> },
    { name: 'Events', href: '/event-page', icon: <EventsIcon /> },
    { name: 'Home', href: '/', icon: <HomeIcon /> },
    { name: 'Dashboard', href: userId ? `/dashboard/${userId}` : '/dashboard', icon: <DashboardIcon />, requiresAuth: true },
    { name: 'Profile', href: '/profile', icon: <ProfileIcon />, requiresAuth: true },
  ];

  const handleNavClick = (item: NavItem) => {
    // Only show toast if the link requires login and user is not logged in
    if (item.requiresAuth && !userId) {
      toast.error('Please login first!');
      return;
    }
    router.push(item.href);
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-gray-900 border-t border-gray-700 shadow-inner w-full max-w-full overflow-x-hidden">
        <div className="flex justify-around items-center h-16 sm:h-20 px-1 sm:px-2 max-w-full">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            return (
                <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center justify-center text-sm font-medium transition duration-150 ease-in-out relative"
                >
                {/* Circle background */}
                <span
                    className={`absolute top-1/2 left-1/2 w-16 h-16 sm:w-20 sm:h-20 -translate-x-1/2 -translate-y-1/2 rounded-3xl transition-colors duration-200
                    ${active ? 'bg-cyan-900' : 'bg-transparent group-hover:bg-cyan-600'}`}
                ></span>

                {/* Icon */}
                <div
                    className={`flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 relative z-10 ${
                    active ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {item.icon}
                </div>

                
                </button>
            );
            })}

        </div>
      </nav>
    </>
  );
};

export default BottomNavbar;
