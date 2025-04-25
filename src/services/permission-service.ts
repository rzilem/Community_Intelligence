
import { Role, RolePermission, MenuPermission } from '@/types/permission-types';

// Define the MenuItemWithSubmenu type that's being imported
export type MenuItemWithSubmenu = {
  id: string;
  title: string;
  description?: string;
  submenus?: {
    id: string;
    title: string;
    description?: string;
  }[];
};

// Define sample menu structure for the application
export const defaultMenus: MenuItemWithSubmenu[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Access to dashboard and overview statistics",
    submenus: [
      { id: "analytics", title: "Analytics", description: "View analytics and reports" },
      { id: "statistics", title: "Statistics", description: "Access detailed statistics" }
    ]
  },
  {
    id: "users",
    title: "User Management",
    description: "Manage users and their profiles",
    submenus: [
      { id: "view", title: "View Users", description: "View user details" },
      { id: "create", title: "Create Users", description: "Create new users" },
      { id: "edit", title: "Edit Users", description: "Edit existing users" },
      { id: "delete", title: "Delete Users", description: "Delete users from the system" }
    ]
  },
  {
    id: "system",
    title: "System Settings",
    description: "Manage system configuration and settings",
    submenus: [
      { id: "settings", title: "General Settings", description: "Configure general system settings" },
      { id: "permissions", title: "Role Permissions", description: "Configure user role permissions" },
      { id: "data-management", title: "Data Management", description: "Manage system data" },
      { id: "email-workflows", title: "Email Workflows", description: "Configure email workflows" },
      { id: "workflow-schedule", title: "Workflow Schedule", description: "Configure workflow schedules" },
      { id: "form-builder", title: "Form Builder", description: "Create and edit forms" },
      { id: "users", title: "User Management", description: "Manage system users" }
    ]
  },
  {
    id: "associations",
    title: "Association Management",
    description: "Manage homeowner associations",
    submenus: [
      { id: "view", title: "View Associations", description: "View association details" },
      { id: "create", title: "Create Associations", description: "Create new associations" },
      { id: "edit", title: "Edit Associations", description: "Edit existing associations" },
      { id: "delete", title: "Delete Associations", description: "Delete associations" }
    ]
  },
  {
    id: "properties",
    title: "Property Management",
    description: "Manage properties within associations",
    submenus: [
      { id: "view", title: "View Properties", description: "View property details" },
      { id: "create", title: "Create Properties", description: "Add new properties" },
      { id: "edit", title: "Edit Properties", description: "Update property information" },
      { id: "delete", title: "Delete Properties", description: "Remove properties" }
    ]
  }
];

// Define sample roles with their permissions
export const defaultRoles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      { menuId: "dashboard", access: "full" },
      { menuId: "users", access: "full" },
      { menuId: "system", access: "full" },
      { menuId: "associations", access: "full" },
      { menuId: "properties", access: "full" }
    ],
    accessLevel: "unrestricted",
    systemRole: true
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manages day-to-day operations with limited system settings access",
    permissions: [
      { menuId: "dashboard", access: "full" },
      { menuId: "users", access: "read" },
      { menuId: "system", submenuId: "settings", access: "read" },
      { menuId: "associations", access: "full" },
      { menuId: "properties", access: "full" }
    ],
    accessLevel: "high",
    systemRole: false
  },
  {
    id: "resident",
    name: "Resident",
    description: "Standard homeowner access for residents",
    permissions: [
      { menuId: "dashboard", access: "read" },
      { menuId: "properties", submenuId: "view", access: "read" }
    ],
    accessLevel: "low",
    systemRole: false
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Access for maintenance staff",
    permissions: [
      { menuId: "dashboard", access: "read" },
      { menuId: "properties", submenuId: "view", access: "read" },
      { menuId: "properties", submenuId: "edit", access: "read" }
    ],
    accessLevel: "medium",
    systemRole: false
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Financial management access",
    permissions: [
      { menuId: "dashboard", access: "read" },
      { menuId: "associations", submenuId: "view", access: "read" }
    ],
    accessLevel: "medium",
    systemRole: false
  },
  {
    id: "user",
    name: "Basic User",
    description: "Limited access for basic users",
    permissions: [
      { menuId: "dashboard", access: "read" }
    ],
    accessLevel: "low",
    systemRole: true
  }
];

// Utility function to check if a role has a specific permission
export const hasPermission = (
  role: Role,
  menuId: string,
  submenuId?: string,
  requiredAccess: 'read' | 'full' = 'read'
): boolean => {
  // Check for direct permission match
  const permission = role.permissions.find(
    p => p.menuId === menuId && 
    ((!submenuId && !p.submenuId) || (submenuId && p.submenuId === submenuId))
  );
  
  // If direct permission exists, check if it meets the required access level
  if (permission) {
    if (requiredAccess === 'read') {
      // For read access, either 'read' or 'full' is sufficient
      return permission.access === 'read' || permission.access === 'full';
    } else {
      // For full access, only 'full' is sufficient
      return permission.access === 'full';
    }
  }
  
  // If no direct submenu permission, check if there's a parent menu permission with full access
  if (submenuId) {
    const parentPermission = role.permissions.find(
      p => p.menuId === menuId && !p.submenuId
    );
    
    if (parentPermission && parentPermission.access === 'full') {
      return true; // Parent has full access, which implies access to all submenus
    }
  }
  
  // No matching permission found
  return false;
};
