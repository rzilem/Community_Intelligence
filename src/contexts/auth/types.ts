
import { User, Session } from '@supabase/supabase-js';
import { Association } from '@/types/association-types';
import { Profile } from '@/types/profile-types';

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
  profile: Profile | null;
  loading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  currentAssociation: Association | null;
  userAssociations: UserAssociation[];
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentAssociation: (association: Association) => void;
  refreshProfile: () => Promise<void>;
}
