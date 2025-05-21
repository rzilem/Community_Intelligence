
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  currentAssociation: null,
  userAssociations: [],
  userRole: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  setCurrentAssociation: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAssociations, setUserAssociations] = useState<any[]>([]);
  const [currentAssociation, setCurrentAssociation] = useState<any | null>(null);

  // Determine authentication state
  const isAuthenticated = !!user;
  
  // Determine user role
  const userRole = useMemo(() => {
    return profile?.role || null;
  }, [profile?.role]);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (profileData) {
          setProfile(profileData);
          console.log('Profile data loaded:', profileData);
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Fetch user associations when user changes
  useEffect(() => {
    const fetchAssociations = async () => {
      if (!user) {
        setUserAssociations([]);
        setCurrentAssociation(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('association_users')
          .select(`
            *,
            associations:association_id (*)
          `)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching user associations:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.info('[AuthProvider] User associations loaded:', data);
          setUserAssociations(data);
          
          // Set first association as current if not already set
          if (!currentAssociation) {
            setCurrentAssociation(data[0].associations);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching associations:', error);
      }
    };
    
    fetchAssociations();
  }, [user, currentAssociation]);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If user logs out, reset states
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setCurrentAssociation(null);
          setUserAssociations([]);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      return { error };
    }
  };

  const signUp = async ({ email, password, firstName, lastName }: { 
    email: string; 
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  };

  const handleSetCurrentAssociation = (association: any) => {
    setCurrentAssociation(association);
  };

  const contextValue = {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    userAssociations,
    currentAssociation,
    userRole,
    signIn,
    signUp,
    signOut,
    setCurrentAssociation: handleSetCurrentAssociation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
