"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/client'; // Adjust path to your Supabase client
import { User } from '@supabase/supabase-js';

// --- 1. TypeScript Interface Definitions ---
// Note: organisation_id can be null in the ProfileData, but must be string in Event insertion
interface ProfileData {
    organisation_id: string | null;
}

interface OrganizationData {
    status: 'Pending' | 'Approved' | 'Rejected';
    name: string;
}

interface EventFormData {
    title: string;
    description: string;
    category: string;
    location: string;
    organizer_name: string;
    start_date: string;
    end_date: string;
    status: string;
    ticket_price: number | null;
    max_participants: number | null;
    banner_url: string; // Not used in form data, but kept for type safety if needed elsewhere
    contact_email: string;
    contact_phone: string;
}

const initialFormData: EventFormData = {
    title: '',
    description: '',
    category: '',
    location: '',
    organizer_name: '',
    start_date: '',
    end_date: '',
    status: 'Pending',
    ticket_price: null,
    max_participants: null,
    banner_url: '',
    contact_email: '',
    contact_phone: '',
};

// **Define the Storage Bucket Name**
const BUCKET_NAME = 'event_banners';

// --- 2. Data Fetching Utilities ---

/** Fetches only the organisation_id from the profiles table. */
const fetchOrganisationId = async (userId: string): Promise<string | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('organisation_id')
        .eq('uuid', userId)
        .limit(1)
        .single();

    if (error) {
        console.error("❌ Error fetching profile organisation ID:", error.message);
        return null;
    }
    return data?.organisation_id ?? null;
};

/** Fetches the organization name and status from the 'organizations' table. */
const fetchOrganizationDetails = async (orgId: string): Promise<OrganizationData | null> => {
    const { data, error } = await supabase
        .from('organizations') // Assuming your organization table is named 'organizations'
        .select('name, status')
        .eq('id', orgId)
        .limit(1)
        .single();

    if (error) {
        console.error("❌ Error fetching organization details:", error.message);
        return null;
    }
    
    // Ensure data structure matches OrganizationData
    if (data) {
        return {
            name: data.name,
            status: data.status as OrganizationData['status'],
        };
    }
    return null;
};


// --- 3. Main Component ---
export default function CreateEventPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [organizationName, setOrganizationName] = useState<string | null>(null);
    const [organizationStatus, setOrganizationStatus] = useState<'Pending' | 'Approved' | 'Rejected' | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

    // --- EFFECT: Fetch User and Profile Data ---
    useEffect(() => {
        const fetchUserDataAndProfile = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const orgId = await fetchOrganisationId(user.id);
                setOrganizationId(orgId);
                
                if (orgId) {
                    const orgDetails = await fetchOrganizationDetails(orgId);
                    
                    if (orgDetails) {
                        setOrganizationName(orgDetails.name);
                        setOrganizationStatus(orgDetails.status);
                        
                        // Set the organizer_name field in formData immediately
                        setFormData(prev => ({
                            ...prev,
                            organizer_name: orgDetails.name || '',
                        }));
                        
                        if (orgDetails.status !== 'Approved') {
                            setMessage({ 
                                type: 'warning', 
                                text: `Your organization status is '${orgDetails.status}'. You must be 'Approved' to create events.` 
                            });
                        }
                    } else {
                        // This handles if the orgId exists in profile but not in organizations table
                        setMessage({ type: 'error', text: 'Organization linked but details missing. Cannot proceed.' });
                    }
                } else {
                    // Organization ID is null
                    setMessage({ 
                        type: 'warning', 
                        text: 'You must register your organization before creating an event.' 
                    });
                }
            } else {
                setMessage({ type: 'error', text: 'You must be logged in to create an event.' });
            }

            setLoading(false);
        };
        fetchUserDataAndProfile();
    }, []);

    // Helper to determine if the form is blocked
    // The form is blocked if: loading, no user, no organization ID, or organization is not Approved.
    const isFormBlocked = loading || !user || !organizationId || organizationStatus !== 'Approved';

    // --- Input Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Prevent manual change of organizer_name if orgId is set (UI enforces readOnly/disabled)
        if (name === 'organizer_name' && organizationId) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            // Handle number inputs: convert to float if value exists, otherwise set null
            [name]: (type === 'number' && value !== '') ? parseFloat(value) : (value === '' ? null : value),
        }));
        setMessage(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setBannerFile(file || null);
        setMessage(null);
    };

    // --- Storage Upload Utility ---
    const uploadBanner = async (file: File, userId: string): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            setMessage({ type: 'error', text: `Banner upload failed: ${uploadError.message}` });
            return null;
        }

        const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
        return data.publicUrl;
    };


    // --- SUBMISSION HANDLER (Updated) ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // CHECK 1: Is the form blocked? (Final check before proceeding)
        if (!user) {
            setMessage({ type: 'error', text: 'You must be logged in to create an event.' });
            setLoading(false);
            return;
        }
        if (!organizationId) {
            setMessage({ type: 'error', text: 'Please register your organization first.' });
            setLoading(false);
            return;
        }
        if (organizationStatus !== 'Approved') {
            setMessage({ type: 'error', text: `Your organization must be 'Approved' to create events. Current status: ${organizationStatus}.` });
            setLoading(false);
            return;
        }
        
        // CHECK 2: Banner file is required
        if (!bannerFile) {
            setMessage({ type: 'error', text: 'Please select an event banner image.' });
            setLoading(false);
            return; 
        }

        // --- STEP 1: UPLOAD BANNER ---
        const finalBannerUrl = await uploadBanner(bannerFile, user.id);
        if (!finalBannerUrl) {
            setLoading(false);
            return; // Error message set inside uploadBanner
        }

        // Prepare data for insertion (Filter out null/empty strings to use database defaults where applicable)
        const baseDataToInsert = Object.fromEntries(
            Object.entries(formData).filter(([, value]) => value !== null && value !== '')
        ) as Partial<EventFormData>;

        const dataToInsert = {
            ...baseDataToInsert,
            created_by: user.id, 
            banner_url: finalBannerUrl,
            // --- CRITICAL ADDITION: Auto-insert organization fields ---
            organisation_id: organizationId, 
            organizer_name: organizationName, // Uses the fetched, verified name
        };

        // --- STEP 2: INSERT EVENT DATA ---
        const { data: newEvent, error } = await supabase
            .from('events')
            .insert([dataToInsert])
            .select('id') 
            .single(); 

        setLoading(false);

        if (error) {
            console.error('Error creating event:', error);
            setMessage({ type: 'error', text: `Failed to create event: ${error.message}` });
        } else if (newEvent && newEvent.id) {
            setMessage({ type: 'success', text: 'Event created successfully! Redirecting to form builder...' });
            setFormData(initialFormData);
            setBannerFile(null);
            router.push(`/event-page/${newEvent.id}/builder`);
        } else {
            setMessage({ type: 'error', text: 'Event created, but failed to get the new ID for redirection.' });
        }
    };

    // --- 4. Tailwind CSS UI ---
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8 p-10 bg-gray-800/90 border border-gray-700 shadow-xl rounded-xl">
                <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                    Create New Event
                </h2>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-900/50 border border-green-600 text-green-400' : message.type === 'warning' ? 'bg-yellow-900/50 border border-yellow-600 text-yellow-400' : 'bg-red-900/50 border border-red-600 text-red-400'}`}>
                        {message.text}
                    </div>
                )}
                
                {/* Initial Loading State */}
                {loading && !message && (
                    <div className="p-4 bg-blue-900/50 border border-blue-600 text-blue-400 rounded-md text-center">
                        Loading user profile and organization status...
                    </div>
                )}

                {/* Main Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <h3 className="md:col-span-2 text-xl font-semibold text-green-400 border-b border-gray-700 pb-2">Event Details</h3>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-white">Title</label>
                            <input id="title" name="title" type="text" required value={formData.title} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>
                        
                        {/* Organizer Name (Read-Only/Disabled) */}
                        <div>
                            <label htmlFor="organizer_name" className="block text-sm font-medium text-white">Organizer Name</label>
                            <input id="organizer_name" name="organizer_name" type="text" required 
                                value={organizationName || (organizationId ? 'Fetching Name...' : 'N/A (Register Organization)')} 
                                onChange={handleChange}
                                readOnly={!!organizationId} // Read only if organizationId is present
                                disabled={isFormBlocked}
                                className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500 ${organizationId ? 'bg-gray-700 border border-gray-600 cursor-not-allowed' : 'bg-gray-800 border border-white'}`}
                            />
                            {organizationStatus && organizationStatus !== 'Approved' && (
                                <p className="mt-1 text-xs text-yellow-400">Status: {organizationStatus}</p>
                            )}
                        </div>

                        {/* Description (Full Width) */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-white">Description</label>
                            <textarea id="description" name="description" rows={3} required value={formData.description} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            ></textarea>
                        </div>
                        
                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-white">Category</label>
                            <select
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                disabled={isFormBlocked}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="" disabled>Select Category</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Seminar">Seminar</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Tech Talk">Tech Talk</option>
                                <option value="Competition">Competition</option>
                                <option value="Bootcamp">Bootcamp</option>
                                <option value="Conference">Conference</option>
                                <option value="Networking">Networking</option>
                                <option value="Cultural">Cultural</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-white">Location</label>
                            <input id="location" name="location" type="text" required value={formData.location} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>

                        {/* Start Date & Time */}
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-white">Start Date & Time</label>
                            <input id="start_date" name="start_date" type="datetime-local" required value={formData.start_date} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>

                        {/* End Date & Time */}
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-white">End Date & Time</label>
                            <input id="end_date" name="end_date" type="datetime-local" required value={formData.end_date} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>
                        
                        
                        {/* Banner File Input */}
                        <div className="md:col-span-2">
                            <label htmlFor="banner_file" className="block text-sm font-medium text-white">
                                Event Banner Image (Required)
                            </label>
                            <input 
                                id="banner_file" 
                                name="banner_file" 
                                type="file" 
                                accept="image/*"
                                required
                                onChange={handleFileChange}
                                disabled={isFormBlocked}
                                className="mt-1 block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-green-400 hover:file:bg-gray-600 disabled:opacity-50"
                            />
                            {bannerFile && (
                                <p className="mt-1 text-xs text-gray-300">Selected: {bannerFile.name}</p>
                            )}
                        </div>
                        
                        {/* Ticket Price */}
                        <div>
                            <label htmlFor="ticket_price" className="block text-sm font-medium text-white">Ticket Price (Numeric)</label>
                            <input id="ticket_price" name="ticket_price" type="number" required step="0.01" value={formData.ticket_price ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>

                        {/* Max Participants */}
                        <div>
                            <label htmlFor="max_participants" className="block text-sm font-medium text-white">Max Participants (Integer)</label>
                            <input id="max_participants" name="max_participants" type="number" required step="1" value={formData.max_participants ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label htmlFor="contact_email" className="block text-sm font-medium text-white">Contact Email</label>
                            <input id="contact_email" name="contact_email" type="email" required value={formData.contact_email ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label htmlFor="contact_phone" className="block text-sm font-medium text-white">Contact Phone</label>
                            <input id="contact_phone" name="contact_phone" type="tel" required value={formData.contact_phone ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-white rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                                disabled={isFormBlocked}
                            />
                        </div>

                    </div>

                    <div className="pt-5">
                        <button
                            type="submit"
                            disabled={isFormBlocked}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading 
                                ? 'Processing...' 
                                : !user 
                                    ? 'Login Required'
                                    : organizationStatus === 'Approved'
                                        ? 'Create Event' 
                                        : 'Organization Not Approved'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}