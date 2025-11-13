// app/form/organisation-edit/[id]/page.tsx
'use client';
import OrganizationForm from '@/components/dashboard/OrganizationForm';
import { useRouter } from 'next/navigation';

// Define the type for the dynamic route parameters
interface OrganisationEditPageProps {
    params: {
        id: string; // The organization ID passed in the URL, e.g., /organisation-edit/123
    };
}

const OrganisationEditPage = ({ params }: OrganisationEditPageProps) => {
    const router = useRouter();
    const organizationId = params.id; // Extract the ID from the URL

    const handleSuccess = () => {
        // Redirect to dashboard after successful update
        router.push('/dashboard');
    };

    const handleCancel = () => {
        router.push('/dashboard');
    }

    if (!organizationId) {
        // Handle case where ID is missing (though Next.js routing typically prevents this)
        return <div className="min-h-screen bg-gray-900 p-8 text-red-400">Error: Organization ID not found in URL.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <OrganizationForm 
                initialOrganizationId={organizationId} // PASS THE ID for EDIT MODE
                onSuccess={handleSuccess} 
                onCancel={handleCancel}
            />
        </div>
    );
};

export default OrganisationEditPage;