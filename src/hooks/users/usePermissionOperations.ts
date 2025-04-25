
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
    
    setIsUpdating(true);
    try {
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
      
      // Update in database
      await updateRolePermission({ 
        id: role.id,
        data: { permissions: updatedPermissions } 
      });
      
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
