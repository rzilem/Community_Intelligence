
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Role } from '@/types/permission-types';
import { AccessIcon, AccessText } from './PermissionIndicators';
import { menuPermissions } from '@/services/permission-service';

interface DetailedPermissionsTabProps {
  roles: Role[];
}

const DetailedPermissionsTab: React.FC<DetailedPermissionsTabProps> = ({ roles }) => {
  const getAccess = (role: Role, menuId: string): 'full' | 'read' | 'none' => {
    const permission = role.permissions.find(p => p.menuId === menuId && !p.submenuId);
    return permission?.access || 'none';
  };

  const getSubmenuAccess = (role: Role, menuId: string, submenuId: string): 'full' | 'read' | 'none' => {
    const permission = role.permissions.find(p => p.menuId === menuId && p.submenuId === submenuId);
    return permission?.access || getAccess(role, menuId);
  };

  return (
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
              
              {menu.submenuPermissions && menu.submenuPermissions.map(submenu => (
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
  );
};

export default DetailedPermissionsTab;
