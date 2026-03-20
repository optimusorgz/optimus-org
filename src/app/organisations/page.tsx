'use client';

import React, { useEffect, useState } from 'react';
import { Users, Calendar, Loader2 } from 'lucide-react';
import supabaset from '@/api/client';

// --- Types ---
type Role = 'Admin' | 'Organizer' | 'Member' | 'Coordinator' | 'Designer';

interface TeamMember {
  name: string;
  role: Role;
  joined: string;
  linkedin?: string;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  membersCount: number;
  eventsCount: number;
  members: TeamMember[];
}

// --- Helpers ---
const getRoleStyle = (role: Role) => {
  switch (role) {
    case 'Admin':
      return 'bg-red-700/50 text-red-300';
    case 'Organizer':
      return 'bg-yellow-700/50 text-yellow-300';
    case 'Coordinator':
      return 'bg-teal-700/50 text-teal-300';
    case 'Designer':
      return 'bg-purple-700/50 text-purple-300';
    case 'Member':
    default:
      return 'bg-blue-700/50 text-blue-300';
  }
};

// --- Components ---
const TeamMemberTable: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  return (
    <div className="p-4 md:p-6 rounded-xl bg-gray-800/50 w-full overflow-x-auto">
      <h3 className="flex items-center text-lg font-semibold text-gray-200 mb-4">
        <Users className="w-5 h-5 mr-2 text-teal-400" /> Team Members
      </h3>

      {members.length === 0 ? (
        <p className="text-gray-500 text-sm">No members data available</p>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-5 text-sm text-gray-400 border-b border-gray-700 pb-2">
            <div className="col-span-2">Name</div>
            <div>Role</div>
            <div className="col-span-2">Linkedin</div>
          </div>

          {members.map((member, index) => (
            <div
              key={index}
              className="grid grid-cols-2 md:grid-cols-5 py-2 border-b border-gray-800 text-white"
            >
              <div  className='col-span-2'>
                {member.name}
              </div>

              <div >
                <span className={`text-xs px-2 py-1 rounded ${getRoleStyle(member.role)}`}>
                  {member.role}
                </span>
              </div>

              <div className='col-span-2 flex items-center text-sm text-gray-400'>

                {/* {member.linkedin &&
                  member.linkedin !== "LinkedIn" &&
                  member.linkedin.startsWith("http") && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-cyan-400 hover:underline"
                    >
                      🔗View Linkdin
                    </a>
                  )} */}
              </div>

              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  count: number;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ count, label, icon, bgColor }) => (
  <div className={`p-4 rounded-xl ${bgColor} text-white`}>
    <div className="flex items-center">
      {icon}
      <span className="ml-2 text-sm">{label}</span>
    </div>
    <div className="text-2xl font-bold mt-2">{count}</div>
  </div>
);

const OrganizationCard: React.FC<{ org: Organization }> = ({ org }) => {
  return (
    <div className="bg-gray-800/70 p-6 rounded-2xl border border-gray-700">
      <div className="md:grid md:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="flex items-center">
            <img
              src={org.logo}
              className="w-10 h-10 rounded-full"
              onError={(e: any) => (e.target.src = 'https://placehold.co/40')}
            />
            <div className="ml-3">
              <h2 className="text-white font-bold">{org.name}</h2>
              <p className="text-gray-400 text-sm">{org.description}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <StatCard
              count={org.membersCount}
              label="Members"
              icon={<Users className="w-4 h-4" />}
              bgColor="bg-cyan-600"
            />
            <StatCard
              count={org.eventsCount}
              label="Events"
              icon={<Calendar className="w-4 h-4" />}
              bgColor="bg-yellow-600"
            />
          </div>

          
        </div>

        {/* Right */}
        <div className="md:col-span-2">
          <TeamMemberTable members={org.members} />
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const App: React.FC = () => {
  const supabase = supabaset;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [eventcount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventCount = async (organisations_id: string) => {
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .eq('organisation_id', organisations_id);

      if (error) {
        console.error('Error fetching event count:', error);
      }

      console.log('organisations_id:', organisations_id, 'Event count:', data?.length || 0);

      setEventCount(data?.length || 0);

      return data?.length || 0;
    }
    
    const fetchOrganizations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('status', 'Approved'); // ✅ Only active orgs

      if (error) {
        console.error(error);
      } else {
        const formatted: Organization[] = await Promise.all(
        data.map(async (org: any) => {

          const teamMembers = Array.isArray(org.team_members)
            ? org.team_members
            : [];

          const filteredMembers = teamMembers.filter(
            (m: any) =>
              m?.name?.trim() &&
              m?.position?.trim() &&
              !(m.name === "Member" && m.position === "Role")
          );

          // ✅ Each org gets its own API call
          const eventsCount = await fetchEventCount(org.id);

          return {
            id: org.id,
            name: org.name || 'No Name',
            description: org.description || 'No description',
            logo: org.avatar_url || 'https://placehold.co/40',

            membersCount: filteredMembers.length,
            eventsCount, // ✅ correct

            members: filteredMembers.map((m: any) => {
              let linkedin = m?.linkedin || "";

              if (linkedin && !linkedin.startsWith("http")) {
                linkedin = "https://" + linkedin;
              }

              console.log('Member:', m?.name,'Role:', m?.linkedin, 'LinkedIn:', linkedin);

              return {
                name: m?.name || "Member",
                role: m.linkedin || 'Role',
                joined: 'Recently',
                linkedin
              };
            }),
          };
        })
);

        setOrganizations(formatted);
      }

      setLoading(false);
    };

    fetchOrganizations();
    
  }, []);

  // --- Loader ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white">Organizations</h1>
        <p className="text-gray-400">
          Discover and join communities
        </p>
      </header>

      <div className="max-w-6xl mx-auto space-y-6">
        {organizations.map((org) => (
          <OrganizationCard key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
};

export default App;