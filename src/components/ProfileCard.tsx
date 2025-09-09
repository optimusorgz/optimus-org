import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit3, Building2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import EditProfileModal from '@/components/EditProfileModal';
import RegisterOrganizationModal from '@/components/RegisterOrganizationModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileCardProps {
  profile: any;
  onUpdateProfile: (data: { name: string; avatar_url: string | null }) => void;
}

const ProfileCard = ({ profile, onUpdateProfile }: ProfileCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [hasOrganization, setHasOrganization] = useState(false);

  const handleRegisterOrganization = async (orgData: {
    name: string;
    description: string;
    website: string;
    contact_email: string;
    phone_number: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          description: orgData.description,
          owner_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      setHasOrganization(true);
      setIsOrgModalOpen(false);
      toast({
        title: "Success",
        description: "Organization registered successfully! Awaiting approval.",
      });
    } catch (error) {
      console.error('Error registering organization:', error);
      toast({
        title: "Error",
        description: "Failed to register organization.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold mb-1">
                {profile?.name || user?.user_metadata?.name || 'User'}
              </h2>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                
                <Button
                  variant={hasOrganization ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setIsOrgModalOpen(true)}
                  disabled={hasOrganization}
                  className="w-full sm:w-auto"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {hasOrganization ? "Organization Registered" : "Register Organization"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        profile={profile ? { name: profile.name, avatar_url: user?.user_metadata?.avatar_url || null } : null}
        onUpdateProfile={onUpdateProfile}
      />

      <RegisterOrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onRegisterOrganization={handleRegisterOrganization}
      />
    </>
  );
};

export default ProfileCard;