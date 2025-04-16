
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
    console.log('AuthProvider mounted');
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session check:', session ? 'Session found' : 'No session', session);
        setSession(session);
        setUser(session?.user || null);
      }).catch(error => {
        console.error('Error fetching initial session:', error);
        setAuthError('Failed to fetch initial session');
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
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
      console.error('Unexpected error in auth subscription:', error);
      setAuthError('Authentication service unavailable');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          console.log('Loading user data for:', user.id);
          const profileData = await loadUserProfile(user.id);
          
          if (profileData) {
            console.log('Profile data loaded:', profileData);
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
            setUserRole(profileData.role);
            
            const associations = await loadUserAssociations(user.id);
            console.log('User associations loaded:', associations);
            setUserAssociations(associations);
            
            if (associations?.length > 0 && !currentAssociation) {
              setCurrentAssociation(associations[0].associations);
            }
          } else {
            console.warn('No profile data found for user:', user.id);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
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
      console.error('Sign in error:', error);
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
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const { profile: updatedProfile } = await fetchUserProfile(user.id);
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.error('Error refreshing profile:', error);
        toast.error('Failed to refresh profile');
      }
    }
  };

  const isAuthenticated = !!user;

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

  if (authError) {
    console.error('Auth context error state:', authError);
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
