'use client';

import { useRouter } from 'next/navigation';
import OrganizationForm from '@/components/form/OrganizationForm';
import { use, useEffect, useState } from 'react';
import supabase  from '@/api/client';

const OrganisationRegisterPage = () => {
    const router = useRouter();
    const [userID, setUserID] = useState("");

    // fetching the user id
    useEffect(() => {
        const fetchUserID = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                router.push('/auth');
                return;
            }
            const uid = data.user.id;
            setUserID(uid);
        }
        
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-900 pt-10">
            <OrganizationForm
                onSuccess={() => router.push(`/dashboard/${userID}`)}
                onCancel={() => router.push(`/dashboard/${userID}`)}
            />
        </div>
    );
};

export default OrganisationRegisterPage;
