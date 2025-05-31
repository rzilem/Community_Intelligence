import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile, UserAssociation } from './types';
import { Association } from '@/types/association-types';

console.log('🚀 AuthProvider: Initializing AuthProvider...');

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAssociations, setUserAssociations] = useState<UserAssociation[]>([]);
  const [currentAssociation, setCurrentAssociation] = useState<Association | null>(null);
  
  // Use a ref to prevent infinite loops
  const initializationRef = useRef(false);

  console.log('🚀 AuthProvider: Component rendering, loading:', loading);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    console.log('🚀 AuthProvider: useEffect - Getting initial session...');
    
    // Get initial session with timeout fallback
    const getInitialSession = async () => {
      try {
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        console.log('🚀 AuthProvider: Initial session result:', { session: !!session, error });
        
        if (error && error.message !== 'Session timeout') {
          console.error('❌ AuthProvider: Error getting session:', error);
        }
        
        if (session?.user) {
          console.log('✅ AuthProvider: User found in session:', session.user.id);
          setUser(session.user);
          setSession(session);
          await loadUserProfile(session.user.id);
        } else {
          console.log('ℹ️ AuthProvider: No user in session');
          // Set default mock profile for development
          setProfile({
            id: 'demo-user',
            email: 'demo@example.com',
            first_name: 'Demo',
            last_name: 'User',
            role: 'admin',
            phone_number: null,
            preferred_language: 'en',
            profile_image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ AuthProvider: Exception getting session:', error);
        // Fallback for development - create a demo session
        console.log('🔧 AuthProvider: Creating demo session for development');
        setProfile({
          id: 'demo-user',
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin',
          phone_number: null,
          preferred_language: 'en',
          profile_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
        console.log('✅ AuthProvider: Initial auth check complete');
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🚀 AuthProvider: Auth state change:', event, !!session?.user);
      
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setUserAssociations([]);
        setCurrentAssociation(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('🚀 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('🚀 AuthProvider: Loading user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ AuthProvider: Error loading profile:', error);
        // Create a fallback profile
        setProfile({
          id: userId,
          email: 'user@example.com',
          first_name: 'User',
          last_name: 'Name',
          role: 'resident',
          phone_number: null,
          preferred_language: 'en',
          profile_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return;
      }

      console.log('✅ AuthProvider: Profile loaded successfully');
      setProfile(data);
    } catch (error) {
      console.error('❌ AuthProvider: Exception loading profile:', error);
      // Create a fallback profile
      setProfile({
        id: userId,
        email: 'user@example.com',
        first_name: 'User',
        last_name: 'Name',
        role: 'resident',
        phone_number: null,
        preferred_language: 'en',
        profile_image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const signIn = async (email: string, password?: string) => {
    try {
      setLoading(true);
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        alert('Check your email for the magic link to sign in.');
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password?: string, userData?: { first_name: string; last_name: string }) => {
    try {
      setLoading(true);
      if (password) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/auth`,
            data: userData
          } 
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password: 'temp-password',
          options: { emailRedirectTo: `${window.location.origin}/auth` } 
        });
        if (error) throw error;
      }
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserAssociations([]);
      setCurrentAssociation(null);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isLoading: loading,
    userRole: profile?.role || 'resident',
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user || !!profile, // Allow demo profile to count as authenticated
    userAssociations,
    currentAssociation,
    signIn,
    signUp,
    signOut,
    setCurrentAssociation,
    refreshProfile,
  };

  console.log('🚀 AuthProvider: Providing context, user:', !!user, 'profile:', !!profile, 'loading:', loading);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};