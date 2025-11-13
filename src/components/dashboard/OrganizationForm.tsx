// components/dashboard/OrganizationForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/client';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

// --- INLINE SUPABASE STORAGE UTILITY FUNCTION ---
/**
 * Uploads a file to a Supabase Storage bucket and returns the public URL.
 * NOTE: This function is moved here to resolve the import error.
 */
const uploadFileToSupabase = async (bucketName: string, filePath: string, file: File): Promise<string | null> => {
    try {
        // 1. Upload the file
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true, // Overwrite if file exists
            });

        if (uploadError) {
            console.error("Supabase Storage Upload Error:", uploadError.message);
            return null;
        }

        // 2. Get the public URL for the file
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;

    } catch (e) {
        console.error("General Storage Error during upload:", e);
        return null;
    }
};
// --------------------------------------------------

// --- CORRECTED INTERFACE FOR PROPS ---
interface OrganizationFormProps {
    // Optional: passed when editing an existing organization
    initialOrganizationId?: string; 
    // Required: callback on successful submission (e.g., redirect to dashboard)
    onSuccess: (userId: string) => void; 
    // Required: callback on cancel button click (e.g., redirect to dashboard)
    onCancel: () => void;
}
// -------------------------------------


const OrganizationForm: React.FC<OrganizationFormProps> = ({ initialOrganizationId, onSuccess, onCancel }) => {
    const isEditMode = !!initialOrganizationId;
    const router = useRouter();
    
    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
    
    // UI States
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isUploading, setIsUploading] = useState(false); 
    
    // Feedback States
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatarKey, setAvatarKey] = useState(Date.now()); 
    
    const title = isEditMode ? 'Edit Organization Details' : 'Register Your Organization';

    // --- Data Fetching for Edit Mode ---
    useEffect(() => {
        const fetchData = async (orgId: string) => {
            if (!isEditMode || !orgId) return;

            setIsLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('organizations')
                    .select('name, description, avatar_url')
                    .eq('id', orgId)
                    .single();

                if (fetchError) {
                    throw fetchError;
                } else if (data) {
                    setName(data.name ?? '');
                    setDescription(data.description ?? '');
                    setCurrentAvatarUrl(data.avatar_url ?? null);
                    setAvatarKey(Date.now());
                }
            } catch (err: any) {
                console.error('Error fetching organization data:', err);
                setError(`Failed to load data: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        
        // If in register mode, finish loading immediately
        if (!isEditMode) {
            setIsLoading(false);
        } else if (initialOrganizationId) {
            fetchData(initialOrganizationId);
        }

    }, [isEditMode, initialOrganizationId]);

    // --- File Change Handler (Prep for Upload) ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setAvatarFile(file || null);
        setSuccess(null);
        setError(null);
    };

    // --- Form Submission Handler (Insert/Update) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("User not authenticated. Please log in.");
            if (!name) throw new Error("Organization Name is required.");

            let avatarUrl = currentAvatarUrl;

            // 1. Handle File Upload if a NEW file is selected
            if (avatarFile) {
                setIsUploading(true);
                const bucketName = 'organization_logos'; // Your specified bucket name
                const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
                
                avatarUrl = await uploadFileToSupabase(bucketName, filePath, avatarFile);
                
                if (!avatarUrl) {
                    throw new Error("Logo upload failed. Please check file size/type or bucket policy.");
                }
                setIsUploading(false);
            }

            const organizationData: { [key: string]: any } = {
                name,
                description,
                avatar_url: avatarUrl,
            };
            
            let response;
            
            // 2. Perform Insert or Update Database Record
            if (isEditMode) {
                response = await supabase
                    .from('organizations')
                    .update(organizationData)
                    .eq('id', initialOrganizationId)
                    .select()
                    .single();
            } else {
                // For registration, add mandatory fields
                organizationData.status = 'Pending'; 
                organizationData.owner_id = user.id; 

                response = await supabase
                    .from('organizations')
                    .insert(organizationData)
                    .select()
                    .single();
            }

            if (response.error) throw response.error;
            
            setSuccess(isEditMode ? 'Organization details updated successfully!' : 'Organization registered successfully! Redirecting...');
            
            // Update the local state for immediate visual confirmation
            setCurrentAvatarUrl(avatarUrl);
            setAvatarKey(Date.now());
            setAvatarFile(null); // Clear the file input state

            setTimeout(() => onSuccess, 1000); // Redirect/refresh after success message
        } catch (err: any) {
            console.error('Submission Error:', err);
            setError(`Submission failed: ${err.message}`);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };
    
    // --- Render Logic ---
    if (isLoading) {
        return <div className="p-6 text-center text-gray-300">Loading organization data...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-2">{title} 🏢</h2>

            {/* Display Messages */}
            {error && <div className="bg-red-900/50 border border-red-600 text-red-400 px-4 py-3 rounded relative mb-4" role="alert">**Error:** {error}</div>}
            {success && <div className="bg-green-900/50 border border-green-600 text-green-400 px-4 py-3 rounded relative mb-4" role="alert">**Success:** {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Field */}
                <div>
                    <Label htmlFor="name" className="text-gray-300">Organization Name *</Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {setName(e.target.value); setSuccess(null); setError(null);}}
                        required
                        className="mt-1"
                    />
                </div>

                {/* Description Field */}
                <div>
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => {setDescription(e.target.value); setSuccess(null); setError(null);}}
                        rows={4}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-green-500 focus:border-green-500 mt-1"
                    />
                </div>

                {/* Image Upload Field */}
                <div className="pt-2">
                    <Label htmlFor="avatar" className="text-gray-300 block mb-2">Upload Logo/Avatar</Label>
                    {currentAvatarUrl && (
                        <div className="mb-4">
                            <Image 
                                src={`${currentAvatarUrl}?key=${avatarKey}`} 
                                alt="Current Logo" 
                                className="rounded-full object-cover border-2 border-green-500" 
                                width={96}
                                height={96}
                            />
                        </div>
                    )}
                    <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting || isUploading}
                        className="mt-1 block w-full text-sm text-gray-300 border border-gray-700 rounded-lg cursor-pointer bg-gray-800"
                    />
                    {(isSubmitting || isUploading) && <p className="text-sm text-yellow-400 mt-1">Processing image and saving...</p>}
                    <p className="mt-1 text-xs text-gray-400">
                        Upload a new logo. Maximum size is typically 5MB.
                        {avatarFile && <span className='font-semibold text-white'> (New file selected: {avatarFile.name})</span>}
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                        type="button" 
                        onClick={onCancel} 
                        disabled={isSubmitting || isUploading}
                        variant="ghost" 
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || isUploading || !name}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Registering...') : (isEditMode ? 'Update Organization' : 'Register Organization')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default OrganizationForm;