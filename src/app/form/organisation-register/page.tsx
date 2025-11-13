// app/form/organisation-register/page.tsx
'use client';
import OrganizationForm from '@/components/dashboard/OrganizationForm';
import { useRouter } from 'next/navigation';

const OrganisationRegisterPage = () => {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to dashboard after successful registration
        router.push('/dashboard'); 
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <OrganizationForm 
                onSuccess={handleSuccess} // This is correct for registration!
                onCancel={() => router.push('/dashboard')}
            />
        </div>
    );
};

export default OrganisationRegisterPage;