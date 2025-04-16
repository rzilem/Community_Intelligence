
import { Session, User } from '@supabase/supabase-js';
import { Association } from '@/types/association-types';
import { Profile } from '@/types/profile-types';

export interface UserAssociation {
  id: string;
  user_id: string;
  association_id: string;
  role: string;
  associations: Association;
  created_at: string;
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
  setCurrentAssociation: (association: Association | null) => void;
  refreshProfile: () => Promise<void>;
}
