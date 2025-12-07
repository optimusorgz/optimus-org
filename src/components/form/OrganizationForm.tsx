'use client';

import { useState, useEffect } from 'react';
import supabase from '@/api/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CircularLoader from '@/components/ui/CircleLoader';
import Loader from '@/components/ui/Loader';

// Upload Utility
const uploadFileToSupabase = async (bucketName: string, filePath: string, file: File): Promise<string | null> => {
    try {
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) return null;

        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return data.publicUrl;
    } catch {
        return null;
    }
};

interface OrganizationFormProps {
    orgId?: string; // If present = edit mode
    onSuccess: () => void;
    onCancel: () => void;
}

const OrganizationForm = ({ orgId, onSuccess, onCancel }: OrganizationFormProps) => {
    const isEditMode = !!orgId;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [PhoneNumber, setPhoneNumber] = useState('');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatarKey, setAvatarKey] = useState(Date.now());

    // Fetch data for edit mode
    useEffect(() => {
        if (!isEditMode || !orgId) return;

        const fetchOrganization = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('organizations')
                .select('name, description, avatar_url, phone_number')
                .eq('id', orgId)
                .single();

            if (data) {
                setName(data.name);
                setDescription(data.description);
                setCurrentAvatarUrl(data.avatar_url);
                setPhoneNumber(data.phone_number || '');
                setAvatarKey(Date.now());
            }
            if (error) setError('Failed to load organization');

            setIsLoading(false);
        };

        fetchOrganization();
    }, [orgId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setAvatarFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("Not authenticated");

            let avatarUrl = currentAvatarUrl;

            if (avatarFile) {
                setIsUploading(true);
                const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
                avatarUrl = await uploadFileToSupabase("organization_logos", filePath, avatarFile);
                if (!avatarUrl) throw new Error("Upload failed");

                setIsUploading(false);
            }

            const payload = {
                name,
                description,
                avatar_url: avatarUrl,
                phone_number: PhoneNumber,
            };

            let response;
            if (isEditMode) {
                response = await supabase
                    .from("organizations")
                    .update(payload)
                    .eq("id", orgId)
                    .select()
                    .single();
            } else {
                response = await supabase
                    .from("organizations")
                    .insert({
                        ...payload,
                        owner_id: user.id,
                        status: "Pending",
                    })
                    .select()
                    .single();
            }

            if (response.error) throw response.error;

            setSuccess(isEditMode ? "Updated successfully" : "Registered successfully");

            setTimeout(() => onSuccess(), 600);
        } catch (err: any) {
            setError(err.message);
        }

        setIsSubmitting(false);
        setIsUploading(false);
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader /></div>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
                {isEditMode ? "Edit Organization" : "Register Organization"}
            </h2>

            {error && <div className="text-red-400 mb-3">{error}</div>}
            {success && <div className="text-green-400 mb-3">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>Description</Label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-800 p-3 rounded"
                    />
                </div>

                <div>
                    <Label>Logo / Avatar</Label>
                    {currentAvatarUrl && (
                        <Image
                            src={`${currentAvatarUrl}?v=${avatarKey}`}
                            width={90}
                            height={90}
                            alt="Logo"
                            className="rounded-full mb-2 border border-cyan-400"
                        />
                    )}

                    <Input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                <div>
                    <Label>Phone Number *</Label>
                    <Input
                        type="tel"
                        value={PhoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>

                    <Button
                        disabled={isSubmitting || isUploading}
                        className="flex items-center gap-2"
                    >
                        {(isSubmitting || isUploading) && (
                            <CircularLoader/>
                        )}

                        {isUploading
                            ? "Uploading..."
                            : isSubmitting
                            ? isEditMode
                                ? "Updating..."
                                : "Registering..."
                            : isEditMode
                            ? "Update"
                            : "Register"}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default OrganizationForm;
