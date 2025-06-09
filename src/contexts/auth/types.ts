
import { User, Session } from '@supabase/supabase-js';

export interface UserAssociation {
  id: string;
  user_id: string;
  association_id: string;
  role: string;
  associations: any;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  currentAssociation: any | null;
  userAssociations: UserAssociation[];
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentAssociation: (association: any) => void;
  refreshProfile: () => Promise<void>;
}
