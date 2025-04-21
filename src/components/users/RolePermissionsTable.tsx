
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Edit, Lock } from 'lucide-react';
import { menuPermissions, defaultRoles } from '@/services/permission-service';
import { Role } from '@/types/permission-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons for different access levels
const AccessIcon = ({ access }: { access: 'full' | 'read' | 'none' }) => {
  switch (access) {
    case 'full':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'read':
      return <Eye className="h-4 w-4 text-blue-500" />;
    case 'none':
      return <XCircle className="h-4 w-4 text-gray-300" />;
  }
};

// Display text for access levels
const AccessText = ({ access }: { access: 'full' | 'read' | 'none' }) => {
  switch (access) {
    case 'full':
      return <span className="text-xs text-green-600">Full Access</span>;
    case 'read':
      return <span className="text-xs text-blue-600">Read Only</span>;
    case 'none':
      return <span className="text-xs text-gray-400">No Access</span>;
  }
};

const RolePermissionsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const roles = defaultRoles;

  // Get access level for a specific menu/role combination
  const getAccess = (role: Role, menuId: string): 'full' | 'read' | 'none' => {
    const permission = role.permissions.find(p => p.menuId === menuId && !p.submenuId);
    return permission?.access || 'none';
  };

  // Get access level for a specific submenu/role combination
  const getSubmenuAccess = (role: Role, menuId: string, submenuId: string): 'full' | 'read' | 'none' => {
    const permission = role.permissions.find(p => p.menuId === menuId && p.submenuId === submenuId);
    // If no specific permission, inherit from parent menu
    if (!permission) {
      return getAccess(role, menuId);
    }
    return permission.access;
  };

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Role Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Access Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="font-medium">{role.name}</div>
                </TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {role.accessLevel === 'unrestricted' && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    {role.accessLevel === 'high' && (
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    )}
                    {role.accessLevel === 'medium' && (
                      <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    )}
                    {role.accessLevel === 'low' && (
                      <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                    )}
                    <span className="capitalize">{role.accessLevel}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      
      <TabsContent value="detailed">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-48">Feature</TableHead>
                {roles.map(role => (
                  <TableHead key={role.id} className="text-center w-32">
                    {role.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuPermissions.map(menu => (
                <React.Fragment key={menu.id}>
                  {/* Menu row */}
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-medium">
                      {menu.name}
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={`${role.id}-${menu.id}`} className="text-center">
                        <div className="flex flex-col items-center justify-center">
                          <AccessIcon access={getAccess(role, menu.id)} />
                          <AccessText access={getAccess(role, menu.id)} />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Submenu rows */}
                  {menu.submenuPermissions && menu.submenuPermissions.length > 0 && 
                    menu.submenuPermissions.map(submenu => (
                      <TableRow key={submenu.id}>
                        <TableCell className="pl-8">
                          {submenu.name}
                        </TableCell>
                        {roles.map(role => (
                          <TableCell key={`${role.id}-${submenu.id}`} className="text-center">
                            <div className="flex flex-col items-center justify-center">
                              <AccessIcon access={getSubmenuAccess(role, menu.id, submenu.id)} />
                              <AccessText access={getSubmenuAccess(role, menu.id, submenu.id)} />
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default RolePermissionsTable;
