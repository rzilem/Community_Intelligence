
import { User, Session } from '@supabase/supabase-js';
import { Association } from '@/types/association-types';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string | null;
  preferred_language?: string;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAssociation {
  id: string;
  user_id: string;
  association_id: string;
  role: string;
  association: Association;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  userRole: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  userAssociations: UserAssociation[];
  currentAssociation: Association | null;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, userData?: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentAssociation: (association: Association | null) => void;
  refreshProfile: () => Promise<void>;
}
