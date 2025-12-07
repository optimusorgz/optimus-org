'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import ProfileForm from '@/components/admin-dashboard/ProfileForm';
import Modal from '@/components/ui/Modal';
import { Profile } from '@/lib/types/supabase';

type ProfileWithOrg = Profile & {
  organizations: { name: string } | null;
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileWithOrg[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithOrg[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'organiser' | 'user' | 'admin'>('all');
  const [sortOrgFirst, setSortOrgFirst] = useState(false); // New: Sort by organization
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithOrg | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const supabase = createClient;

  // Fetch profiles from Supabase
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, organizations(name)`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as ProfileWithOrg[]);
      setFilteredProfiles(data as ProfileWithOrg[]);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // --- Edit handler ---
  const handleOpenEdit = (profile: ProfileWithOrg) => {
    if (profile.role_type === 'admin') {
      alert('Admin profiles cannot be edited.');
      return;
    }
    setSelectedProfile(profile);
    setIsFormOpen(true);
  };

  // --- Delete handler ---
  const handleDelete = async (id: string | number) => {
    const profile = profiles.find(p => p.uuid === id);
    if (!profile) return;
    if (profile.role_type === 'admin') {
      alert('Admin profiles cannot be deleted.');
      return;
    }
    if (!confirm('Are you sure you want to DELETE this user profile?')) return;
    const { error } = await supabase.from('profiles').delete().eq('uuid', String(id));
    if (!error) fetchProfiles();
  };

  // --- Form success handler ---
  const handleFormSuccess = () => {
    alert('Profile successfully updated.');
    setIsFormOpen(false);
    fetchProfiles();
  };

  // --- Search & Filter & Sort ---
  useEffect(() => {
    let data = [...profiles];

    // 1️⃣ Search by name or email
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        p => p.name?.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }

    // 2️⃣ Filter by selected role
    if (selectedRole !== 'all') {
      data = data.filter(p => p.role_type === selectedRole);
    }

    // 3️⃣ Sort by role: organiser > user > admin > undefined
    const roleOrder: Record<string, number> = { organiser: 1, user: 2, admin: 3, undefined: 4 };
    data.sort((a, b) => roleOrder[a.role_type ?? 'undefined'] - roleOrder[b.role_type ?? 'undefined']);

    // 4️⃣ Sort by organization if sortOrgFirst is true
    if (sortOrgFirst) {
      data.sort((a, b) => {
        if (a.organizations && !b.organizations) return -1;
        if (!a.organizations && b.organizations) return 1;
        return 0;
      });
    }

    setFilteredProfiles(data);
  }, [searchQuery, selectedRole, sortOrgFirst, profiles]);

  // --- Table columns ---
  const columns = [
    { header: 'UUID', accessorKey: 'uuid', render: (id: string) => `${id.substring(0, 6)}...` },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Name', accessorKey: 'name', render: (val: string) => val || 'N/A' },
    { header: 'Role', accessorKey: 'role_type' },
    { header: 'Organization', accessorKey: 'organizations', render: (org: any) => org?.name || 'None' },
    { header: 'Joined At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  // --- Toggle organization sorting ---
  const handleSortOrgClick = () => {
    setSortOrgFirst(!sortOrgFirst);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden max-w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white">
        🧑‍💻 User Profiles Management
      </h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-between items-start sm:items-center">
        {/* Search & Role filter & Org sort */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="px-3 sm:px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm sm:text-base w-full sm:w-auto min-w-[200px]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <select
            className="px-3 sm:px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm sm:text-base w-full sm:w-auto"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as 'all' | 'organiser' | 'user' | 'admin')}
          >
            <option value="all">All Roles</option>
            <option value="organiser">Organiser</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Sort by organization button */}
          <button
            onClick={handleSortOrgClick}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base whitespace-nowrap ${
              sortOrgFirst ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-white'
            } focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full sm:w-auto`}
          >
            {sortOrgFirst ? 'Organization First ✅' : 'Sort by Organization'}
          </button>
        </div>

        <ExportButton data={filteredProfiles} filename="profiles_data" />
      </div>

      <div className="opacity-0" data-animate-on-visible="fade-up">
        <DataTable<ProfileWithOrg>
          data={filteredProfiles}
          columns={columns}
          tableName="profiles"
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
        />
      </div>

      {isFormOpen && selectedProfile && (
        <Modal onClose={() => setIsFormOpen(false)}>
          <ProfileForm
            table="profiles"
            initialData={selectedProfile}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
