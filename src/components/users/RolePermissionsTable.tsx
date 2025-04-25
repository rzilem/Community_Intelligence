
import React, { useState } from 'react';
import { menuPermissions, defaultRoles } from '@/services/permission-service';
import { Role } from '@/types/permission-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import { RoleOverview } from './permissions/RoleOverview';
import { DetailedPermissions } from './permissions/DetailedPermissions';

const RolePermissionsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const roles = defaultRoles;

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

  return (
    <ResponsiveContainer
      mobileClassName="w-full overflow-auto"
      desktopClassName="w-full"
    >
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Role Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <RoleOverview 
            roles={roles}
            getRoleDescription={getRoleDescription}
          />
        </TabsContent>
        
        <TabsContent value="detailed">
          <DetailedPermissions 
            roles={roles}
            menuPermissions={menuPermissions}
            getAccess={getAccess}
            getSubmenuAccess={getSubmenuAccess}
            getRoleDescription={getRoleDescription}
          />
        </TabsContent>
      </Tabs>
    </ResponsiveContainer>
  );
};

export default RolePermissionsTable;
