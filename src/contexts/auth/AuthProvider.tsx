
import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { fetchUserProfile } from '@/services/user-service';
import { useAuthState } from './hooks/useAuthState';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useLoadUserData } from './hooks/useLoadUserData';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  const {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    isAdmin,
    setIsAdmin,
    userRole,
    setUserRole,
    userAssociations,
    setUserAssociations,
    currentAssociation,
    setCurrentAssociation,
  } = authState;

  const { signIn, signUp, signOut } = useAuthMethods(setLoading);
  const { loadUserData } = useLoadUserData({
    setProfile,
    setIsAdmin,
    setUserRole,
    setUserAssociations,
    setCurrentAssociation,
    currentAssociation,
    setLoading,
  });

  const refreshProfile = useCallback(async () => {
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
  }, [user?.id, setProfile]);

  // Initialize auth state
  useEffect(() => {
    console.log('[AuthProvider] Initializing authentication...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthProvider] Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
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

    // Only fetch the session once on initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] Initial session check:', session ? 'Session found' : 'No session');
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    }).catch(error => {
      console.error('[AuthProvider] Error fetching initial session:', error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setProfile, setIsAdmin, setUserRole, setUserAssociations, setCurrentAssociation, setLoading]);

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData(user);
    }
  }, [user, loadUserData]);

  const isAuthenticated = !!user;

  console.log('[AuthProvider] Current state:', { 
    isAuthenticated, 
    userEmail: user?.email,
    profileLoaded: !!profile,
    loading
  });

  const contextValue = {
    user,
    currentUser: user,
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
