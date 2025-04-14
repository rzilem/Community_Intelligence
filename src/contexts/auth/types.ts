
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/app-types';

export interface Association {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAssociation {
  id: string;
  user_id: string;
  association_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  associations: Association;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isLoading: boolean;
  userRole: string | null;
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setCurrentAssociation: (association: Association) => void;
  refreshProfile: () => Promise<void>;
}
