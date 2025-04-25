
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Role, MenuPermission } from '@/types/permission-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccessIcon, AccessText } from './AccessIcon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompareRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  selectedRoles: string[];
  menuPermissions: MenuPermission[];
  getAccess: (role: Role, menuId: string) => 'full' | 'read' | 'none';
  getSubmenuAccess: (role: Role, menuId: string, submenuId: string) => 'full' | 'read' | 'none';
}

export const CompareRolesDialog: React.FC<CompareRolesDialogProps> = ({
  open,
  onOpenChange,
  roles,
  selectedRoles,
  menuPermissions,
  getAccess,
  getSubmenuAccess,
}) => {
  // Filter the roles to only include the selected ones
  const rolesToCompare = roles.filter((role) => selectedRoles.includes(role.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Role Comparison</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-48 min-w-[200px]">Feature</TableHead>
                  {rolesToCompare.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-[120px]">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuPermissions.map((menu) => (
                  <React.Fragment key={menu.id}>
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      {rolesToCompare.map((role) => (
                        <TableCell key={`${role.id}-${menu.id}`} className="text-center">
                          <div className="flex flex-col items-center justify-center">
                            <AccessIcon access={getAccess(role, menu.id)} />
                            <AccessText access={getAccess(role, menu.id)} />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {menu.submenuPermissions && menu.submenuPermissions.map((submenu) => (
                      <TableRow key={submenu.id}>
                        <TableCell className="pl-8">
                          <span className="text-sm">{submenu.name}</span>
                        </TableCell>
                        {rolesToCompare.map((role) => (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
