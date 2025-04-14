
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/app-types';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAssociations, setUserAssociations] = useState<UserAssociation[]>([]);
  const [currentAssociation, setCurrentAssociation] = useState<Association | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session found' : 'No session', session);
      setSession(session);
      setUser(session?.user || null);
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
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const profileData = await loadUserProfile(user.id);
          
          if (profileData) {
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
            setUserRole(profileData.role);
            
            const associations = await loadUserAssociations(user.id);
            setUserAssociations(associations);
            
            if (associations?.length > 0 && !currentAssociation) {
              setCurrentAssociation(associations[0].associations);
            }
          }
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
    await signInWithEmail(email, password);
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { first_name: string, last_name: string }
  ) => {
    await signUpWithEmail(email, password, userData);
  };

  const signOut = async () => {
    await signOutUser();
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const { profile: updatedProfile } = await fetchUserProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
