// /src/app/dashboard/organizations/page.tsx
'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import OrganizationForm from '@/components/admin-dashboard/OrganizationForm';
import Modal from '@/components/ui/Modal';
import { Organization } from '@/lib/types/supabase';
import { Plus } from 'lucide-react';

interface EnrichedOrganization extends Organization {
  owner_name?: string;
  owner_email?: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<EnrichedOrganization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const supabase = createClient;

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return;
    }

    if (!data) return;

    // Fetch all profiles for efficiency
    const ownerIds = data.map((org) => org.owner_id).filter(Boolean);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('uuid, name, email')
      .in('uuid', ownerIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
    }

    const enrichedData: EnrichedOrganization[] = data.map((org) => {
      const owner = profiles?.find((p) => p.uuid === org.owner_id);
      return {
        ...org,
        owner_name: owner?.name || 'N/A',
        owner_email: owner?.email || 'N/A',
      };
    });

    setOrganizations(enrichedData);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handlers for CRUD Form
  const handleOpenInsert = () => {
    setSelectedOrg(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (action: 'inserted' | 'updated') => {
    alert(`Organization successfully ${action}.`);
    setIsFormOpen(false);
    fetchOrganizations();
  };

  const handleDelete = async (orgId: string | number) => {
    const idToDelete = String(orgId);

    if (!confirm('Are you sure you want to delete this organization? This may affect linked events/profiles.')) return;

    const { error } = await supabase.from('organizations').delete().eq('id', idToDelete);

    if (error) {
      console.error('Delete error:', error);

      let errorMessage = 'Error deleting organization. Please check RLS or foreign key constraints.';

      if (error.code === '42501') {
        errorMessage =
          'Permission Denied: You do not have the rights to delete this organization. Check the DELETE RLS Policy (auth.uid() must match owner_id).';
      } else if (error.code === '23503') {
        errorMessage =
          'Foreign Key Violation: Cannot delete because the organization is linked to existing events or user profiles.';
      }

      alert(errorMessage);
    } else {
      alert(`Organization ID ${idToDelete.substring(0, 8)}... deleted successfully.`);
      fetchOrganizations();
    }
  };

  // Define Table Columns
  const columns = [
    { header: 'ID', accessorKey: 'id', render: (id: string) => `${id.substring(0, 6)}...` },
    { header: 'Organization Name', accessorKey: 'name' },
    // { header: 'Owner ID', accessorKey: 'owner_id', render: (id: string) => (id ? `${id.substring(0, 6)}...` : 'N/A') },
    { header: 'Owner Name', accessorKey: 'owner_name' },
    { header: 'Owner Email', accessorKey: 'owner_email' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Created At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">
        🏛️ Organization Management
      </h1>

      <div className="flex justify-between items-center">
        <ExportButton data={organizations} filename="organizations_data" />
        <button
          onClick={handleOpenInsert}
          className="flex items-center bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Organization
        </button>
      </div>

      <DataTable
        data={organizations}
        columns={columns}
        tableName="organizations"
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
      />

      {isFormOpen && (
        <Modal onClose={() => setIsFormOpen(false)}>
          <OrganizationForm
            table="organizations"
            initialData={selectedOrg}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
