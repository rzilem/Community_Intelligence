import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  phone_number?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Association {
  id: string;
  name: string;
  type: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  status?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  property_type?: string;
  units?: number;
  founded_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  associations: Association[];
  isLoading: boolean;
  isSigningOut: boolean;
  isSigningIn: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Backward compatibility properties
  loading: boolean;
  isAuthenticated: boolean;
  userRole: string;
  isAdmin: boolean;
  currentAssociation: Association | null;
  userAssociations: Association[];
  setCurrentAssociation: (association: Association | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string }) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  associations: [],
  isLoading: true,
  isSigningOut: false,
  isSigningIn: false,
  error: null,
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [currentAssociation, setCurrentAssociation] = useState<Association | null>(null);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Failed to load session' 
          }));
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setState(initialState);
            setCurrentAssociation(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      console.log('🔄 Loading user profile for:', user.email);
      
      // Set user immediately, don't set isLoading to true here as it conflicts with isSigningIn
      setState(prev => ({ ...prev, user }));
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Error loading user profile:', error);
      }

      const finalProfile = profile || {
        id: user.id,
        email: user.email || '',
        role: 'resident'
      };

      console.log('✅ Profile loaded:', finalProfile);

      setState(prev => ({
        ...prev,
        profile: finalProfile,
        associations: [],
        isLoading: false,
        isSigningIn: false,
        error: null,
      }));

    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSigningIn: false,
        error: 'Failed to load profile',
      }));
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    await loadUserProfile(state.user);
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isSigningOut: true }));
    
    try {
      await supabase.auth.signOut();
      setState(initialState);
      setCurrentAssociation(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({ 
        ...prev, 
        isSigningOut: false,
        error: 'Failed to sign out' 
      }));
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    signOut,
    refreshProfile,
    // Backward compatibility
    loading: state.isLoading || state.isSigningIn,
    isAuthenticated: !!state.user,
    userRole: state.profile?.role || 'resident',
    isAdmin: state.profile?.role === 'admin',
    currentAssociation,
    userAssociations: state.associations,
    setCurrentAssociation,
    signIn: async (email: string, password: string) => {
      console.log('🚀 Starting sign in for:', email);
      setState(prev => ({ ...prev, isSigningIn: true, error: null }));
      
      return new Promise<void>((resolve, reject) => {
        // Reduced timeout to 5 seconds for better UX
        const timeoutId = setTimeout(() => {
          console.error('⏰ Sign in timeout - forcing clear isSigningIn state');
          setState(prev => ({ 
            ...prev, 
            isSigningIn: false, 
            error: 'Sign in timed out. Please try again.' 
          }));
          reject(new Error('Sign in timed out'));
        }, 5000);
        
        // Watch for auth state changes to resolve the promise
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
            console.log('✅ Sign in completed with auth state change');
            resolve();
          }
        });
        
        // Perform the actual sign in
        supabase.auth.signInWithPassword({ email, password })
          .then(({ error }) => {
            if (error) {
              clearTimeout(timeoutId);
              subscription.unsubscribe();
              console.log('❌ Sign in error:', error.message);
              setState(prev => ({ ...prev, isSigningIn: false, error: error.message }));
              reject(error);
            }
            console.log('✅ Sign in request successful, waiting for auth state...');
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
            console.log('💥 Sign in exception:', error);
            setState(prev => ({ ...prev, isSigningIn: false }));
            reject(error);
          });
      });
    },
    signUp: async (email: string, password: string, userData: { first_name: string; last_name: string }) => {
      setState(prev => ({ ...prev, isSigningIn: true, error: null }));
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) {
          setState(prev => ({ ...prev, isSigningIn: false, error: error.message }));
          throw error;
        }
      } catch (error) {
        setState(prev => ({ ...prev, isSigningIn: false }));
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};