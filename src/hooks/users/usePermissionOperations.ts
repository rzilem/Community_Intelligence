
import { useState } from 'react';
import { Role, RolePermission } from '@/types/permission-types';
import { useSupabaseUpdate } from '@/hooks/supabase';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export const usePermissionOperations = () => {
  const { currentRole } = usePermissions();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Setup mutation for updating permissions
  const { mutate: updateRolePermission } = useSupabaseUpdate('user_roles');
  
  // Administrator role should always have edit access
  const canEditPermissions = currentRole?.accessLevel === 'unrestricted';
  
  const updatePermission = async (
    role: Role, 
    menuId: string, 
    submenuId: string | undefined, 
    newAccess: 'full' | 'read' | 'none'
  ): Promise<boolean> => {
    if (!canEditPermissions) {
      toast.error('You do not have permission to edit role permissions');
      return false;
    }
    
    // Don't allow editing system roles
    if (role.systemRole) {
      toast.error('System roles cannot be modified');
      return false;
    }
    
    setIsUpdating(true);
    try {
      console.log(`Updating permission: ${role.name} -> ${menuId} -> ${submenuId} -> ${newAccess}`);
      
      // Clone permissions to avoid direct mutation
      const updatedPermissions: RolePermission[] = [...role.permissions];
      
      // Find if permission exists
      const permIndex = updatedPermissions.findIndex(
        p => p.menuId === menuId && p.submenuId === submenuId
      );
      
      // Update existing or add new permission
      if (permIndex >= 0) {
        updatedPermissions[permIndex] = {
          ...updatedPermissions[permIndex],
          access: newAccess
        };
      } else {
        updatedPermissions.push({
          menuId,
          submenuId,
          access: newAccess
        });
      }
      
      // Update role with new permissions
      const updatedRole = {
        ...role,
        permissions: updatedPermissions
      };
      
      // In a real app this would update the database
      // For now, we'll simulate success
      console.log('Updated role permissions:', updatedRole);
      
      toast.success(`Updated permission for ${role.name}`);
      return true;
    } catch (error) {
      console.error('Failed to update permission:', error);
      toast.error('Failed to update permission');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    updatePermission,
    canEditPermissions,
    isUpdating
  };
};
