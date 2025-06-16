
import { createContext } from 'react';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  isLoading: true,
  userRole: null,
  isAdmin: false,
  isAuthenticated: false,
  userAssociations: [],
  currentAssociation: null,
  setCurrentAssociation: () => {},
  refreshProfile: async () => {},
});

export default AuthContext;
