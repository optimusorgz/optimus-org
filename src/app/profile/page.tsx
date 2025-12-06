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

  /* ---------------- Fetch Profile ---------------- */
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    router.push('/login');
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
    <div className="h-fit p-8 pb-28 space-y-8 relative mt-15 w-[90%] mx-auto">

      {/* BG EFFECTS */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="glow-blur-1 w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] bg-cyan-500 rounded-full mix-blend-lighten opacity-50 blur-[100px] absolute -top-[10%] -left-[10%]"></div>
        <div className="glow-blur-2 w-[70vw] h-[70vw] sm:w-[60vw] sm:h-[60vw] bg-indigo-500 rounded-full mix-blend-lighten opacity-50 blur-[120px] absolute -bottom-[10%] -right-[10%]"></div>
      </div>

      {/* PROFILE HEADER */}
      <div className="border-1 p-6 rounded-2xl flex flex-col items-center space-y-4 bg-gradient-to-r from-cyan-900 to-indigo-1000 drop-shadow-lg relative z-10">
        <img
          src={profile.avatar_url || 'https://placehold.co/100x100'}
          className="w-24 h-24 rounded-full border-4 border-gray-800"
        />
        <h1 className="text-2xl text-white">{profile.name}</h1>
        <p className="text-gray-400">{profile.email}</p>

        {/* EDIT PROFILE BUTTON */}
        <button
          onClick={() => setShowProfileForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-2"
        >
          Edit Profile
        </button>
      </div>

      {/* STATS */}
      {isorg && (
        <div className="grid grid-cols-3 gap-6 relative z-10">
          <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <BuildingIcon className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-300">Events Participated</p>
            <p className="text-3xl font-bold text-white">{eventcnt}</p>
          </div>

          <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <TicketIcon className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-300">Events Hosted</p>
            <p className="text-3xl font-bold text-white">{hostcnt}</p>
          </div>

          <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <CalendarIcon className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-300">Organisations</p>
            <p className="text-3xl font-bold text-white">1</p>
          </div>
        </div>
      )}

      {/* EVENTS */}
      <div className="space-y-3 mt-4 relative z-10">
        <h2 className="text-xl text-white font-bold">Upcoming Events</h2>

        {events.length === 0 && (
          <p className="text-gray-500">No upcoming events.</p>
        )}

        {events.map(event => (
          <div key={event.id} className="bg-gray-800 p-4 rounded-xl flex items-center space-x-4">
            <img src={event.image_url} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="text-white font-semibold">{event.title}</p>
              <p className="text-gray-400 text-sm">Registered</p>
            </div>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">
              {event.status}
            </span>
          </div>
        ))}
      </div>

      {/* ADMIN + LOGOUT */}
      <div className="space-y-4 relative z-10">
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <LayoutDashboardIcon className="w-5 h-5" />
            Admin Dashboard
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          <LogOutIcon className="w-5 h-5" />
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
