
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/app-types';

export interface Association {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  is_archived?: boolean;
}

export interface UserAssociation {
  id: string;
  role: string;
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
  signUp: (email: string, password: string, userData: { first_name: string, last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setCurrentAssociation: (association: Association | null) => void;
  refreshProfile: () => Promise<void>;
}
