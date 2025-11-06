// /src/app/dashboard/organizations/page.tsx
'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import OrganizationForm from '@/components/admin-dashboard/OrganizationForm'; // <-- NEW FORM
import Modal from '@/components/ui/Modal'; 
import { Organization } from '@/lib/types/supabase'; // Assuming you imported the Organization type
import { Plus } from 'lucide-react';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const supabase = createClient;

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching organizations:', error);
    if (data) setOrganizations(data as Organization[]);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handlers for CRUD Form
  const handleOpenInsert = () => {
    setSelectedOrg(null); // Clear selected org for 'Insert' mode
    setIsFormOpen(true);
  };
  
  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org); // Set the organization data for 'Update' mode
    setIsFormOpen(true);
  };

  const handleFormSuccess = (action: 'inserted' | 'updated') => {
    alert(`Organization successfully ${action}.`);
    setIsFormOpen(false); // Close modal
    fetchOrganizations(); // Refresh data
  };

  const handleDelete = async (orgId: string | number) => { 
    // Ensure the ID is treated as a string (UUID) for the Supabase call
    const idToDelete = String(orgId); 

    if (!confirm('Are you sure you want to delete this organization? This may affect linked events/profiles.')) return;
    
    // Set loading state if you have one to prevent multiple clicks
    // setLoading(true); 

    const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', idToDelete);
    
    // setLoading(false);

    if (error) {
        console.error('Delete error:', error);
        
        let errorMessage = 'Error deleting organization. Please check RLS or foreign key constraints.';

        // **CRITICAL RLS CHECK (Code 42501):** PostgreSQL Insufficient Privilege
        if (error.code === '42501') {
            errorMessage = 'Permission Denied: You do not have the rights to delete this organization. Check the DELETE RLS Policy (auth.uid() must match owner_id).';
        } 
        // **CRITICAL Foreign Key Check (Code 23503):** Referenced data exists
        else if (error.code === '23503') {
            errorMessage = 'Foreign Key Violation: Cannot delete because the organization is linked to existing events or user profiles.';
        }
        
        alert(errorMessage);
        
    } else {
        // Success (or RLS blocked it without an explicit error, 
        // but since we are not selecting, we assume success if no error is thrown)
        alert(`Organization ID ${idToDelete.substring(0, 8)}... deleted successfully.`);
        fetchOrganizations();
    }
};

  // Define Table Columns
  const columns = [
    { header: 'ID', accessorKey: 'id', render: (id: string) => `${id.substring(0, 6)}...` },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Owner ID', accessorKey: 'owner_id', render: (id: string) => id ? `${id.substring(0, 6)}...` : 'N/A' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Created At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">🏛️ Organization Management</h1>
      
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
      
      {/* CRUD Form Modal */}
      {isFormOpen && (
        <Modal onClose={() => setIsFormOpen(false)}> 
          <OrganizationForm 
            table="organizations" 
            initialData={selectedOrg} // Null for Insert, Data for Update
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}