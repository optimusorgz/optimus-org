import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit3, Building2, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  profile: any;
  onUpdateProfile: (data: { 
    name: string; 
    avatar_url: string | null;
    phone_number: string | null;
  }) => void;
}

const ProfileCard = ({ profile, onUpdateProfile }: ProfileCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userOrganisation, setUserOrganisation] = useState<any>(undefined); // Change to undefined for initial loading state

  // Run the fetch when the 'profile' prop changes
  useEffect(() => {
    if (profile) { // Ensure profile data is available
      fetchUserOrganisation();
    }
  }, [profile]); // Dependency on profile

  const fetchUserOrganisation = async () => {
    // 1. Check if the profile object exists and has an organization UUID
    if (!profile || !profile.organisation) {
      setUserOrganisation(null); // Explicitly set to null if no organization is linked in the profile
      return;
    }

    const organizationId = profile.organisation;

    try {
      // 2. Fetch the organization using the UUID from the profile table
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId) // Changed from owner_id to organization ID
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching organisation:', error);
        setUserOrganisation(null); // Fallback if there's a different error
        return;
      }
      
      // If the organization is found, data will have the details. If not found, data is null.
      setUserOrganisation(data); 

    } catch (error) {
      console.error('Error in fetchUserOrganisation:', error);
      setUserOrganisation(null);
    }
  };

  const handleRegisterOrganisation = () => {
    navigate('/register-organization');
  };

  const getOrganisationStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Use a loading state until the check is complete
  if (userOrganisation === undefined) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">Loading organization status...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.photo || user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold mb-1">
                {profile?.name || user?.user_metadata?.name || 'User'}
              </h2>
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                {profile?.phone_number && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {/* Removed the redundant profile.organisation display here */}
              </div>
              
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
                
                {/* The logic now relies solely on the userOrganisation state */}
                {!userOrganisation ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRegisterOrganisation}
                    className="w-full sm:w-auto"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Register Organisation
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Organisation:</span>
                    <Badge className={getOrganisationStatusColor(userOrganisation.status)}>
                      {userOrganisation.name} ({userOrganisation.status})
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        profile={profile ? { 
          name: profile.name, 
          avatar_url: profile.photo || null,
          phone_number: profile.phone_number || null,
          organisation: profile.organisation || null // ensure the UUID is passed if available
        } : null}
        onUpdateProfile={onUpdateProfile}
      />
    </>
  );
};

export default ProfileCard;