import { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/utils/role-utils';

export const useAdminAccess = (userId?: string) => {
  const { userRole, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (userId) {
      console.log('Admin access check for user:', userId);
    }
  }, [userId]);

  const hasAdminAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    return isAdminRole(userRole || undefined);
  }, [isAuthenticated, userRole]);

  return {
    hasAdminAccess,
    loading
  };
};
