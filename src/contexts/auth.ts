// Compatibility file for legacy imports
// This allows both @/contexts/auth and @/contexts/AuthContext to work
export { AuthProvider, useAuth } from './AuthContext';
export type { AuthContextType } from './auth/types';