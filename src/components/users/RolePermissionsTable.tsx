
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import { defaultRoles, defaultMenus, MenuItemWithSubmenu } from '@/services/permission-service';
import { SearchBar } from './permissions/SearchBar';
import { RoleOverview } from './permissions/RoleOverview';
import { AccessButton } from './permissions/AccessIcon';
import { usePermissionOperations } from '@/hooks/users/usePermissionOperations';

const RolePermissionsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  const { updatePermission, canEditPermissions, isUpdating } = usePermissionOperations();
  
  // Filter menus based on search query
  const filteredMenus = useMemo(() => {
    if (!searchQuery) return defaultMenus;
    
    return defaultMenus.filter(menu => {
      const matchesMenu = menu.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const hasMatchingSubmenu = menu.submenus?.some(submenu => 
        submenu.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return matchesMenu || hasMatchingSubmenu;
    });
  }, [searchQuery, defaultMenus]);
  
  // Handle role selection for comparison
  const handleRoleSelection = (roleId: string, selected: boolean) => {
    if (selected) {
      // Limit to at most 2 roles for comparison
      if (selectedRoles.length < 2) {
        setSelectedRoles([...selectedRoles, roleId]);
      }
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
    
    // If we're on the overview tab and have selected 2 roles, switch to the comparison tab
    if (selected && selectedRoles.length === 1 && activeTab === 'overview') {
      setActiveTab('comparison');
    }
  };
  
  // Helper function to get a readable description of the role
  const getRoleDescription = (role: typeof defaultRoles[0]): string => {
    const permissionCount = role.permissions.length;
    const fullAccessCount = role.permissions.filter(p => p.access === 'full').length;
    const readAccessCount = role.permissions.filter(p => p.access === 'read').length;
    
    return `${role.name} has ${permissionCount} permissions defined: 
            ${fullAccessCount} with full access, 
            ${readAccessCount} with read-only access.`;
  };
  
  // Get access level for a menu/submenu
  const getAccessLevel = (roleId: string, menuId: string, submenuId?: string) => {
    const role = defaultRoles.find(role => role.id === roleId);
    if (!role) return 'none';
    
    const permission = role.permissions.find(
      p => p.menuId === menuId && p.submenuId === submenuId
    );
    
    return permission ? permission.access : 'none';
  };
  
  const handleChangePermission = async (
    roleId: string, 
    menuId: string, 
    submenuId: string | undefined
  ) => {
    const role = defaultRoles.find(r => r.id === roleId);
    if (!role) return;
    
    const currentAccess = getAccessLevel(roleId, menuId, submenuId);
    let newAccess: 'full' | 'read' | 'none';
    
    // Cycle through permission levels: none → read → full → none
    switch (currentAccess) {
      case 'none':
        newAccess = 'read';
        break;
      case 'read':
        newAccess = 'full';
        break;
      case 'full':
        newAccess = 'none';
        break;
      default:
        newAccess = 'none';
    }
    
    await updatePermission(role, menuId, submenuId, newAccess);
  };
  
  const renderComparisonView = () => {
    const rolesToCompare = defaultRoles.filter(role => selectedRoles.includes(role.id));
    if (rolesToCompare.length !== 2) {
      return (
        <div className="text-center py-8">
          <p>Select exactly two roles to compare their permissions.</p>
          {rolesToCompare.length > 0 && (
            <div className="mt-4">
              <p>Currently selected:</p>
              <ul className="list-disc list-inside">
                {rolesToCompare.map(role => (
                  <li key={role.id}>{role.name}</li>
                ))}
              </ul>
            </div>
          )}
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setSelectedRoles([])}
          >
            Clear selection
          </Button>
        </div>
      );
    }
    
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Feature</TableHead>
              <TableHead>{rolesToCompare[0].name}</TableHead>
              <TableHead>{rolesToCompare[1].name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.map((menu) => (
              <React.Fragment key={menu.id}>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium">{menu.title}</TableCell>
                  {rolesToCompare.map(role => (
                    <TableCell key={role.id}>
                      <AccessButton 
                        access={getAccessLevel(role.id, menu.id)} 
                        onClick={() => handleChangePermission(role.id, menu.id, undefined)}
                        disabled={!canEditPermissions || isUpdating}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                
                {menu.submenus?.map((submenu) => (
                  <TableRow key={`${menu.id}-${submenu.id}`}>
                    <TableCell className="pl-8 text-sm text-muted-foreground">
                      {submenu.title}
                    </TableCell>
                    {rolesToCompare.map(role => (
                      <TableCell key={`${role.id}-${submenu.id}`}>
                        <AccessButton 
                          access={getAccessLevel(role.id, menu.id, submenu.id)} 
                          onClick={() => handleChangePermission(role.id, menu.id, submenu.id)}
                          disabled={!canEditPermissions || isUpdating}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  const renderDetailedMatrix = () => {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Feature</TableHead>
              {defaultRoles.map(role => (
                <TableHead key={role.id}>{role.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.map((menu: MenuItemWithSubmenu) => (
              <React.Fragment key={menu.id}>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium">{menu.title}</TableCell>
                  {defaultRoles.map(role => (
                    <TableCell key={role.id}>
                      <AccessButton 
                        access={getAccessLevel(role.id, menu.id)} 
                        onClick={() => handleChangePermission(role.id, menu.id, undefined)}
                        disabled={!canEditPermissions || isUpdating}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                
                {menu.submenus?.map((submenu) => (
                  <TableRow key={`${menu.id}-${submenu.id}`}>
                    <TableCell className="pl-8 text-sm text-muted-foreground">
                      {submenu.title}
                    </TableCell>
                    {defaultRoles.map(role => (
                      <TableCell key={`${role.id}-${submenu.id}`}>
                        <AccessButton 
                          access={getAccessLevel(role.id, menu.id, submenu.id)} 
                          onClick={() => handleChangePermission(role.id, menu.id, submenu.id)}
                          disabled={!canEditPermissions || isUpdating}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  return (
    <ResponsiveContainer>
      <div className="flex justify-between items-center mb-4">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder={activeTab === 'overview' ? 'Search roles...' : 'Search features...'}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Matrix</TabsTrigger>
            <TabsTrigger value="comparison">Compare Roles</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="mt-4">
        {activeTab === 'overview' && (
          <RoleOverview 
            roles={defaultRoles}
            getRoleDescription={getRoleDescription}
            searchQuery={searchQuery}
            selectedRoles={selectedRoles}
            onRoleSelectionChange={handleRoleSelection}
          />
        )}
        
        {activeTab === 'detailed' && renderDetailedMatrix()}
        
        {activeTab === 'comparison' && renderComparisonView()}
      </div>
    </ResponsiveContainer>
  );
};

export default RolePermissionsTable;
