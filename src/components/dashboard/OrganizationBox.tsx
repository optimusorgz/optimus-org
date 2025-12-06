'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/api/client'; 
import { User } from '@supabase/supabase-js'; // Import User type for better type safety

// Type definition for Organization for clarity
interface Organization {
    id: string;
    name: string;
    description: string;
    avatar_url: string;
    status: 'Approved' | 'Pending' | 'Rejected' | string; // Assuming these are the status values
    owner_id: string;
    // Add other organization fields if needed
}

const OrganizationBox = () => {
    // State to hold organization data
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchOrganization = async () => {
            setLoading(true);
            setError(null);
            
            let user: User | null = null;
            
            try {
                // 1. Get the current user
                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

                if (userError) throw userError;
                
                user = currentUser;

                if (!user) {
                    setLoading(false);
                    return; // User is not logged in, stop here
                }

                // 2. Fetch the organization where the current user is the owner
                // This checks if the user.id is saved in the owner_id column.
                const { data, error: organizationError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('owner_id', user.id)
                    .single();

                if (organizationError && organizationError.code !== 'PGRST116') { // PGRST116 means 'No rows returned'
                    throw organizationError;
                }

                // If data is returned (organization exists)
                if (data) {
                    setOrganization(data as Organization);
                } else {
                    setOrganization(null); // Explicitly set to null if no organization is found
                }

            } catch (err: any) {
                console.error("Error fetching organization:", err.message);
                setError(`Failed to load organization data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, []);

    
    if (loading) return <p className="text-gray-400 p-6 text-center">Loading organization status...</p>;
    
    if (error) return <p className="text-red-400 p-6 text-center">Error: {error}</p>;

    // Determine if the organization exists
    // The query is designed to fetch the organization if the user is the owner, 
    // so checking if 'organization' state is populated is sufficient.
    const hasOrganization = !!organization; 

    // --- Render Logic ---
    return (
        <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-md w-full opacity-0" data-animate-on-visible="fade-in-scale">
            <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2 flex justify-between items-center">
                Organization Management
                
                {/* Add Edit Link if organization exists */}
                {/* {hasOrganization && organization?.id && (
                    <Link
                        href={`/form/organisation-edit/${organization.id}`} 
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                    >
                        Edit Details
                    </Link>
                )} */}
            </h2>

            {/* Case 1: No organization → show register button */}
            {!hasOrganization ? (
                <>
                    <p className="mb-6 text-gray-300">
                        You haven't registered an organization yet.
                    </p>
                    <Link
                        href="/form/organisation-register"
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
                    >
                        Register Your Organization
                    </Link>
                </>
            ) : (
                /* Case 2: Organization exists → show details */
                <div className='flex justify-between items-start'>

                    <div className="flex text-gray-300 max-w-[70%] m-2">
                            <img 
                                src={`${organization.avatar_url}?cachebuster=${Date.now()}`} // <--- KEY CHANGE HERE
                                alt={`${organization.name} logo`}
                                className="w-13 h-13 object-cover rounded-full  p-1 border-green-400 border-l mr-2" 
                            />
                        <div>

                        <p className="text-xl font-bold text-green-400">{organization.name}</p>
                        <p className="text-s">{organization.description || 'No description available'}</p>
                        </div>
                    </div>
                    
                    <div className="text-right border-l border-gray-700 pl-4">
                        <p className="font-semibold text-gray-400 mb-2">Status:</p>
                        <p>
                            {/* Status Display Logic */}
                            {organization.status === 'Approved' ? (
                                <span className="text-green-400 font-bold">✅ Approved</span>
                            ) : organization.status?.toLowerCase() === 'pending' ? (
                                <span className="text-yellow-400 font-bold">🟡 Pending Approval</span>
                            ) : (
                                <span className="text-red-400 font-bold">🚫 Rejected</span>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationBox;