
export type MenuPermission = {
  id: string;
  name: string;
  description?: string;
  submenuPermissions?: SubMenuPermission[];
};

export type SubMenuPermission = {
  id: string;
  name: string;
  description?: string;
  parentId: string;
};

export type RolePermission = {
  menuId: string;
  submenuId?: string;
  access: 'full' | 'read' | 'none';
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  accessLevel: 'unrestricted' | 'high' | 'medium' | 'low';
  systemRole: boolean;
};
