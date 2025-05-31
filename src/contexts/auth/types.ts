
import { User, Session } from '@supabase/supabase-js';
import { Association } from '@/types/association-types';

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAssociation {
  id: string;
  user_id: string;
  association_id: string;
  role: string;
  created_at: string;
  associations?: Association;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  currentAssociation: Association | null;
  userAssociations: UserAssociation[];
  userRole: string | null;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, userData?: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentAssociation: (association: Association) => void;
  refreshProfile: () => Promise<void>;
}
