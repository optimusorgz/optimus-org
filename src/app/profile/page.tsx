'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/client';
import ProfileSettingsForm from '@/components/form/profilesetting/ProfileSettingsForm';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Loader from '@/components/ui/Loader';

import {
  CalendarIcon,
  TicketIcon,
  BuildingIcon,
  LogOutIcon,
  LayoutDashboardIcon
} from 'lucide-react';

/* -------------------------- Interfaces -------------------------- */
interface UserProfile {
  uuid: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
}

interface EventItem {
  id: string;
  title: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  image_url: string;
}

/* -------------------------- Main Component -------------------------- */
const ProfileDashboard = () => {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventcnt, setEventcnt] = useState(0);
  const [hostcnt, setHostcnt] = useState(0);
  const [isorg, setIsorg] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);


  /* ---------------- Fetch Profile ---------------- */
  const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  setUserId(user.id); // ⭐ STORE USER ID

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('uuid', user.id)
    .single();

  setProfile(profileData);

  const organisation_id = profileData?.organisation_id || null;
  if (organisation_id) setIsorg(true);

  const role = profileData?.role_type?.toLowerCase();
  if (role === "admin" || role === "organiser") setIsAdmin(true);
};


  /* ---------------- Fetch Events ---------------- */
  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('event_registrations')
      .select(`
        event_id,
        events ( id, title, banner_url )
      `)
      .eq('user_id', user.id);

    const formatted: EventItem[] =
      data?.map((item: any) => ({
        id: item.events.id,
        title: item.events.title,
        image_url: item.events.banner_url,
        status: 'Confirmed'
      })) || [];

    setEvents(formatted);
    setEventcnt(formatted.length);
  };

  /* ---------------- Logout ---------------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    fetchProfile();
    fetchEvents();
  }, []);

  if (!profile) return <div className="flex items-center justify-center min-h-screen bg-gray-900">
  <Loader />
</div>
;

  return (
    <div className="h-fit p-4 sm:p-6 md:p-8 pb-20 sm:pb-24 md:pb-28 space-y-6 sm:space-y-8 relative mt-12 sm:mt-15 w-full max-w-[95%] sm:max-w-[90%] mx-auto overflow-x-hidden">

      {/* BG EFFECTS */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="glow-blur-1 w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] bg-cyan-500 rounded-full mix-blend-lighten opacity-50 blur-[100px] absolute -top-[10%] -left-[10%]"></div>
        <div className="glow-blur-2 w-[70vw] h-[70vw] sm:w-[60vw] sm:h-[60vw] bg-indigo-500 rounded-full mix-blend-lighten opacity-50 blur-[120px] absolute -bottom-[10%] -right-[10%]"></div>
      </div>

      {/* PROFILE HEADER */}
      <div className="border-1 p-4 sm:p-5 md:p-6 rounded-2xl flex flex-col items-center space-y-3 sm:space-y-4 bg-gradient-to-r from-cyan-900 to-indigo-1000 drop-shadow-lg relative z-10 w-full max-w-full">
        <img
          src={profile.avatar_url || 'https://placehold.co/100x100'}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-800 object-cover"
          alt="Profile"
        />
        <h1 className="text-xl sm:text-2xl text-white text-center">{profile.name}</h1>
        <p className="text-sm sm:text-base text-gray-400 text-center break-all">{profile.email}</p>

        {/* EDIT PROFILE BUTTON */}
        <button
          onClick={() => setShowProfileForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-2 text-sm sm:text-base w-full sm:w-auto"
        >
          Edit Profile
        </button>
      </div>

      {/* STATS */}
      {isorg && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10 w-full">
          <div className="bg-gray-800/90 border border-gray-700 p-3 sm:p-4 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <BuildingIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-300 text-center">Events Participated</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{eventcnt}</p>
          </div>

          <div className="bg-gray-800/90 border border-gray-700 p-3 sm:p-4 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <TicketIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-300 text-center">Events Hosted</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{hostcnt}</p>
          </div>

          <div className="bg-gray-800/90 border border-gray-700 p-3 sm:p-4 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-300 text-center">Organisations</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">1</p>
          </div>
        </div>
      )}

      {/* EVENTS */}
      <div className="space-y-3 mt-4 relative z-10 w-full">
        <h2 className="text-lg sm:text-xl text-white font-bold">Registered Events</h2>

        {events.length === 0 && (
          <p className="text-gray-500 text-sm sm:text-base">No registered events.</p>
        )}

        {events.map(event => (
          <div key={event.id} className="bg-gray-800 p-3 sm:p-4 rounded-xl flex items-center space-x-3 sm:space-x-4 w-full max-w-full">
            <img src={event.image_url} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0" alt={event.title} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm sm:text-base truncate">{event.title}</p>
              <p className="text-gray-400 text-xs sm:text-sm">Registered</p>
            </div>
            
          </div>
        ))}
      </div>

      {/* ADMIN + LOGOUT */}
      <div className="space-y-3 sm:space-y-4 relative z-10 w-full">
        {isAdmin && (
          <button
            onClick={() => router.push(`/admin-dashboard/${userId}`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base"
          >
            <LayoutDashboardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Admin Dashboard
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm sm:text-base"
        >
          <LogOutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          Logout
        </button>
      </div>

      {/* ------------------ PROFILE SETTINGS MODAL ------------------ */}
      <Dialog open={showProfileForm} onOpenChange={setShowProfileForm}>
        <DialogContent className="sm:max-w-md w-full p-6 bg-gray-900 rounded-xl shadow-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          
          {/* Accessibility: DialogTitle */}
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>

          <ProfileSettingsForm
            userId={profile.uuid}
            onUpdateComplete={() => setShowProfileForm(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProfileDashboard;
