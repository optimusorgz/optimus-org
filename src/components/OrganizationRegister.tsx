import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

const OrganizationRegistration = () => {
  const { toast } = useToast();
  const { createOrganization, joinOrganization } = useOrganization();

  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);

  // Create Organization Form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });

  // Join Organization Form
  const [joinForm, setJoinForm] = useState({
    organizationUuid: ''
  });

  // Handle organization creation
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createOrganization(createForm.name, createForm.description);

      if (result.success) {
        toast({
          title: 'Organization Created!',
          description: 'Your organization UUID has been saved to your profile. Share it with others to let them join your organization.',
        });
        setCreateForm({ name: '', description: '' });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create organization.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle joining an organization
  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await joinOrganization(joinForm.organizationUuid);

      if (result.success) {
        toast({
          title: 'Joined Organization!',
          description: 'You have successfully joined the organization. Your profile has been updated.',
        });
        setJoinForm({ organizationUuid: '' });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to join organization.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <p className="text-muted-foreground mt-2">
          Create or join your organization
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">New Organization</TabsTrigger>
              <TabsTrigger value="join">Join Organization</TabsTrigger>
            </TabsList>

            {/* CREATE ORGANIZATION */}
            <TabsContent value="create" className="space-y-6 mt-6">
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  Create a new organization to host events and manage your team. A unique organization UUID will be generated and saved in your profile.
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
                  {loading ? 'Creating...' : 'Create Organization'}
                </Button>
              </form>
            </TabsContent>

            {/* JOIN ORGANIZATION */}
            <TabsContent value="join" className="space-y-6 mt-6">
              <Alert>
                <UserPlus className="h-4 w-4" />
                <AlertDescription>
                  Enter an existing organization's UUID to join it. This UUID will be saved in your profile.
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
                  <p>• The UUID links your account to the organization</p>
                  <p>• You’ll gain access to organization events and dashboards</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !joinForm.organizationUuid.trim()}
                  className="w-full"
                >
                  {loading ? 'Joining...' : 'Join Organization'}
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
