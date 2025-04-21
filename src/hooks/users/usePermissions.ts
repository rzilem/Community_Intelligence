
import { useAuth } from '@/contexts/auth';
import { defaultRoles, hasPermission } from '@/services/permission-service';
import { Role } from '@/types/permission-types';

export const usePermissions = () => {
  const { userRole } = useAuth();
  
  // Find the current user's role from default roles
  const currentRole = defaultRoles.find(role => role.id === userRole) || defaultRoles.find(role => role.id === 'user');
  
  // Check if the user has permission for a specific menu/submenu
  const checkPermission = (menuId: string, submenuId?: string, requiredAccess: 'read' | 'full' = 'read'): boolean => {
    if (!currentRole) return false;
    return hasPermission(currentRole, menuId, submenuId, requiredAccess);
  };
  
  // Get all roles
  const getRoles = (): Role[] => {
    return defaultRoles;
  };
  
  return {
    currentRole,
    checkPermission,
    getRoles
  };
};

export default usePermissions;
