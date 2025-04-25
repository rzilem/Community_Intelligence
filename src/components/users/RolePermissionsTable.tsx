import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { menuPermissions, defaultRoles } from '@/services/permission-service';
import { Role } from '@/types/permission-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';

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
          <ScrollArea className="w-full">
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
                      <HoverCard>
                        <HoverCardTrigger>
                          <div className="font-medium cursor-help">{role.name}</div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-sm">{getRoleDescription(role)}</p>
                        </HoverCardContent>
                      </HoverCard>
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
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="detailed">
          <ScrollArea className="h-[500px]">
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-48 min-w-[200px]">Feature</TableHead>
                    {roles.map(role => (
                      <TableHead key={role.id} className="text-center min-w-[120px]">
                        <HoverCard>
                          <HoverCardTrigger>
                            <span className="cursor-help">{role.name}</span>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm font-normal">{getRoleDescription(role)}</p>
                          </HoverCardContent>
                        </HoverCard>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuPermissions.map(menu => (
                    <React.Fragment key={menu.id}>
                      <TableRow className="bg-muted/30">
                        <TableCell className="font-medium">
                          <HoverCard>
                            <HoverCardTrigger>
                              <span className="cursor-help">{menu.name}</span>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">{menu.description || `Manage ${menu.name.toLowerCase()} features`}</p>
                            </HoverCardContent>
                          </HoverCard>
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
                      
                      {menu.submenuPermissions && menu.submenuPermissions.length > 0 && 
                        menu.submenuPermissions.map(submenu => (
                          <TableRow key={submenu.id}>
                            <TableCell className="pl-8">
                              <HoverCard>
                                <HoverCardTrigger>
                                  <span className="cursor-help">{submenu.name}</span>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <p className="text-sm">{submenu.description || `Manage ${submenu.name.toLowerCase()}`}</p>
                                </HoverCardContent>
                              </HoverCard>
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
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </ResponsiveContainer>
  );
};

export default RolePermissionsTable;
