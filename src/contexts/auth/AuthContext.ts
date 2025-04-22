
import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { Association } from '@/types/association-types';
import { UserAssociation } from './types';

interface AuthContextValue {
  // User and Session state
  user: User | null;
  currentUser: User | null; // For backward compatibility
  profile: Profile | null;
  session: Session | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Loading state
  loading: boolean;
  isLoading: boolean;
  
  // Role and permissions
  userRole: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  
  // Association management
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  setCurrentAssociation: (association: Association | null) => void;
  
  // Profile management
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  // User and Session defaults
  user: null,
  currentUser: null,
  profile: null,
  session: null,
  
  // Authentication method stubs
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  
  // Loading state defaults
  loading: true,
  isLoading: true,
  
  // Role and permissions defaults
  userRole: null,
  isAdmin: false,
  isAuthenticated: false,
  
  // Association defaults
  userAssociations: [],
  currentAssociation: null,
  setCurrentAssociation: () => {},
  
  // Profile management stub
  refreshProfile: async () => {},
});

export type { AuthContextValue };
export default AuthContext;
