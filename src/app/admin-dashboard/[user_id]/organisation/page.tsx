'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import OrganizationForm from '@/components/admin-dashboard/OrganizationForm';
import Modal from '@/components/ui/Modal';
import { Organization } from '@/lib/types/supabase';
import { Plus, Edit, Eye } from 'lucide-react';

interface EnrichedOrganization extends Organization {
  owner_name?: string;
  owner_email?: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<EnrichedOrganization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<EnrichedOrganization | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const supabase = createClient;

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return console.error('Error fetching organizations:', error);
    if (!data) return;

    const ownerIds = data.map((org) => org.owner_id).filter(Boolean);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('uuid, name, email')
      .in('uuid', ownerIds);

    const enrichedData: EnrichedOrganization[] = data.map((org) => {
      const owner = profiles?.find((p) => p.uuid === org.owner_id);
      return { ...org, owner_name: owner?.name || 'N/A', owner_email: owner?.email || 'N/A' };
    });

    setOrganizations(enrichedData);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleOpenInsert = () => {
    setSelectedOrg(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (org: EnrichedOrganization) => {
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
    if (!confirm('Are you sure you want to delete this organization?')) return;

    const { error } = await supabase.from('organizations').delete().eq('id', idToDelete);

    if (error) {
      console.error('Delete error:', error);
      alert('Error deleting organization.');
    } else {
      fetchOrganizations();
    }
  };

  const columns = [
    { header: 'ID', accessorKey: 'id', render: (id: string) => `${id.substring(0, 6)}...` },
    { header: 'Organization Name', accessorKey: 'name' },
    { header: 'Owner Name', accessorKey: 'owner_name' },
    { header: 'Owner Email', accessorKey: 'owner_email' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Created At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden max-w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold lowercase text-white">
        🏛️ Organization Management
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <ExportButton data={organizations} filename="organizations_data" />
        <button
          onClick={handleOpenInsert}
          className="flex items-center bg-green-600 text-white px-4 sm:px-5 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5 mr-2" />
          Add New Organization
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block opacity-0" data-animate-on-visible="fade-up">
        <DataTable
          data={organizations}
          columns={columns}
          tableName="organizations"
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {organizations.map((org, index) => (
          <div
            key={org.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors opacity-0"
            data-animate-on-visible="fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedOrg(org)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{org.name}</h2>
              <span
                className={`px-2 py-1 rounded-md text-sm font-semibold text-green-600 `}
              >
                {org.status}
              </span>
            <div className="flex justify-end mt-2 space-x-2 text-white">
              <span
                title="Edit"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening modal
                  handleOpenEdit(org);
                }}
              >
                <Edit />
              </span>
              
            </div>
            </div>
            

            <div className="text-white mt-1 text-sm">{org.owner_name}</div>
          </div>
        ))}
      </div>

      {/* Organization Details Modal */}
      {selectedOrg && (
        <Modal onClose={() => setSelectedOrg(null)}>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">{selectedOrg.name}</h2>
            <p>
              <span className="font-semibold">Owner Name:</span> {selectedOrg.owner_name}
            </p>
            <p>
              <span className="font-semibold">Owner Email:</span> {selectedOrg.owner_email}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {selectedOrg.status}
            </p>
            <p>
              <span className="font-semibold">Created At:</span>{' '}
              {new Date(selectedOrg.created_at).toLocaleDateString()}
            </p>
          </div>
        </Modal>
      )}

      {/* CRUD Form Modal */}
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
