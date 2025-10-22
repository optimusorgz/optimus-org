import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, UserPlus, Users, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

const OrganizationRegistration = () => {
  const { toast } = useToast();
  const { createOrganization, joinOrganization, registerAsStaff } = useOrganization();
  
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create Organization Form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  // Join Organization Form
  const [joinForm, setJoinForm] = useState({
    organizationUuid: ''
  });

  // Staff Registration Form
  const [staffForm, setStaffForm] = useState({
    staffName: ''
  });

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createOrganization(createForm.name, createForm.description);
      
      if (result.success) {
        toast({
          title: "Organization Created!",
          description: "Your organization has been submitted for approval.",
        });
        setCreateForm({ name: '', description: '' });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create organization.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await joinOrganization(joinForm.organizationUuid);
      
      if (result.success) {
        toast({
          title: "Joined Organization!",
          description: "You have successfully joined the organization.",
        });
        setJoinForm({ organizationUuid: '' });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join organization.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAsStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerAsStaff(staffForm.staffName);
      
      if (result.success) {
        toast({
          title: "Staff Registration Complete!",
          description: "You are now registered as staff.",
        });
        setStaffForm({ staffName: '' });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to register as staff.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "UUID copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <p className="text-muted-foreground mt-2">
          Create, join, or manage your organization
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">New Organization</TabsTrigger>
              <TabsTrigger value="join">Join Organization</TabsTrigger>
              <TabsTrigger value="staff">Register as Staff</TabsTrigger>
            </TabsList>

            {/* CREATE ORGANIZATION */}
            <TabsContent value="create" className="space-y-6 mt-6">
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Create a new organization to start hosting events and managing your community.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your organization (optional)"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !createForm.name.trim()}
                  className="w-full"
                >
                  {loading ? "Creating..." : "Create Organization"}
                </Button>
              </form>
            </TabsContent>

            {/* JOIN ORGANIZATION */}
            <TabsContent value="join" className="space-y-6 mt-6">
              <Alert>
                <UserPlus className="h-4 w-4" />
                <AlertDescription>
                  Use an organization's UUID to join as a member.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleJoinOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-uuid">Organization UUID *</Label>
                  <Input
                    id="org-uuid"
                    value={joinForm.organizationUuid}
                    onChange={(e) => setJoinForm({ organizationUuid: e.target.value })}
                    placeholder="Enter organization UUID"
                    required
                  />
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• You'll become a member of the organization</p>
                  <p>• Access to organization dashboard and events</p>
                  <p>• Ability to participate in organization activities</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !joinForm.organizationUuid.trim()}
                  className="w-full"
                >
                  {loading ? "Joining..." : "Join Organization"}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER AS STAFF */}
            <TabsContent value="staff" className="space-y-6 mt-6">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Register as staff to represent your organization with a custom name.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleRegisterAsStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Staff Display Name *</Label>
                  <Input
                    id="staff-name"
                    value={staffForm.staffName}
                    onChange={(e) => setStaffForm({ staffName: e.target.value })}
                    placeholder="Enter your staff display name"
                    required
                  />
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Your posts will show this staff name instead of organization name</p>
                  <p>• You'll have a "Staff" badge on your posts</p>
                  <p>• This helps identify official organization representatives</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !staffForm.staffName.trim()}
                  className="w-full"
                >
                  {loading ? "Registering..." : "Register as Staff"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationRegistration;