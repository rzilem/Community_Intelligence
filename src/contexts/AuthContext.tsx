import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Profile, UserWithProfile } from '@/types/app-types';
import { toast } from 'sonner';
import { fetchUserProfile, fetchUserAssociations, updateUserProfile } from '@/services/user-service';

interface Association {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
}

interface UserAssociation {
  id: string;
  role: string;
  associations: Association;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isLoading: boolean; 
  userRole: string | null;
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string, last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setCurrentAssociation: (association: Association | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isLoading: true,
  userRole: null,
  userAssociations: [],
  currentAssociation: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAdmin: false,
  isAuthenticated: false,
  setCurrentAssociation: () => {},
  refreshProfile: async () => {},
});

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
          console.log('Fetching profile for user:', user.id);
          let profileData = await fetchUserProfile(user.id);
          
          if (profileData && profileData.role !== 'admin') {
            console.log('Setting user role to admin');
            const updatedProfile = await updateUserProfile({
              id: user.id,
              role: 'admin'
            });
            
            if (updatedProfile) {
              profileData = updatedProfile;
              toast.success('Your account has been upgraded to admin');
            }
          }
          
          if (profileData) {
            console.log('Profile data loaded:', profileData);
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
            setUserRole(profileData.role);
            
            const associations = await fetchUserAssociations(user.id);
            console.log('User associations loaded:', associations);
            setUserAssociations(associations);
            
            if (associations?.length > 0 && !currentAssociation) {
              setCurrentAssociation(associations[0].associations);
            }
          } else {
            console.log('No profile found for user:', user.id);
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error.message);
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
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('Login successful:', data);
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast.error(`Error signing in: ${error.message}`);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: { first_name: string, last_name: string }) => {
    try {
      console.log('Attempting registration for:', email);
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
      if (error) throw error;
      console.log('Registration successful:', data);
      toast.success('Registration successful! Check your email for confirmation.');
    } catch (error: any) {
      console.error('Registration error:', error.message);
      toast.error(`Error signing up: ${error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const updatedProfile = await fetchUserProfile(user.id);
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
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
