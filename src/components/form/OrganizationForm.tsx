'use client';

import { useState, useEffect } from 'react';
import supabase from '@/api/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CircularLoader from '@/components/ui/CircleLoader';
import Loader from '@/components/ui/Loader';

import { AlertCircle, CheckCircle2, Building2, Camera, Phone, Users, Briefcase, Linkedin } from 'lucide-react';

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
    orgId?: string;
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

    // 🔥 3 required + 2 optional (all editable)
    const [members, setMembers] = useState([
        { name: '', position: '', linkedin: '' }, // required
        { name: '', position: '', linkedin: '' }, // required
        { name: '', position: '', linkedin: '' }, // required
        { name: '', position: '', linkedin: '' }, // optional
        { name: '', position: '', linkedin: '' }, // optional
    ]);

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatarKey, setAvatarKey] = useState(Date.now());

    useEffect(() => {
        if (!isEditMode || !orgId) return;

        const fetchOrganization = async () => {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('organizations')
                .select('name, description, avatar_url, phone_number, team_members')
                .eq('id', orgId)
                .single();

            if (data) {
                setName(data.name);
                setDescription(data.description);
                setCurrentAvatarUrl(data.avatar_url);
                setPhoneNumber(data.phone_number || '');
                setAvatarKey(Date.now());

                // 🔥 IMPORTANT: Load members from JSON
                if (data.team_members && Array.isArray(data.team_members)) {
                    setMembers([
                        ...data.team_members,
                        ...Array(5 - data.team_members.length).fill({ name: '', position: '', linkedin: '' })
                    ].slice(0, 5));
                }
            }

            if (error) setError('Failed to load organization');

            setIsLoading(false);
        };

        fetchOrganization();
    }, [orgId]);

    const updateMember = (index: number, field: string, value: string) => {
        const updated = [...members];
        updated[index][field as keyof typeof updated[0]] = value;
        setMembers(updated);
    };

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
        let user = null;

        // 🔐 Only fetch user in CREATE mode
        if (!isEditMode) {
            const userRes = await supabase.auth.getUser();
            user = userRes.data.user;

            if (!user) throw new Error("Not authenticated");
        }

        // 🔥 Validate first 3 members
        const requiredMembers = members.slice(0, 3);
        const isValid = requiredMembers.every(
            (m) => m.name.trim() && m.position.trim()
        );

        if (!isValid) {
            setError("Please fill at least 3 members with name and position.");
            setIsSubmitting(false);
            return;
        }

        // 🔥 Upload avatar
        let avatarUrl = currentAvatarUrl;

        if (avatarFile) {
            setIsUploading(true);

            const filePath = `${Date.now()}_${avatarFile.name}`;
            avatarUrl = await uploadFileToSupabase(
                "organization_logos",
                filePath,
                avatarFile
            );

            if (!avatarUrl) throw new Error("Avatar upload failed");

            setIsUploading(false);
        }

        // 🔥 Clean members (VERY IMPORTANT)
        const validMembers = members
            .filter((m) => m.name.trim() && m.position.trim())
            .map((m) => ({
                name: m.name || "Member",
                position: m.position || "Role",
                linkedin: m.linkedin || "Linkdin"
            }));

        // 🔥 Final payload (single source of truth)
        const payload = {
            name,
            description,
            avatar_url: avatarUrl,
            phone_number: PhoneNumber,
            team_members: validMembers || [] // 🔥 always send
        };

        // ======================
        // ✏️ EDIT MODE
        // ======================
        if (isEditMode) {
            console.log("✏️ Updating organization:", orgId);

            const { data, error } = await supabase
                .from("organizations")
                .update(payload)
                .eq("id", orgId)
                .select()
                .single();

            console.log("📥 Update response:", data, error);

            if (error) throw error;
        }

        // ======================
        // 🆕 CREATE MODE
        // ======================
        else {
            const { data, error } = await supabase
                .from("organizations")
                .insert({
                    ...payload,
                    owner_id: user!.id,
                    status: "Pending",
                })
                .select()
                .single();

            if (error) throw error;
        }

        // 🎉 SUCCESS
        setSuccess(isEditMode ? "Updated successfully" : "Registered successfully");

        setTimeout(() => onSuccess(), 600);

    } catch (err: any) {
        console.error("🔥 ERROR:", err);
        setError(err.message || "Something went wrong");
    }

    setIsSubmitting(false);
    setIsUploading(false);
};

    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader /></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-screen text-slate-200">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        {isEditMode ? "Edit " : "Register "} 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Organization
                        </span>
                    </h2>
                    <p className="mt-3 text-gray-400 text-lg max-w-xl">
                        {isEditMode 
                            ? "Update your company profile and team information."
                            : "Tell us about your organization and the talented people behind it."}
                    </p>
                </div>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="mb-8 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-400 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="text-sm font-medium">{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="gap-8">
                {/* Main Information Section */}
                <div className="lg:col-span-7 space-y-8 mb-3 bg-[#020617]">
                    <section className="bg-gray-900/50 border border-gray-800 px-2 py-5 md:p-8 rounded-l shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6 text-cyan-400 font-semibold uppercase tracking-wider text-xs">
                            <Building2 className="w-4 h-4" />
                            General Information
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="org-name" className="text-gray-300 ml-1">Company Name</Label>
                                <Input 
                                    id="org-name"
                                    className="h-12 text-lg" 
                                    placeholder="Enter organization name"
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="org-desc" className="text-gray-300 ml-1">About the Organization</Label>
                                <textarea
                                    id="org-desc"
                                    rows={5}
                                    placeholder="Describe your organization's mission and goals..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 p-4 rounded-md text-gray-200 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="org-phone" className="text-gray-300 ml-1">Contact Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            id="org-phone"
                                            type="tel"
                                            className="pl-10 h-11"
                                            placeholder="+1 (555) 000-0000"
                                            value={PhoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300 ml-1">Company Logo</Label>
                                    <div className="flex items-center gap-4">
                                        {currentAvatarUrl && (
                                            <div className="relative group">
                                                <img
                                                    src={`${currentAvatarUrl}?v=${avatarKey}`}
                                                    alt="Logo"
                                                    className="rounded-xl border border-cyan-500/30 object-cover w-14 h-14 bg-gray-900 shadow-lg"
                                                />
                                            </div>
                                        )}
                                        <label className="flex-1 cursor-pointer group">
                                            <div className="flex items-center justify-center gap-2 h-11 px-4 rounded-md border-2 border-dashed border-gray-800 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 transition-all text-sm text-gray-500">
                                                <Camera className="w-4 h-4" />
                                                <span className="truncate max-w-[120px]">{avatarFile ? avatarFile.name : "Select Image"}</span>
                                            </div>
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Team Section */}
                <div className="lg:col-span-5 space-y-8 bg-[#020617]">
                    <section className="bg-gray-900/50 border border-gray-800 p-5 md:p-8 rounded-l shadow-xl h-full backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3 text-cyan-400 font-semibold uppercase tracking-wider text-xs">
                                <Users className="w-4 h-4" />
                                Leadership Team
                            </div>
                            <span className="text-[10px] bg-gray-800 px-2 py-1 rounded-full text-gray-400 border border-gray-700">
                                Min 3 Required
                            </span>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar pt-2">
                            {members.map((member, index) => (
                                <div key={index} className={`relative px-2 py-4 rounded-xl border transition-all ${index < 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-gray-950/40 border-gray-800'}`}>
                                    {index < 3 && (
                                        <div className="absolute -top-2 -right-2 bg-cyan-600 text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-lg z-10">
                                            REQUIRED
                                        </div>
                                    )}
                                    

                                    <div className="space-y-3">
                                        <Input
                                            className="bg-transparent border-gray-800/60 focus:border-cyan-500/40 h-10 text-sm"
                                            placeholder="Full Name"
                                            value={member.name}
                                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="relative">
                                                <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                                <Input
                                                    className="bg-transparent border-gray-800/60 focus:border-cyan-500/40 h-10 text-sm pl-8"
                                                    placeholder="Role / Title"
                                                    value={member.position}
                                                    onChange={(e) => updateMember(index, 'position', e.target.value)}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                                <Input
                                                    className="bg-transparent border-gray-800/60 focus:border-cyan-500/40 h-10 text-sm pl-8"
                                                    placeholder="LinkedIn"
                                                    value={member.linkedin}
                                                    onChange={(e) => updateMember(index, 'linkedin', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer for Actions */}
                <div className="lg:col-span-12 mt-4">
                        

                        <Button 
                            type = "submit"
                            disabled={isSubmitting || isUploading} 
                            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {(isSubmitting || isUploading) && <CircularLoader />}
                            
                            <span className="uppercase tracking-widest text-xs">
                                {isUploading
                                    ? "Uploading Assets..."
                                    : isSubmitting
                                    ? isEditMode ? "Applying Changes..." : "Finalizing..."
                                    : isEditMode ? "Save Changes" : "Complete Registration"}
                            </span>
                        </Button>
                    
                </div>
            </form>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1f2937;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #374151;
                }
            `}</style>
        </div>
    );
};

export default OrganizationForm;