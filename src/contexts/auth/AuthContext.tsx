
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { loadProfile, loadAssociationRights, loadUserAssociations } from './authUtils';
import { Profile, UserRole, Association } from '@/types/profile-types';
import { useNavigate } from 'react-router-dom';

// Define the type for our auth context
export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: UserRole;
  associations: Association[];
  currentAssociation: Association | null;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setCurrentAssociation: (associationId: string | null) => void;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [currentAssociation, setCurrentAssociationState] = useState<Association | null>(null);
  const navigate = useNavigate();

  // Stable callback to load user data
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.info('[AuthProvider] Loading user data for:', userId);
      const profileData = await loadProfile(userId);
      if (profileData) {
        console.info('[AuthProvider] Profile data loaded:', profileData);
        setProfile(profileData);
        
        // Load user associations
        const userAssociations = await loadUserAssociations(userId);
        console.info('[AuthProvider] User associations loaded:', userAssociations);
        setAssociations(userAssociations);
        
        // Set current association from localStorage or use first one
        const savedAssociationId = localStorage.getItem('currentAssociationId');
        if (savedAssociationId && userAssociations.some(a => a.id === savedAssociationId)) {
          const selectedAssociation = userAssociations.find(a => a.id === savedAssociationId) || null;
          setCurrentAssociationState(selectedAssociation);
        } else if (userAssociations.length > 0) {
          setCurrentAssociationState(userAssociations[0]);
          localStorage.setItem('currentAssociationId', userAssociations[0].id);
        }
      } else {
        console.warn('[AuthProvider] No profile data found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('[AuthProvider] Error loading user profile:', error);
      setProfile(null);
    }
  }, []);

  // Stable callback to set current association
  const setCurrentAssociation = useCallback((associationId: string | null) => {
    if (!associationId) {
      setCurrentAssociationState(null);
      localStorage.removeItem('currentAssociationId');
      return;
    }
    
    const association = associations.find(a => a.id === associationId) || null;
    setCurrentAssociationState(association);
    if (association) {
      localStorage.setItem('currentAssociationId', association.id);
    }
  }, [associations]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      console.info('[AuthProvider] Initializing authentication...');
      setLoading(true);
      
      // Check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.info('[AuthProvider] Initial session check:', currentSession ? 'Session found' : 'No session found');
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await loadUserData(currentSession.user.id);
      }
      
      setLoading(false);
      
      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, currentSession: Session | null) => {
          console.info('[AuthProvider] Auth state changed:', event, currentSession?.user?.email);
          
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            
            if (event === 'SIGNED_IN') {
              await loadUserData(currentSession.user.id);
            }
          } else {
            // User signed out
            setSession(null);
            setUser(null);
            setProfile(null);
            setAssociations([]);
            setCurrentAssociationState(null);
            localStorage.removeItem('currentAssociationId');
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, [loadUserData]);

  // Authentication methods
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate('/auth?tab=login');
    setLoading(false);
  }, [navigate]);

  const refreshSession = useCallback(async () => {
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  }, []);

  // Use memo to prevent unnecessary context re-renders
  const userRole = useMemo<UserRole>(() => {
    return (profile?.role as UserRole) || 'resident';
  }, [profile?.role]);

  // Use memo for the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    session,
    isAuthenticated: !!user,
    loading,
    userRole,
    associations,
    currentAssociation,
    signUp,
    signIn,
    signOut,
    refreshSession,
    setCurrentAssociation,
  }), [
    user, 
    profile, 
    session, 
    loading, 
    userRole, 
    associations, 
    currentAssociation, 
    signOut, 
    refreshSession, 
    setCurrentAssociation
  ]);

  console.info('[AuthProvider] Current state:', { 
    isAuthenticated: !!user, 
    userEmail: user?.email,
    profileLoaded: !!profile,
    loading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
