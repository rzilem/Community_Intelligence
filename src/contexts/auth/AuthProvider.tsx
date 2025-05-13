
import React, { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { Association } from '@/types/association-types';
import { UserAssociation } from './types';
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAssociations, setUserAssociations] = useState<UserAssociation[]>([]);
  const [currentAssociation, setCurrentAssociation] = useState<Association | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize authentication only once on component mount
  useEffect(() => {
    console.log('[AuthProvider] Initializing authentication...');
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    const initAuth = async () => {
      try {
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log('[AuthProvider] Auth state changed:', event, currentSession?.user?.email);
          
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
            setSession(currentSession);
            setUser(currentSession?.user || null);
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
        
        authSubscription = subscription;

        // Then check for an existing session
        const { data } = await supabase.auth.getSession();
        console.log('[AuthProvider] Initial session check:', data.session ? 'Session found' : 'No session');
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('[AuthProvider] Error fetching initial session:', error);
        setAuthError('Failed to fetch initial session');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Load user data when the user changes - using setTimeout to prevent blocking the auth callback
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const loadUserData = async () => {
      setLoading(true);
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
          setUserAssociations(associations || []);
          
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
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            profile_image_url: null
          } as Profile);
        }
      } catch (error) {
        console.error('[AuthProvider] Error loading user data:', error);
        toast.error('Failed to load user profile data');
      } finally {
        setLoading(false);
      }
    };

    // Small timeout to prevent blocking the auth state change callback
    const timeoutId = setTimeout(() => {
      loadUserData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [user, currentAssociation]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('[AuthProvider] Sign in error:', error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData: { first_name: string, last_name: string }
  ) => {
    try {
      setLoading(true);
      await signUpWithEmail(email, password, userData);
    } catch (error) {
      console.error('[AuthProvider] Sign up error:', error);
      toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await signOutUser();
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
      toast.error(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [user]);

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
