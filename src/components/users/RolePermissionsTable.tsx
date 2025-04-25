import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccessButton } from '@/components/users/permissions/AccessIcon';
import { defaultRoles, defaultMenus, MenuItemWithSubmenu, hasPermission } from '@/services/permission-service';
import { SearchBar } from './permissions/SearchBar';
import { Button } from '@/components/ui/button';
import { GitCompareIcon } from 'lucide-react';
import CompareRolesDialog from './permissions/CompareRolesDialog';
import { usePermissionOperations } from '@/hooks/users/usePermissionOperations';

const RolePermissionsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedRolesToCompare, setSelectedRolesToCompare] = useState<string[]>([]);
  const { updatePermission, canEditPermissions, isUpdating } = usePermissionOperations();

  // Filter menus by search term
  const filteredMenus = searchTerm ? 
    defaultMenus.filter(menu => 
      menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (menu.submenus?.some(submenu => 
        submenu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submenu.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    ) : defaultMenus;
  
  const handlePermissionUpdate = (roleId: string, menuId: string, submenuId: string | undefined, access: 'full' | 'read' | 'none') => {
    if (!canEditPermissions) return;
    
    const role = defaultRoles.find(r => r.id === roleId);
    if (role) {
      updatePermission(role, menuId, submenuId, access);
    }
  };
  
  const toggleRoleForComparison = (roleId: string) => {
    setSelectedRolesToCompare(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else if (prev.length < 2) {
        return [...prev, roleId];
      }
      return prev;
    });
  };
  
  const isRoleSelectedForComparison = (roleId: string) => {
    return selectedRolesToCompare.includes(roleId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <Button 
          variant="outline" 
          onClick={() => setIsCompareOpen(true)}
          disabled={selectedRolesToCompare.length !== 2}
          className="flex items-center gap-2"
        >
          <GitCompareIcon size={16} />
          Compare Roles
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="border">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Feature</TableHead>
              {defaultRoles.map((role) => (
                <TableHead key={role.id} className="text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="font-bold">{role.name}</div>
                    <div className="text-xs text-muted-foreground">{role.accessLevel}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`mt-1 ${isRoleSelectedForComparison(role.id) ? 'bg-primary/20' : ''}`}
                      onClick={() => toggleRoleForComparison(role.id)}
                    >
                      {isRoleSelectedForComparison(role.id) ? 'Selected' : 'Select for compare'}
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.map(menu => (
              <React.Fragment key={menu.id}>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-bold">
                    {menu.title}
                    {menu.description && (
                      <p className="text-xs text-muted-foreground">{menu.description}</p>
                    )}
                  </TableCell>
                  {defaultRoles.map((role) => {
                    const access = hasPermission(role, menu.id) ? 'full' : 'none';
                    return (
                      <TableCell key={`${menu.id}-${role.id}`} className="text-center">
                        <AccessButton 
                          access={access}
                          onClick={() => handlePermissionUpdate(
                            role.id, 
                            menu.id, 
                            undefined, 
                            access === 'full' ? 'none' : 'full'
                          )}
                          disabled={!canEditPermissions || isUpdating || role.systemRole}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
                {menu.submenus?.map(submenu => (
                  <TableRow key={`${menu.id}-${submenu.id}`}>
                    <TableCell className="pl-8">
                      {submenu.title}
                      {submenu.description && (
                        <p className="text-xs text-muted-foreground">{submenu.description}</p>
                      )}
                    </TableCell>
                    {defaultRoles.map((role) => {
                      // Check if the parent menu gives full access
                      const parentAccess = hasPermission(role, menu.id);
                      // If parent has full access, all submenus inherit it
                      const effectiveAccess = parentAccess ? 'full' : 
                        hasPermission(role, menu.id, submenu.id, 'full') ? 'full' :
                        hasPermission(role, menu.id, submenu.id, 'read') ? 'read' : 'none';
                      
                      return (
                        <TableCell key={`${menu.id}-${submenu.id}-${role.id}`} className="text-center">
                          <AccessButton 
                            access={effectiveAccess}
                            onClick={() => handlePermissionUpdate(
                              role.id, 
                              menu.id, 
                              submenu.id, 
                              effectiveAccess === 'none' ? 'read' : 
                              effectiveAccess === 'read' ? 'full' : 'none'
                            )}
                            disabled={!canEditPermissions || isUpdating || role.systemRole || parentAccess}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            {filteredMenus.length === 0 && (
              <TableRow>
                <TableCell colSpan={defaultRoles.length + 1} className="text-center py-8 text-muted-foreground">
                  No features match your search term.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CompareRolesDialog 
        isOpen={isCompareOpen} 
        onOpenChange={setIsCompareOpen} 
        roleIds={selectedRolesToCompare} 
      />
    </div>
  );
};

export default RolePermissionsTable;
