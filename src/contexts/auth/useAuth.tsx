import { useContext } from 'react';
import { AuthContextType, useAuth as useAuthProvider } from './AuthProvider';

// Extended auth hook that provides backward compatibility
export const useAuth = (): AuthContextType & {
  // Additional properties for backward compatibility
  loading: boolean;
  isAuthenticated: boolean;
  userRole: string;
  isAdmin: boolean;
  currentAssociation: any;
  userAssociations: any[];
  setCurrentAssociation: (association: any) => void;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
} => {
  const auth = useAuthProvider();
  
  return {
    ...auth,
    loading: auth.isLoading,
    isAuthenticated: !!auth.user,
    userRole: auth.profile?.role || 'resident',
    isAdmin: auth.profile?.role === 'admin',
    currentAssociation: auth.associations[0] || null,
    userAssociations: auth.associations,
    setCurrentAssociation: () => {}, // Mock function
    signIn: async () => {}, // Mock function
    signUp: async () => {}, // Mock function
  };
};