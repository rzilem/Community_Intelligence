
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

const usePermissions = () => {
  const { userRole, isAdmin } = useAuth();
  const [permissionsCache, setPermissionsCache] = useState<Record<string, boolean>>({});
  
  // In a real app, this might fetch permissions from the backend
  useEffect(() => {
    // Reset cache when user role changes
    setPermissionsCache({});
  }, [userRole, isAdmin]);
  
  const checkPermission = (
    menuId: string,
    submenuId?: string,
    requiredAccess: 'read' | 'full' = 'read'
  ): boolean => {
    // Admin has all permissions
    if (isAdmin) return true;
    
    const cacheKey = `${menuId}:${submenuId || ''}:${requiredAccess}`;
    
    // Check cache first
    if (permissionsCache[cacheKey] !== undefined) {
      return permissionsCache[cacheKey];
    }
    
    // Implement permission logic based on user role
    // This is a simplified version; in a real app, this would be more complex
    let hasPermission = false;
    
    if (userRole === 'manager') {
      // Managers have full access to most areas except system settings
      hasPermission = menuId !== 'system-settings';
    } else if (userRole === 'resident') {
      // Residents have read access to specific areas
      const residentAccessibleMenus = [
        'dashboard',
        'documents',
        'calendar',
        'maintenance-requests',
        'payments'
      ];
      hasPermission = residentAccessibleMenus.includes(menuId) && requiredAccess === 'read';
    } else if (userRole === 'board-member') {
      // Board members have read access to most areas and full access to some
      const boardFullAccessMenus = [
        'dashboard',
        'documents',
        'calendar',
        'meetings'
      ];
      hasPermission = boardFullAccessMenus.includes(menuId) || 
        (requiredAccess === 'read' && menuId !== 'system-settings');
    }
    
    // Cache the result
    setPermissionsCache(prev => ({
      ...prev,
      [cacheKey]: hasPermission
    }));
    
    return hasPermission;
  };
  
  return { checkPermission };
};

export default usePermissions;
