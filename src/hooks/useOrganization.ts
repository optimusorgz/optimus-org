import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '@/lib/supabase';
import { Organization, Profile } from '@/types';
import { useAuth } from '@/components/AuthContext';

export const useOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserOrganization();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserOrganization = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (userProfile) {
        setProfile(userProfile as Profile);
        
        // If user has an organization, fetch it
        if (userProfile.organisation_uuid) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', userProfile.organisation_uuid)
            .single();
          
          if (!orgError && org) {
            setOrganization(org as Organization);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching organization:', err);
      setError('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const joinOrganization = async (organizationUuid: string) => {
    try {
      setLoading(true);
      const { error } = await supabaseHelpers.joinOrganization(organizationUuid);
      
      if (error) throw error;
      
      await fetchUserOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error joining organization:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name: string, description?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabaseHelpers.createOrganization(name, description);
      
      if (error) throw error;
      
      await fetchUserOrganization();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating organization:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const registerAsStaff = async (staffName: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_staff: true, 
          staff_name: staffName 
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchUserOrganization();
      return { success: true };
    } catch (err) {
      console.error('Error registering as staff:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    organization,
    profile,
    loading,
    error,
    joinOrganization,
    createOrganization,
    registerAsStaff,
    refetch: fetchUserOrganization
  };
};