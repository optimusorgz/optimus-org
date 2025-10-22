import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://whcoayuuwebcpbgyesej.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoY29heXV1d2ViY3BiZ3llc2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDQ4NTAsImV4cCI6MjA3MDY4MDg1MH0.ILDUqhQbMKa3VbuoFF5t_TFe9sr8rV6DdhZkwDcSZTA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user's profile with organization
  async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return profile;
  },

  // Get organization by ID
  async getOrganizationById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Join organization by UUID
  async joinOrganization(organizationUuid: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ organisation_uuid: organizationUuid })
      .eq('user_id', user.id);

    return { error };
  },

  // Create new organization
  async createOrganization(name: string, description?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (orgError) return { error: orgError };

    // Update user's profile with organization ID
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organisation_uuid: org.id })
      .eq('user_id', user.id);

    return { data: org, error: profileError };
  }
};