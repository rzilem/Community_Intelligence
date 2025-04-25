import React, { useState } from 'react';
import { menuPermissions, defaultRoles } from '@/services/permission-service';
import { Role } from '@/types/permission-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import { RoleOverview } from './permissions/RoleOverview';
import { DetailedPermissions } from './permissions/DetailedPermissions';
import { SearchBar } from './permissions/SearchBar';
import { CompareRolesDialog } from './permissions/CompareRolesDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';

const RolePermissionsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  
  const roles = defaultRoles;
  
  const { mutate: updateRole } = useSupabaseUpdate('user_roles', {
    showSuccessToast: false,
  });

  const getRoleDescription = (role: Role): string => {
    switch (role.accessLevel) {
      case 'unrestricted':
        return 'Full system access with no restrictions';
      case 'high':
        return 'High-level access with minimal restrictions';
      case 'medium':
        return 'Standard access with common restrictions';
      case 'low':
        return 'Limited access with significant restrictions';
      default:
        return role.description;
    }
  };

  const getAccess = (role: Role, menuId: string): 'full' | 'read' | 'none' => {
    const permission = role.permissions.find(p => p.menuId === menuId && !p.submenuId);
    return permission?.access || 'none';
  };

  const getSubmenuAccess = (role: Role, menuId: string, submenuId: string): 'full' | 'read' | 'none' => {
    const permission = role.permissions.find(p => p.menuId === menuId && p.submenuId === submenuId);
    if (!permission) {
      return getAccess(role, menuId);
    }
    return permission.access;
  };

  const handleRoleSelectionChange = (roleId: string, selected: boolean) => {
    setSelectedRoles(prev => {
      if (selected) {
        if (prev.length >= 2) {
          return [...prev.slice(1), roleId];
        }
        return [...prev, roleId];
      } else {
        return prev.filter(id => id !== roleId);
      }
    });
  };

  const handleCompareRoles = () => {
    if (selectedRoles.length < 2) {
      toast.error("Please select at least 2 roles to compare");
      return;
    }
    setCompareDialogOpen(true);
  };

  const handlePermissionChange = (
    roleId: string,
    menuId: string,
    submenuId: string | undefined,
    access: 'full' | 'read' | 'none'
  ) => {
    const role = roles.find((r) => r.id === roleId);
    
    if (!role) {
      toast.error("Role not found");
      return;
    }
    
    const updatedPermissions = [...role.permissions];
    
    const permissionIndex = updatedPermissions.findIndex(
      (p) => p.menuId === menuId && p.submenuId === submenuId
    );
    
    if (permissionIndex !== -1) {
      updatedPermissions[permissionIndex] = {
        ...updatedPermissions[permissionIndex],
        access,
      };
    } else {
      updatedPermissions.push({
        menuId,
        submenuId,
        access,
      });
    }
    
    toast.success(`Updated ${role.name}'s permission for ${submenuId ? 'submenu' : 'menu'} ${menuId}`);
    
    updateRole({ id: roleId, data: { permissions: updatedPermissions } });
  };

  return (
    <ResponsiveContainer
      mobileClassName="w-full overflow-auto"
      desktopClassName="w-full"
    >
      <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleCompareRoles}
            disabled={selectedRoles.length < 2}
          >
            Compare Selected Roles ({selectedRoles.length})
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Role Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <RoleOverview 
            roles={roles}
            getRoleDescription={getRoleDescription}
            searchQuery={searchQuery}
            selectedRoles={selectedRoles}
            onRoleSelectionChange={handleRoleSelectionChange}
          />
        </TabsContent>
        
        <TabsContent value="detailed">
          <DetailedPermissions 
            roles={roles}
            menuPermissions={menuPermissions}
            getAccess={getAccess}
            getSubmenuAccess={getSubmenuAccess}
            getRoleDescription={getRoleDescription}
            searchQuery={searchQuery}
            onPermissionChange={handlePermissionChange}
            selectedRoles={selectedRoles}
            onRoleSelectionChange={handleRoleSelectionChange}
          />
        </TabsContent>
      </Tabs>
      
      <CompareRolesDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        roles={roles}
        selectedRoles={selectedRoles}
        menuPermissions={menuPermissions}
        getAccess={getAccess}
        getSubmenuAccess={getSubmenuAccess}
      />
    </ResponsiveContainer>
  );
};

export default RolePermissionsTable;
