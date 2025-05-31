import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from './types';

console.log('🚀 AuthProvider: Initializing AuthProvider...');

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('resident');

  console.log('🚀 AuthProvider: Component rendering, loading:', loading);

  useEffect(() => {
    console.log('🚀 AuthProvider: useEffect - Getting initial session...');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🚀 AuthProvider: Initial session result:', { session: !!session, error });
        
        if (error) {
          console.error('❌ AuthProvider: Error getting session:', error);
        }
        
        if (session?.user) {
          console.log('✅ AuthProvider: User found in session:', session.user.id);
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          console.log('ℹ️ AuthProvider: No user in session');
        }
      } catch (error) {
        console.error('❌ AuthProvider: Exception getting session:', error);
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
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
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
        return;
      }

      console.log('✅ AuthProvider: Profile loaded successfully');
      setProfile(data);
      setUserRole(data?.role || 'resident');
    } catch (error) {
      console.error('❌ AuthProvider: Exception loading profile:', error);
    }
  };

  const signIn = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      if (error) throw error;
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
      setProfile(null);
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    loading,
    userRole: profile?.role || 'resident',
    signIn,
    signUp,
    signOut,
  };

  console.log('🚀 AuthProvider: Providing context, user:', !!user, 'loading:', loading);

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
