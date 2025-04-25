
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Role, MenuPermission } from '@/types/permission-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AccessButton } from './AccessIcon';
import { EditPermissionDialog } from './EditPermissionDialog';
import { Checkbox } from '@/components/ui/checkbox';

interface DetailedPermissionsProps {
  roles: Role[];
  menuPermissions: MenuPermission[];
  getAccess: (role: Role, menuId: string) => 'full' | 'read' | 'none';
  getSubmenuAccess: (role: Role, menuId: string, submenuId: string) => 'full' | 'read' | 'none';
  getRoleDescription: (role: Role) => string;
  searchQuery: string;
  onPermissionChange?: (roleId: string, menuId: string, submenuId: string | undefined, access: 'full' | 'read' | 'none') => void;
  selectedRoles: string[];
  onRoleSelectionChange: (roleId: string, selected: boolean) => void;
}

export const DetailedPermissions: React.FC<DetailedPermissionsProps> = ({
  roles,
  menuPermissions,
  getAccess,
  getSubmenuAccess,
  getRoleDescription,
  searchQuery,
  onPermissionChange,
  selectedRoles,
  onRoleSelectionChange,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{
    roleId: string;
    menuId: string;
    submenuId?: string;
    featureName: string;
    currentAccess: 'full' | 'read' | 'none';
  } | null>(null);

  const handleEditPermission = (
    roleId: string,
    menuId: string,
    submenuId: string | undefined,
    featureName: string,
    currentAccess: 'full' | 'read' | 'none'
  ) => {
    setCurrentEdit({
      roleId,
      menuId,
      submenuId,
      featureName,
      currentAccess,
    });
    setEditDialogOpen(true);
  };

  const handleSavePermission = (
    roleId: string,
    menuId: string,
    submenuId: string | undefined,
    access: 'full' | 'read' | 'none'
  ) => {
    if (onPermissionChange) {
      onPermissionChange(roleId, menuId, submenuId, access);
    }
  };

  // Filter menu permissions based on the search query
  const filteredMenuPermissions = menuPermissions.filter((menu) => {
    // If there's no search query, include all menus
    if (!searchQuery) return true;
    
    // Check if the menu name matches the search query
    const menuMatches = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if any submenu name matches the search query
    const submenuMatches = menu.submenuPermissions?.some(
      (submenu) => submenu.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || false;
    
    return menuMatches || submenuMatches;
  });

  return (
    <>
      <ScrollArea className="h-[500px]">
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-48 min-w-[200px]">Feature</TableHead>
                {roles.map(role => (
                  <TableHead key={role.id} className="text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-2">
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="cursor-help">{role.name}</span>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-sm font-normal">{getRoleDescription(role)}</p>
                        </HoverCardContent>
                      </HoverCard>
                      <Checkbox 
                        id={`compare-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => onRoleSelectionChange(role.id, checked === true)}
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenuPermissions.map((menu) => (
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
                          <AccessButton 
                            access={getAccess(role, menu.id)} 
                            onClick={() => handleEditPermission(role.id, menu.id, undefined, menu.name, getAccess(role, menu.id))}
                            disabled={!onPermissionChange || role.systemRole}
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {menu.submenuPermissions && menu.submenuPermissions.map((submenu) => {
                    // Skip submenus that don't match the search query if a search is active
                    if (searchQuery && !submenu.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                      return null;
                    }
                    
                    return (
                      <TableRow key={submenu.id}>
                        <TableCell className="pl-8 border-l-2 border-l-muted ml-4">
                          <HoverCard>
                            <HoverCardTrigger>
                              <span className="cursor-help text-sm">{submenu.name}</span>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">{submenu.description || `Manage ${submenu.name.toLowerCase()}`}</p>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        {roles.map(role => (
                          <TableCell key={`${role.id}-${submenu.id}`} className="text-center">
                            <div className="flex flex-col items-center justify-center">
                              <AccessButton 
                                access={getSubmenuAccess(role, menu.id, submenu.id)} 
                                onClick={() => handleEditPermission(role.id, menu.id, submenu.id, `${menu.name} - ${submenu.name}`, getSubmenuAccess(role, menu.id, submenu.id))}
                                disabled={!onPermissionChange || role.systemRole}
                              />
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      
      {currentEdit && (
        <EditPermissionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          roleId={currentEdit.roleId}
          menuId={currentEdit.menuId}
          submenuId={currentEdit.submenuId}
          featureName={currentEdit.featureName}
          currentAccess={currentEdit.currentAccess}
          onSave={handleSavePermission}
        />
      )}
    </>
  );
};
