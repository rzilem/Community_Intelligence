
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Role, MenuPermission } from '@/types/permission-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AccessIcon, AccessText } from './AccessIcon';

interface DetailedPermissionsProps {
  roles: Role[];
  menuPermissions: MenuPermission[];
  getAccess: (role: Role, menuId: string) => 'full' | 'read' | 'none';
  getSubmenuAccess: (role: Role, menuId: string, submenuId: string) => 'full' | 'read' | 'none';
  getRoleDescription: (role: Role) => string;
}

export const DetailedPermissions: React.FC<DetailedPermissionsProps> = ({
  roles,
  menuPermissions,
  getAccess,
  getSubmenuAccess,
  getRoleDescription,
}) => {
  return (
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
                
                {menu.submenuPermissions && menu.submenuPermissions.map(submenu => (
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
  );
};
