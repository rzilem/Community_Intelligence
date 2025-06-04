
import { useEffect } from 'react';

export const useAdminAccess = (userId?: string) => {
  useEffect(() => {
    if (userId) {
      console.log('Admin access check for user:', userId);
      // This hook would normally check admin permissions
      // For now, it's a no-op to prevent crashes
    }
  }, [userId]);

  return {
    hasAdminAccess: true, // Temporary fallback
    loading: false
  };
};
