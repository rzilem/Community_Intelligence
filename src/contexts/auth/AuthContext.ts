
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
  requiresTwoFactor: boolean;

  // Profile and role information
  profile: Profile | null;
  userRole: string | null;
  isAdmin: boolean;

  // Association management
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  setCurrentAssociation: (association: Association | null) => void;

  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; requires2FA: boolean; user: User | null }>;
  verify2FA: (token: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: { 
    first_name: string; 
    last_name: string 
  }) => Promise<void>;
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
  requiresTwoFactor: false,

  // Profile and role defaults
  profile: null,
  userRole: null,
  isAdmin: false,

  // Association defaults
  userAssociations: [],
  currentAssociation: null,
  setCurrentAssociation: () => {},

  // Authentication method stubs
  signIn: async () => ({ success: false, requires2FA: false, user: null }),
  verify2FA: async () => false,
  signUp: async () => {},
  signOut: async () => {},

  // Profile management stub
  refreshProfile: async () => {},
});

export type { AuthContextValue };
export default AuthContext;
