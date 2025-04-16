
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { Association, UserAssociation } from './types';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser,
  loadUserProfile,
  loadUserAssociations
} from './authUtils';
import { fetchUserProfile } from '@/services/user-service';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userAssociations, setUserAssociations] = React.useState<UserAssociation[]>([]);
  const [currentAssociation, setCurrentAssociation] = React.useState<Association | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);

  useEffect(() => {
    console.log('[AuthProvider] Initializing authentication...');
    try {
      // First check for an existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[AuthProvider] Initial session check:', session ? 'Session found' : 'No session');
        setSession(session);
        setUser(session?.user || null);
      }).catch(error => {
        console.error('[AuthProvider] Error fetching initial session:', error);
        setAuthError('Failed to fetch initial session');
        setLoading(false);
      });

      // Then set up the auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[AuthProvider] Auth state changed:', event, session?.user?.email);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setUserRole(null);
          setUserAssociations([]);
          setCurrentAssociation(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('[AuthProvider] Unexpected error in auth subscription:', error);
      setAuthError('Authentication service unavailable');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          console.log('[AuthProvider] Loading user data for:', user.id);
          const profileData = await loadUserProfile(user.id);
          
          if (profileData) {
            console.log('[AuthProvider] Profile data loaded:', profileData);
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
            setUserRole(profileData.role);
            
            const associations = await loadUserAssociations(user.id);
            console.log('[AuthProvider] User associations loaded:', associations);
            setUserAssociations(associations);
            
            if (associations?.length > 0 && !currentAssociation) {
              setCurrentAssociation(associations[0].associations);
            }
          } else {
            console.warn('[AuthProvider] No profile data found for user:', user.id);
            // Create a default profile in memory to prevent errors
            setProfile({
              id: user.id,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Add other required Profile fields with defaults
            } as Profile);
          }
        } catch (error) {
          console.error('[AuthProvider] Error loading user data:', error);
          toast.error('Failed to load user profile data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, currentAssociation]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('[AuthProvider] Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { first_name: string, last_name: string }
  ) => {
    try {
      await signUpWithEmail(email, password, userData);
    } catch (error) {
      console.error('[AuthProvider] Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        console.log('[AuthProvider] Refreshing profile for user:', user.id);
        const { profile: updatedProfile } = await fetchUserProfile(user.id);
        if (updatedProfile) {
          console.log('[AuthProvider] Updated profile:', updatedProfile);
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.error('[AuthProvider] Error refreshing profile:', error);
        toast.error('Failed to refresh profile');
      }
    }
  };

  const isAuthenticated = !!user;

  console.log('[AuthProvider] Current state:', { 
    isAuthenticated, 
    userEmail: user?.email,
    profileLoaded: !!profile,
    loading
  });

  const contextValue = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isLoading: loading,
    userRole,
    userAssociations,
    currentAssociation,
    isAdmin,
    isAuthenticated,
    setCurrentAssociation,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
