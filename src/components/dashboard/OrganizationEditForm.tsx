'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import supabase from '@/api/client'; // Adjust path to your Supabase client

// --- 1. Type Definition for Organization Data (matching table schema) ---

interface OrganizationData {
    id: string; // Crucial for update query
    uuid: string; 
    name: string;
    description: string | null;
    owner_id: string | null;
    status: 'Pending' | 'Approved' | 'Rejected';
    avatar_url: string | null;
    created_at: string;
}

// --- 2. Component Props ---

interface OrganizationEditFormProps {
    currentData: OrganizationData; 
    onCancel: () => void;
    onSuccess: (updatedOrg: OrganizationData) => void; 
}


export default function OrganizationEditForm({ currentData, onCancel, onSuccess }: OrganizationEditFormProps) {
    
    // **Defensive Initialization Fix:** Provides a default object if currentData is null/undefined
    const safeData = currentData || {} as OrganizationData;
    
    const [formData, setFormData] = useState({
        name: safeData.name || '',
        description: safeData.description || '',
        avatar_url: safeData.avatar_url || '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to reset form data if currentData prop changes (e.g., if we switch organizations)
    useEffect(() => {
        const effectSafeData = currentData || {} as OrganizationData;
        setFormData({
            name: effectSafeData.name || '',
            description: effectSafeData.description || '',
            avatar_url: effectSafeData.avatar_url || '',
        });
    }, [currentData]);

    // --- Input Change Handler ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setError(null);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Submission Handler (Supabase Update) ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!currentData || !currentData.id) {
            setError("Cannot save: Organization ID is missing.");
            setLoading(false);
            return;
        }

        // Prepare data for Supabase update, converting empty strings to null for optional fields
        const dataToUpdate = {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            avatar_url: formData.avatar_url.trim() || null,
        };

        const { data, error: updateError } = await supabase
            .from('organizations')
            .update(dataToUpdate)
            .eq('id', currentData.id) 
            .select() // Select the updated row
            .single();

        setLoading(false);

        if (updateError) {
            console.error("Organization Update Error:", updateError);
            setError(`Update failed: ${updateError.message}`);
        } else if (data) {
            // Success: Combine the original (non-editable) fields with the new data
            const updatedOrg: OrganizationData = {
                ...currentData,
                ...data,
                description: data.description,
                avatar_url: data.avatar_url,
            };
            onSuccess(updatedOrg);
        }
    };


    // --- 3. Render Form (Tailwind CSS UI) ---
    return (
        <div className="mt-4 p-4 border border-green-600 rounded-md bg-gray-900">
            <h4 className="text-xl font-bold text-green-400 mb-4 border-b border-gray-700 pb-2">
                Edit Organization Details
            </h4>

            {error && (
                <p className="text-red-400 bg-red-900/50 p-2 rounded-md mb-4 text-sm">❌ {error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white">Organization Name *</label>
                    <input id="name" name="name" type="text" required 
                        value={formData.name} onChange={handleChange}
                        disabled={loading}
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white">Description (Optional)</label>
                    <textarea id="description" name="description" rows={3} 
                        value={formData.description} onChange={handleChange}
                        disabled={loading}
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                </div>

                {/* Avatar URL */}
                <div>
                    <label htmlFor="avatar_url" className="block text-sm font-medium text-white">Avatar/Logo URL (Optional)</label>
                    <input id="avatar_url" name="avatar_url" type="url" 
                        value={formData.avatar_url} onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., https://yourdomain.com/logo.png"
                        className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                
                {/* Note on non-editable fields */}
                <p className="text-xs text-gray-500 pt-2">
                    Note: Status ({currentData?.status || 'N/A'}) and Owner ID are not editable here.
                </p>

                {/* Action Buttons */}
                <div className='flex justify-end space-x-3 pt-2'>
                    <button 
                        type="button"
                        onClick={onCancel} 
                        disabled={loading}
                        className="px-4 py-2 text-sm border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading || formData.name.trim() === ''}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-500 disabled:text-gray-300"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}