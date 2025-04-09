
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isLoading: true,
  userRole: null,
  userAssociations: [],
  currentAssociation: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAdmin: false,
  isAuthenticated: false,
  setCurrentAssociation: () => {},
  refreshProfile: async () => {},
});

export default AuthContext;
