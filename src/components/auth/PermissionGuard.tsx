
import React from 'react';
import usePermissions from '@/hooks/users/usePermissions';

interface PermissionGuardProps {
  menuId: string;
  submenuId?: string; 
  requiredAccess?: 'read' | 'full';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  menuId, 
  submenuId, 
  requiredAccess = 'read',
  children,
  fallback = null 
}) => {
  const { checkPermission } = usePermissions();
  
  const hasAccess = checkPermission(menuId, submenuId, requiredAccess);
  
  if (!hasAccess) return <>{fallback}</>;
  
  return <>{children}</>;
};

export default PermissionGuard;
