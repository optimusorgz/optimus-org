'use client';
import React, { useEffect, useState } from 'react';
import { Calendar, Briefcase, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import Loader from '@/components/ui/Loader';

// Correct paths for dynamic userID folder
import EventsPage from '@/app/admin-dashboard/[user_id]/events/page';
import OrganizationsPage from '@/app/admin-dashboard/[user_id]/organisation/page';
import RecruitmentPage from '@/app/admin-dashboard/[user_id]/recruitment/page';
import ProfilePage from '@/app/admin-dashboard/[user_id]/profiles/page';

const TABS = [
  { id: 'events', label: 'Events', icon: Calendar, component: EventsPage },
  { id: 'organizations', label: 'Organizations', icon: Briefcase, component: OrganizationsPage },
  { id: 'recruitment', label: 'Recruitment', icon: FileText, component: RecruitmentPage },
  { id: 'profile', label: 'Profile', icon: User, component: ProfilePage },
];

export default function AdminDashboardClient() {
  const { userId } = useUser();
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // You can fetch user-specific data here if needed
        await new Promise((res) => setTimeout(res, 500));
      } catch (err) {
        toast.error('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || EventsPage;

  return (
    <div className="p-2 sm:p-3 md:p-6 bg-gray-900 min-h-full w-full overflow-x-hidden max-w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">✨ Admin Dashboard</h1>

      {/* Horizontal Tabs */}
      <div className="flex space-x-2 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6 overflow-x-auto -mx-2 sm:mx-0 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <tab.icon size={18} className="sm:w-5 sm:h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="p-3 sm:p-4 md:p-6 bg-gray-800 rounded-xl shadow-lg min-h-[300px] sm:min-h-[400px] w-full max-w-full overflow-x-hidden opacity-0" data-animate-on-visible="fade-in-scale">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader />
          </div>
        ) : (
          <ActiveComponent />
        )}
      </div>
    </div>
  );
}
