'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/api/client'; 


const OrganizationBox = () => {
    // State to hold profile and organization data
    const [profile, setProfile] = useState<any>(null);
    const [organization, setOrganization] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('uuid', user.id)
                .single();

            setProfile(profileData);

            // Fetch organization details if ID exists
            if (profileData?.organisation_id) {
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('id, name, description, status, avtar_url') // Added 'id' which is crucial for editing
                    .eq('id', profileData.organisation_id)
                    .single();

                setOrganization(orgData);
            }

            setLoading(false);
        };

        fetchProfile();
    }, []);

    
    if (loading) return <p className="text-gray-400 p-6 text-center">Loading organization status...</p>;

    // Determine if the organization exists
    const hasOrganization = !!profile?.organisation_id && !!organization;

    // --- Render Logic ---
    return (
        <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2 flex justify-between items-center">
                Organization Management
                
                {/* ✨ NEW: Add Edit Link if organization exists 
                */}
                {hasOrganization && (
                    <Link
                        href={`/form/organisation-edit/${organization.id}`} // Assuming an edit route with the organization ID
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                    >
                        Edit Details
                    </Link>
                )}
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

                    <div className="text-gray-300 max-w-[70%]">
                        {/* Improved image handling: checking for existence and providing an alt text */}
                        {organization?.avtar_url && (
                             <img 
                                src={organization.avtar_url} 
                                alt={`${organization.name} logo`}
                                className="w-16 h-16 object-cover rounded-full mb-3" // Added styling for a nicer look
                             />
                        )}
                        <p className="text-2xl font-bold text-green-400">{organization?.name}</p>
                        <p className="mt-2">{organization?.description || 'No description available'}</p>
                    </div>
                    
                    <div className="text-right border-l border-gray-700 pl-4">
                        <p className="font-semibold text-gray-400 mb-2">Organization Status:</p>
                        <p>
                            {/* Status Display Logic */}
                            {organization?.status === 'Approved' ? (
                                <span className="text-green-400 font-bold">✅ Approved</span>
                            ) : organization?.status?.toLowerCase() === 'pending' ? (
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