
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  currentAssociation: any | null;
  userAssociations: any[];
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentAssociation: (association: any) => void;
  refreshProfile: () => Promise<void>;
}
