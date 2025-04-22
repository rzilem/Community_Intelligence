
import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { Association } from '@/types/association-types';
import { UserAssociation } from './types';

export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  profile: Profile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  setCurrentAssociation: (association: Association) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  profile: null,
  session: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  isLoading: true,
  userRole: null,
  isAdmin: false,
  isAuthenticated: false,
  userAssociations: [],
  currentAssociation: null,
  setCurrentAssociation: () => {},
  refreshProfile: async () => {},
});

export default AuthContext;
