
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccessIcon, AccessText } from '@/components/users/permissions/AccessIcon';
import { defaultRoles, defaultMenus, hasPermission } from '@/services/permission-service';

interface CompareRolesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roleIds: string[];
}

const CompareRolesDialog: React.FC<CompareRolesDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  roleIds 
}) => {
  const roles = defaultRoles.filter(role => roleIds.includes(role.id));
  
  if (roles.length !== 2) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparing Roles: {roles.map(r => r.name).join(' vs ')}</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-x-auto mt-4">
          <Table className="border">
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[250px]">Feature</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center">
                    <div className="font-bold">{role.name}</div>
                    <div className="text-xs text-muted-foreground">{role.accessLevel}</div>
                  </TableHead>
                ))}
                <TableHead className="text-center w-[120px]">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaultMenus.map(menu => (
                <React.Fragment key={menu.id}>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-bold">
                      {menu.title}
                      {menu.description && (
                        <p className="text-xs text-muted-foreground">{menu.description}</p>
                      )}
                    </TableCell>
                    {roles.map((role) => {
                      const access = hasPermission(role, menu.id) ? 'full' : 'none';
                      return (
                        <TableCell key={`${menu.id}-${role.id}`} className="text-center">
                          <div className="flex items-center justify-center">
                            <AccessIcon access={access} />
                            <span className="ml-2"><AccessText access={access} /></span>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {hasPermission(roles[0], menu.id) !== hasPermission(roles[1], menu.id) ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Different</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Same</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {menu.submenus?.map(submenu => {
                    const role0Access = hasPermission(roles[0], menu.id) ? 'full' : 
                      hasPermission(roles[0], menu.id, submenu.id, 'full') ? 'full' :
                      hasPermission(roles[0], menu.id, submenu.id, 'read') ? 'read' : 'none';
                    
                    const role1Access = hasPermission(roles[1], menu.id) ? 'full' : 
                      hasPermission(roles[1], menu.id, submenu.id, 'full') ? 'full' :
                      hasPermission(roles[1], menu.id, submenu.id, 'read') ? 'read' : 'none';
                    
                    const isDifferent = role0Access !== role1Access;
                    
                    return (
                      <TableRow key={`${menu.id}-${submenu.id}`}>
                        <TableCell className="pl-8">
                          {submenu.title}
                          {submenu.description && (
                            <p className="text-xs text-muted-foreground">{submenu.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <AccessIcon access={role0Access} />
                            <span className="ml-2"><AccessText access={role0Access} /></span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <AccessIcon access={role1Access} />
                            <span className="ml-2"><AccessText access={role1Access} /></span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isDifferent ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Different</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Same</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompareRolesDialog;
