
// Re-export everything from the auth directory, but carefully to avoid ambiguity
export { default as AuthContext } from './AuthContext';
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export * from './types'; // This already includes AuthContextType 
export * from './authUtils';
