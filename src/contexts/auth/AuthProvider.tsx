import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AuthContextType } from './types';
import { isAdminRole } from '@/utils/role-utils';
import { ensurePasswordNotLeaked } from '@/utils/security/password-utils';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isLoading: true,
  isAdmin: false,
  isAuthenticated: false,
  currentAssociation: null,
  userAssociations: [],
  userRole: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  setCurrentAssociation: () => {},
  refreshProfile: async () => {},
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

  // Determine if user is an admin
  const isAdmin = useMemo(() => {
    return isAdminRole(profile?.role);
  }, [profile?.role]);

  // Function to refresh the user profile data
  const refreshProfile = useCallback(async () => {
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
        console.log('Profile data reloaded:', profileData);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }
  }, [user]);

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
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: { first_name: string; last_name: string }) => {
    try {
      // New: prevent sign-up with leaked/breached passwords
      try {
        await ensurePasswordNotLeaked(password);
      } catch (err: any) {
        console.warn('[AuthProvider] Blocked leaked password during sign-up:', err);
        toast.error(err?.message || 'This password appears in known breaches. Please choose a different password.');
        throw err;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      throw error;
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
    isLoading: loading, // Alias loading as isLoading to match the type
    isAuthenticated,
    userAssociations,
    currentAssociation,
    userRole,
    isAdmin,
    signIn,
    signUp,
    signOut,
    setCurrentAssociation: handleSetCurrentAssociation,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
