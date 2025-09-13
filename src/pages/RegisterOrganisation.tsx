import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Organization {
    id: string;
    name: string;
    status: string;
    description?: string;
}

const RegisterOrganisation = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [nameExists, setNameExists] = useState(false);

    useEffect(() => {
        checkExistingOrganization();
    }, []);

    const checkExistingOrganization = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }

            const { data: orgData } = await supabase
                .from('organizations')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (orgData) {
                setOrganization(orgData);
            }
        } catch (error) {
            console.error('Error checking organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkNameAvailability = async (name: string) => {
        if (!name.trim()) {
            setNameExists(false);
            return;
        }

        try {
            const { data } = await supabase
                .from('organizations')
                .select('id')
                .eq('name', name.trim())
                .single();

            setNameExists(!!data);
        } catch (error) {
            setNameExists(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'name') {
            const timeoutId = setTimeout(() => {
                checkNameAvailability(value);
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nameExists) {
            toast({
                title: "Name unavailable",
                description: "This organization name is already taken",
                variant: "destructive",
            });
            return;
        }
        if (!formData.name.trim()) {
            toast({
                title: "Name required",
                description: "Please enter an organization name",
                variant: "destructive",
            });
            return;
        }
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');
            const { data, error } = await supabase
                .from('organizations')
                .insert({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    owner_id: user.id,
                    status: 'pending'
                })
                .select()
                .single();
            if (error) throw error;
            toast({
                title: "Organization registered",
                description: "Your organization has been submitted for approval",
            });
            setOrganization(data);
        } catch (error: any) {
            console.error('Error registering organization:', error);
            toast({
                title: "Registration failed",
                description: error.message || "Failed to register organization",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">Organization Registration</h1>
                    <p className="text-muted-foreground mt-2">
                        Register your organization to create and manage events
                    </p>
                </div>
                {organization ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {organization.status === 'approved' ? (
                                    <CheckCircle className="h-5 w-5 text-success" />
                                ) : (
                                    <Clock className="h-5 w-5 text-warning" />
                                )}
                                Organization Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold">{organization.name}</h3>
                                {organization.description && (
                                    <p className="text-muted-foreground mt-1">{organization.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                {organization.status === 'approved' ? (
                                    <span className="text-success font-medium">Approved ✓</span>
                                ) : organization.status === 'rejected' ? (
                                    <span className="text-destructive font-medium">Rejected ✗</span>
                                ) : (
                                    <span className="text-warning font-medium">Pending Approval ⏳</span>
                                )}
                            </div>
                            {organization.status === 'approved' && (
                                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                                    <p className="text-success font-medium">
                                        🎉 Congratulations! Your organization has been approved.
                                    </p>
                                    <p className="text-sm text-success/80 mt-1">
                                        You can now create events and manage registrations.
                                    </p>
                                    <Button
                                        className="mt-3"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Go to Dashboard
                                    </Button>
                                </div>
                            )}
                            {organization.status === 'pending' && (
                                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                                    <p className="text-warning font-medium">
                                        ⏳ Your organization is pending admin approval.
                                    </p>
                                    <p className="text-sm text-warning/80 mt-1">
                                        We'll notify you once your organization has been reviewed and approved.
                                        This usually takes 1-2 business days.
                                    </p>
                                </div>
                            )}
                            {organization.status === 'rejected' && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <p className="text-destructive font-medium">
                                        ❌ Your organization registration was rejected.
                                    </p>
                                    <p className="text-sm text-destructive/80 mt-1">
                                        Please contact support for more information or to resubmit your application.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Register Your Organization</CardTitle>
                            <CardDescription>
                                Provide details about your organization. All fields marked with * are required.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Organization Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Enter your organization name"
                                        required
                                    />
                                    {nameExists && (
                                        <p className="text-sm text-destructive">
                                            This organization name is already taken
                                        </p>
                                    )}
                                    {formData.name && !nameExists && (
                                        <p className="text-sm text-success">
                                            Organization name is available ✓
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        placeholder="Brief description of your organization (optional)"
                                        rows={4}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Provide a brief description of your organization's purpose and activities.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-2">What happens next?</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Your organization will be submitted for admin review</li>
                                        <li>• Approval typically takes 1-2 business days</li>
                                        <li>• Once approved, you can create and manage events</li>
                                        <li>• You'll receive an email notification when approved</li>
                                    </ul>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting || nameExists || !formData.name.trim()}
                                        className="flex-1"
                                    >
                                        {submitting ? "Registering..." : "Register Organization"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Why Register an Organization?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                            <div>
                                <p className="font-medium">Create Events</p>
                                <p className="text-sm text-muted-foreground">
                                    Only approved organizations can create and manage events
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                            <div>
                                <p className="font-medium">Manage Registrations</p>
                                <p className="text-sm text-muted-foreground">
                                    Track attendees, check-ins, and generate reports
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                            <div>
                                <p className="font-medium">QR Code Scanning</p>
                                <p className="text-sm text-muted-foreground">
                                    Use our scanner dashboard for event check-ins
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default RegisterOrganisation;
