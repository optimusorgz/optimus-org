// components/ProfileSettingsForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import supabaset from '@/api/client'; // Your Supabase client instance
import { Button } from '@/components/ui/button'; // Your Button component (e.g., shadcn/ui)
import { Input } from '@/components/ui/input'; // Your Input component (e.g., shadcn/ui)
import { Label } from '@/components/ui/label'; // Your Label component (e.g., shadcn/ui)
import Image from 'next/image';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { User, Camera, Mail, Phone, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'; // Icons from lucide-react

// --- Type Definitions ---
interface ProfileUpdateData {
    name: string | null;
    avatar_url: string | null;
    phone_number: string | null; // Phone number is now managed here
}

interface ProfileSettingsFormProps {
    userId: string; 
    onUpdateComplete: () => void; 
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ userId, onUpdateComplete }) => {
    const supabase = supabaset; 
    const [profileData, setProfileData] = useState<ProfileUpdateData>({
        name: '',
        avatar_url: '',
        phone_number: '', // Initialize phone_number state
    });
    
    // State to hold the email, fetched separately but not editable
    const [email, setEmail] = useState<string>(''); 
    // State to manage loading/submission UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // State for user feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // --- Data Fetching: Load existing profile data and user email ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Get Auth User Data (for email)
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.email) {
                    setEmail(user.email);
                }

                // 2. Fetch Profile Table Data (for name, avatar_url, phone_number)
                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('name, avatar_url, phone_number') // Select phone_number
                    .eq('uuid', userId)
                    .single();

                if (profileError) {
                    throw profileError;
                }
                
                if (data) {
                    setProfileData({
                        name: data.name ?? '',
                        avatar_url: data.avatar_url ?? '',
                        phone_number: data.phone_number ?? '', // Set phone_number
                    });
                } 
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId, supabase]);

    // --- Avatar Upload Logic (Simplified: Phone update removed) ---
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!userId) {
                setError("User not authenticated for upload.");
                return;
            }

            const file = event.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            setError(null);
            setSuccess(null);

            // Generate a unique file path for the storage bucket
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${Date.now()}.${fileExt}`;

            // 1. Upload the file to the 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const newAvatarUrl = publicUrlData.publicUrl;

            // 3. Update the profile with the new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: newAvatarUrl })
                .eq('uuid', userId);

            if (updateError) {
                throw updateError;
            }

            // Update local state and show success
            setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
            setSuccess('Avatar updated successfully!');

        } catch (error: any) {
            console.error('Avatar upload failed:', error);
            setError(`Avatar upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    // --- Form Handling for Name and Phone Number Update ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            // Uses the input id ('name' or 'phone_number') to dynamically update state
            [id]: value
        }));
        setSuccess(null); 
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        // Payload includes name and phone_number
        const updatePayload: Partial<ProfileUpdateData> = {
            name: profileData.name,
            phone_number: profileData.phone_number,
            // avatar_url is updated separately in handleAvatarUpload
        };

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('uuid', userId); 

        if (updateError) {
            console.error('Error updating profile:', updateError);
            setError(`Update failed: ${updateError.message}`);
        } else {
            setSuccess('Profile updated successfully!');
            setTimeout(onUpdateComplete, 1500);
        }

        setIsSubmitting(false);
    };
    
    // --- Render Logic ---
   if (isLoading) {
    return (
        <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
    );
    }
    
    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-auto md:overflow-visible ">
            {/* Header Section */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white tracking-tight">Profile Settings</h2>
                
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Left Sidebar: Avatar focus */}
                <div className="w-full md:w-1/3 p-5 flex flex-col-2 md:flex-col items-center border-b md:border-b-0 md:border-r border-gray-800 bg-gray-900/50">
                    <div className="relative group">
                        <div className="w-22 h-22 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-cyan-500 transition-colors duration-300 relative bg-gray-800">
                            {profileData.avatar_url ? (
                                <Image
                                    src={profileData.avatar_url}
                                    alt="Current Avatar"
                                    className="object-cover"
                                    fill
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-600" />
                                </div>
                            )}
                            
                            <label 
                                htmlFor="avatar_upload"
                                className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer ${isUploading ? 'opacity-100' : ''}`}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-white mb-1" />
                                        <span className="text-[10px] text-white font-medium uppercase">Change</span>
                                    </>
                                )}
                            </label>
                        </div>
                        <input 
                            id="avatar_upload" 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploading || isSubmitting}
                            className="hidden"
                        />
                    </div>

                    <div className="mt-4 text-center">
                        <h3 className="text-white font-medium text-lg">{profileData.name || 'Your Name'}</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{email || 'Not connected'}</p>
                    </div>

                    
                </div>

                {/* Right Content: Form Fields */}
                <div className="flex-1 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email}
                                    readOnly 
                                    disabled 
                                    className="pl-10 bg-gray-950 border-gray-800 text-gray-500 cursor-not-allowed focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                                <Input 
                                    id="name" 
                                    type="text" 
                                    value={profileData.name || ''} 
                                    onChange={handleChange} 
                                    placeholder="Enter your full name"
                                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:ring-cyan-500 transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phone_number" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                                Phone Number
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                                <Input 
                                    id="phone_number" 
                                    type="tel" 
                                    value={profileData.phone_number || ''} 
                                    onChange={handleChange} 
                                    placeholder="+1 (555) 000-0000"
                                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:ring-cyan-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || isUploading}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-900/20 flex items-center justify-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Update Name & Phone</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsForm;