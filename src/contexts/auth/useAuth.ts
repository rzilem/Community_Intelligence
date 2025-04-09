
import { useContext } from 'react';
import AuthContext from './AuthContext';

// Custom hook for accessing auth context
export const useAuth = () => useContext(AuthContext);
