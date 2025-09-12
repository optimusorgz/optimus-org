import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  role: 'user' | 'organiser' | 'admin';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: 'user' | 'organiser' | 'admin' | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'organiser' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile and role
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('AuthContext: Error fetching profile for user', userId, ':', error);
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        await createUserProfile(userId);
      } else {
        setProfile(null);
        setUserRole(null);
      }
    } else {
      setProfile(data);
      setUserRole(data.role);
      console.log("AuthContext: User role fetched from profiles table for user", userId, ":", data.role);
    }
  };

  // Function to create user profile on first login
  const createUserProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'user'
        })
        .select('id, name, role')
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setProfile(null);
        setUserRole(null);
      } else {
        setProfile(data);
        setUserRole(data.role);
        console.log("AuthContext: Profile created for user", userId, ":", data.role);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      setProfile(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      console.log("AuthContext: Initial session fetched. User:", session?.user, "Session:", session);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setUserRole(null);
        console.log("AuthContext: User is not logged in after initial session check.");
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthContext: Auth state changed. Event:", event, "Session:", session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          console.log("AuthContext: User is not logged in after auth state change.");
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
          role: 'user' // Default role for new sign-ups
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    userRole,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};