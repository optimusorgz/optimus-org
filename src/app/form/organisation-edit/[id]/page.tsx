'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import OrganizationForm from '@/components/form/OrganizationForm';
import supabase  from '@/api/client';
import { use, useEffect, useState } from 'react';

export default function OrganisationEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();

// store userID in state
    const [userID, setUserID] = useState("");

    useEffect(() => {
        const fetchUserID = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                router.push('/auth');
                return;
            }

            const uid = data.user.id;
            setUserID(uid);

            console.log("Logged in user ID:", uid);
        };

        fetchUserID();
    }, [router]);

    // redirect handlers
    const handleSuccess = () => router.push(`/dashboard/${userID}`);
    const handleCancel = () => router.push(`/dashboard/${userID}`);
    const { id } = React.use(params);

    if (!id) {
        return (
            <div className="min-h-screen bg-gray-900 p-8 text-red-400">
                Error: Organization ID not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <OrganizationForm
                orgId={id}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
