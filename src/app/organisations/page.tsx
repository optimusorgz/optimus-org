'use client';

import React from 'react';
import { Users, Calendar, Dribbble, Zap } from 'lucide-react';

// --- Typescript Definitions ---

type Role = 'Admin' | 'Organizer' | 'Member' | 'Coordinator' | 'Designer';

interface TeamMember {
  name: string;
  role: Role;
  joined: string;
}

interface Organization {
  id: number;
  name: string;
  description: string;
  logo: string;
  membersCount: number;
  eventsCount: number;
  members: TeamMember[];
}

// --- Mock Data ---

const mockOrganizations: Organization[] = [
  {
    id: 1,
    name: 'Tech Innovators Inc',
    description: 'Leading technology events and conferences worldwide',
    logo: 'https://placehold.co/40x40/0E7490/FFFFFF?text=TI',
    membersCount: 25,
    eventsCount: 12,
    members: [
      { name: 'John Doe', role: 'Admin', joined: 'Jan 2023' },
      { name: 'Jane Smith', role: 'Organizer', joined: 'Mar 2023' },
      { name: 'Bob Johnson', role: 'Member', joined: 'Jun 2023' },
      { name: 'Alice Brown', role: 'Coordinator', joined: 'Aug 2023' },
      { name: 'Charlie Davis', role: 'Member', joined: 'Oct 2023' },
    ],
  },
  {
    id: 2,
    name: 'Creative Collective',
    description: 'Bringing together artists and designers for amazing experiences',
    logo: 'https://placehold.co/40x40/6D28D9/FFFFFF?text=CC',
    membersCount: 18,
    eventsCount: 8,
    members: [
      { name: 'Emma Wilson', role: 'Admin', joined: 'Feb 2023' },
      { name: 'Liam Taylor', role: 'Organizer', joined: 'Apr 2023' },
      { name: 'Olivia Martin', role: 'Designer', joined: 'May 2023' },
      { name: 'Noah Anderson', role: 'Member', joined: 'Jul 2023' },
      { name: 'Sophia Thomas', role: 'Member', joined: 'Sep 2023' },
    ],
  },
];

// Helper to map role to a color/style
const getRoleStyle = (role: Role) => {
  switch (role) {
    case 'Admin':
      return 'bg-red-700/50 text-red-300';
    case 'Organizer':
      return 'bg-yellow-700/50 text-yellow-300';
    case 'Coordinator':
      return 'bg-teal-700/50 text-teal-300';
    case 'Member':
    default:
      return 'bg-blue-700/50 text-blue-300';
  }
};

// --- Sub-Components ---

const TeamMemberTable: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl bg-gray-800/50 w-full max-w-full overflow-x-auto">
        <h3 className="flex items-center text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-400" /> Team Members
        </h3>

        <div className="space-y-2 sm:space-y-3">
            {/* Table Header - hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-5 text-xs sm:text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">
            <div className="col-span-2">Name</div>
            <div>Role</div>
            <div className="col-span-2">Joined</div>
            </div>

            {/* Table Rows */}
            {members.map((member, index) => (
            <div
                key={index}
                className="grid grid-cols-2 md:grid-cols-5 items-center py-2 border-b border-gray-800 last:border-b-0 text-white/90 gap-2"
            >
                {/* Name */}
                <div className="text-xs sm:text-sm font-medium truncate">{member.name}</div>

                {/* Role */}
                <div className="flex justify-start">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRoleStyle(member.role)}`}>
                    {member.role}
                </span>
                </div>

                {/* Joined Date - hidden on mobile */}
                <div className="hidden md:block md:col-span-2 text-xs sm:text-sm text-gray-400">{member.joined}</div>
            </div>
            ))}
        </div>
        </div>

  );
};

const StatCard: React.FC<{ count: number; label: string; icon: React.ReactNode; bgColor: string }> = ({
  count,
  label,
  icon,
  bgColor,
}) => (
  <div
    className={`flex flex-col items-start p-3 sm:p-4 rounded-xl shadow-lg transition-all hover:ring-2 ring-offset-2 ring-offset-gray-900 ${bgColor} w-full`}
  >
    <div className="flex items-center text-white">
      {icon}
      <span className="ml-2 font-semibold text-white/90 text-xs sm:text-sm">{label}</span>
    </div>
    <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">{count}</div>
  </div>
);

const OrganizationCard: React.FC<{ org: Organization }> = ({ org }) => {
  return (
    <div className="bg-gray-800/70 p-3 sm:p-4 md:p-6 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700/50 w-full max-w-full">
      <div className="md:grid md:grid-cols-3 md:gap-6 lg:gap-8">
        {/* Left Section: Info and Stats (1/3 width on desktop) */}
        <div className="mb-6 md:mb-0 md:col-span-1 flex flex-col justify-between">
          <div className="w-full">
            <div className="flex items-center mb-4">
              <img
                src={org.logo}
                alt={`${org.name} Logo`}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-teal-500 flex-shrink-0"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/40x40/374151/FFFFFF?text=Org';
                }}
              />
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">{org.name}</h2>
                <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{org.description}</p>
              </div>
            </div>

            {/* Stats: Responsive layout (row on desktop, column on mobile) */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <StatCard
                count={org.membersCount}
                label="Members"
                icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                bgColor="bg-gradient-to-br from-cyan-500/80 to-blue-600/80 hover:from-cyan-400 hover:to-blue-500"
              />
              <StatCard
                count={org.eventsCount}
                label="Events"
                icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
                bgColor="bg-gradient-to-br from-amber-500/80 to-yellow-600/80 hover:from-amber-400 hover:to-yellow-500"
              />
            </div>

            <button
              className="w-full text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-white transition-all duration-300 text-sm sm:text-base
                         bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400
                         shadow-lg shadow-teal-500/30 active:scale-[0.98]"
            >
              Join Organization
            </button>
          </div>
        </div>

        {/* Right Section: Team Members (2/3 width on desktop) */}
        <div className="md:col-span-2">
          <TeamMemberTable members={org.members} />
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 font-sans p-3 sm:p-4 md:p-6 lg:p-8 w-full overflow-x-hidden max-w-full">
      <header className="text-center py-6 sm:py-8 md:py-10 px-4 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">
          Organizations
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-400 px-2">
          Discover top event organizers and join communities that match your interests
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-12 sm:pb-16 md:pb-20 px-2 sm:px-4 w-full">
        {mockOrganizations.map((org) => (
          <OrganizationCard key={org.id} org={org} />
        ))}
      </main>
    </div>
  );
};

export default App;