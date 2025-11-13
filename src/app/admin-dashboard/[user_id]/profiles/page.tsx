'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import ProfileForm from '@/components/admin-dashboard/ProfileForm';
import Modal from '@/components/ui/Modal';
import { Profile } from '@/lib/types/supabase';

// Extend Profile with organization name
type ProfileWithOrg = Profile & {
  organizations: { name: string } | null;
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileWithOrg[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithOrg | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const supabase = createClient;

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, organizations(name)`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as ProfileWithOrg[]);
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

  const handleFormSuccess = () => {
    alert('Profile successfully updated.');
    setIsFormOpen(false);
    fetchProfiles();
  };

  const columns = [
    { header: 'UUID', accessorKey: 'uuid', render: (id: string) => `${id.substring(0, 6)}...` },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Name', accessorKey: 'name', render: (val: string) => val || 'N/A' },
    { header: 'Role', accessorKey: 'role_type' },
    { header: 'Organization', accessorKey: 'organizations', render: (org: any) => org?.name || 'None' },
    { header: 'Joined At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">🧑‍💻 User Profiles Management</h1>

      <div className="flex justify-end items-center">
        <ExportButton data={profiles} filename="profiles_data" />
      </div>

      <DataTable<ProfileWithOrg>
        data={profiles}
        columns={columns}
        tableName="profiles"
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
      />

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
