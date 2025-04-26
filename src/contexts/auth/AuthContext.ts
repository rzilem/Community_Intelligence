
import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { Association } from '@/types/association-types';
import { UserAssociation } from './types';

interface AuthContextValue {
  // Session and authentication state
  session: Session | null;
  user: User | null;
  currentUser: User | null; // For backward compatibility
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // For backward compatibility

  // Profile and role information
  profile: Profile | null;
  userRole: string | null;
  isAdmin: boolean;

  // Association management
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  setCurrentAssociation: (association: Association | null) => void;

  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { 
    first_name: string; 
    last_name: string 
  }) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;

  // Profile management
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  // Session and authentication defaults
  session: null,
  user: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  isLoading: true,

  // Profile and role defaults
  profile: null,
  userRole: null,
  isAdmin: false,

  // Association defaults
  userAssociations: [],
  currentAssociation: null,
  setCurrentAssociation: () => {},

  // Authentication method stubs
  signIn: async () => {},
  signUp: async () => {},
  signInWithMagicLink: async () => false,
  signOut: async () => {},

  // Profile management stub
  refreshProfile: async () => {},
});

export type { AuthContextValue };
export default AuthContext;
