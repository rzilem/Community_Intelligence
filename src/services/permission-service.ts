import { MenuPermission, Role, RolePermission, SubMenuPermission } from '@/types/permission-types';
import { supabase } from '@/integrations/supabase/client';

// Define all available menu and submenu permissions
export const menuPermissions: MenuPermission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Access to the main dashboard',
    submenuPermissions: []
  },
  {
    id: 'community-management',
    name: 'Community Management',
    description: 'Access to community management features',
    submenuPermissions: [
      { id: 'associations', name: 'Associations', parentId: 'community-management' },
      { id: 'homeowners', name: 'Homeowners', parentId: 'community-management' },
      { id: 'homeowner-requests', name: 'Homeowner Requests', parentId: 'community-management' },
      { id: 'compliance', name: 'Compliance', parentId: 'community-management' },
      { id: 'bid-requests', name: 'Bid Requests', parentId: 'community-management' }
    ]
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Access to accounting features',
    submenuPermissions: [
      { id: 'accounting-dashboard', name: 'Dashboard', parentId: 'accounting' },
      { id: 'bank-accounts', name: 'Bank Accounts', parentId: 'accounting' },
      { id: 'invoice-queue', name: 'Invoice Queue', parentId: 'accounting' },
      { id: 'transactions', name: 'Transactions & Payments', parentId: 'accounting' },
      { id: 'gl-accounts', name: 'GL Accounts', parentId: 'accounting' },
      { id: 'budget-planning', name: 'Budget Planning', parentId: 'accounting' }
    ]
  },
  {
    id: 'communications',
    name: 'Communications',
    description: 'Access to communication features',
    submenuPermissions: [
      { id: 'messaging', name: 'Messaging', parentId: 'communications' },
      { id: 'announcements', name: 'Announcements', parentId: 'communications' }
    ]
  },
  {
    id: 'lead-management',
    name: 'Lead Management',
    description: 'Access to lead management features',
    submenuPermissions: [
      { id: 'leads-dashboard', name: 'Leads Dashboard', parentId: 'lead-management' },
      { id: 'proposals', name: 'Proposals', parentId: 'lead-management' },
      { id: 'email-campaigns', name: 'Email Campaigns', parentId: 'lead-management' },
      { id: 'analytics', name: 'Analytics', parentId: 'lead-management' },
      { id: 'onboarding', name: 'Onboarding Wizard', parentId: 'lead-management' }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Access to operational features',
    submenuPermissions: [
      { id: 'operations-dashboard', name: 'Dashboard', parentId: 'operations' },
      { id: 'calendar', name: 'Calendar', parentId: 'operations' },
      { id: 'vendors', name: 'Vendors', parentId: 'operations' },
      { id: 'letter-templates', name: 'Letter Templates', parentId: 'operations' },
      { id: 'workflows', name: 'Workflows', parentId: 'operations' },
      { id: 'print-queue', name: 'Print Queue', parentId: 'operations' }
    ]
  },
  {
    id: 'records-reports',
    name: 'Records & Reports',
    description: 'Access to records and reports',
    submenuPermissions: [
      { id: 'documents', name: 'Documents', parentId: 'records-reports' },
      { id: 'reports', name: 'Reports', parentId: 'records-reports' }
    ]
  },
  {
    id: 'resale-management',
    name: 'Resale Management',
    description: 'Access to resale management features',
    submenuPermissions: [
      { id: 'certificate', name: 'Resale Certificate', parentId: 'resale-management' },
      { id: 'docs-center', name: 'Docs Center', parentId: 'resale-management' },
      { id: 'resale-calendar', name: 'Resale Calendar', parentId: 'resale-management' },
      { id: 'order-queue', name: 'Order Queue', parentId: 'resale-management' },
      { id: 'resale-analytics', name: 'Analytics', parentId: 'resale-management' }
    ]
  },
  {
    id: 'homeowner-portal',
    name: 'Homeowner Portal',
    description: 'Access to homeowner portal features',
    submenuPermissions: [
      { id: 'my-profile', name: 'My Profile', parentId: 'homeowner-portal' },
      { id: 'my-property', name: 'My Property', parentId: 'homeowner-portal' },
      { id: 'my-payments', name: 'My Payments', parentId: 'homeowner-portal' },
      { id: 'my-requests', name: 'My Requests', parentId: 'homeowner-portal' },
      { id: 'my-documents', name: 'My Documents', parentId: 'homeowner-portal' },
      { id: 'amenity-bookings', name: 'Amenity Bookings', parentId: 'homeowner-portal' }
    ]
  },
  {
    id: 'board-portal',
    name: 'Board Portal',
    description: 'Access to board member portal features',
    submenuPermissions: [
      { id: 'board-dashboard', name: 'Board Dashboard', parentId: 'board-portal' },
      { id: 'financial-reports', name: 'Financial Reports', parentId: 'board-portal' },
      { id: 'board-documents', name: 'Board Documents', parentId: 'board-portal' },
      { id: 'violation-review', name: 'Violation Review', parentId: 'board-portal' },
      { id: 'arc-requests', name: 'ARC Requests', parentId: 'board-portal' }
    ]
  },
  {
    id: 'vendor-portal',
    name: 'Vendor Portal',
    description: 'Access to vendor portal features',
    submenuPermissions: [
      { id: 'vendor-profile', name: 'Company Profile', parentId: 'vendor-portal' },
      { id: 'vendor-payments', name: 'Payment History', parentId: 'vendor-portal' },
      { id: 'vendor-invoices', name: 'Invoices', parentId: 'vendor-portal' },
      { id: 'preferred-status', name: 'Preferred Status', parentId: 'vendor-portal' },
      { id: 'bid-opportunities', name: 'Bid Opportunities', parentId: 'vendor-portal' }
    ]
  },
  {
    id: 'resale-portal',
    name: 'Resale Portal',
    description: 'Access to resale portal features for title companies and real estate agents',
    submenuPermissions: [
      { id: 'resale-dashboard', name: 'Resale Dashboard', parentId: 'resale-portal' },
      { id: 'order-documents', name: 'Order Documents', parentId: 'resale-portal' },
      { id: 'my-orders', name: 'My Orders', parentId: 'resale-portal' },
      { id: 'account-settings', name: 'Account Settings', parentId: 'resale-portal' },
    ]
  },
  {
    id: 'system',
    name: 'System',
    description: 'Access to system settings and configuration',
    submenuPermissions: [
      { id: 'settings', name: 'Settings', parentId: 'system' },
      { id: 'email-workflows', name: 'Email Workflows', parentId: 'system' },
      { id: 'data-management', name: 'Data Management', parentId: 'system' },
      { id: 'financial-report-mapping', name: 'Financial Report Mapping', parentId: 'system' },
      { id: 'workflow-schedule', name: 'Workflow Schedule', parentId: 'system' },
      { id: 'permissions', name: 'Permissions', parentId: 'system' }
    ]
  }
];

// Default roles with permissions
export const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features, including system settings',
    accessLevel: 'unrestricted',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      const menuPermission: RolePermission = { menuId: menu.id, access: 'full' };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access: 'full'
      }));
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Access to most features except system configuration',
    accessLevel: 'high',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      const access = menu.id === 'system' ? 'read' : 'full';
      const menuPermission: RolePermission = { menuId: menu.id, access };
      
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => {
        if (menu.id === 'system' && ['permissions', 'settings'].includes(submenu.id)) {
          return { menuId: menu.id, submenuId: submenu.id, access: 'none' };
        }
        return { menuId: menu.id, submenuId: submenu.id, access };
      });
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'resident',
    name: 'Resident',
    description: 'Access to community information and resident features',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      if (['dashboard', 'communications'].includes(menu.id)) {
        access = 'read';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Access to maintenance requests and schedules',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      if (['dashboard', 'operations'].includes(menu.id)) {
        access = 'full';
      } else if (['community-management'].includes(menu.id)) {
        access = 'read';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => {
        if (menu.id === 'community-management' && submenu.id === 'homeowner-requests') {
          return { menuId: menu.id, submenuId: submenu.id, access: 'full' };
        }
        return { menuId: menu.id, submenuId: submenu.id, access };
      });
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Access to financial information and reports',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      if (['dashboard', 'accounting'].includes(menu.id)) {
        access = 'full';
      } else if (['records-reports'].includes(menu.id)) {
        access = 'read';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => {
        return { menuId: menu.id, submenuId: submenu.id, access };
      });
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'user',
    name: 'Basic User',
    description: 'Limited access to basic features only',
    accessLevel: 'low',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      const access = menu.id === 'dashboard' ? 'read' : 'none';
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'board-member',
    name: 'Board Member',
    description: 'Board member access to association governance features',
    accessLevel: 'high',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      
      if (['dashboard', 'board-portal', 'homeowner-portal'].includes(menu.id)) {
        access = 'full';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'homeowner',
    name: 'Homeowner',
    description: 'Homeowner access to portal features',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      
      if (['homeowner-portal'].includes(menu.id)) {
        access = 'full';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'vendor',
    name: 'Vendor',
    description: 'Vendor access to portal features',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      
      if (['vendor-portal'].includes(menu.id)) {
        access = 'full';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'title-agent',
    name: 'Title Agent',
    description: 'Access to resale portal for ordering and managing resale documents',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      
      if (['resale-portal'].includes(menu.id)) {
        access = 'full';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  },
  {
    id: 'real-estate-agent',
    name: 'Real Estate Agent',
    description: 'Access to resale portal for ordering and managing resale documents',
    accessLevel: 'medium',
    systemRole: true,
    permissions: menuPermissions.flatMap(menu => {
      let access: 'full' | 'read' | 'none' = 'none';
      
      if (['resale-portal'].includes(menu.id)) {
        access = 'full';
      }
      
      const menuPermission: RolePermission = { menuId: menu.id, access };
      const submenuPermissions: RolePermission[] = (menu.submenuPermissions || []).map(submenu => ({
        menuId: menu.id,
        submenuId: submenu.id,
        access
      }));
      
      return [menuPermission, ...submenuPermissions];
    })
  }
];

// Check if a role has permission for a specific menu or submenu
export const hasPermission = (role: Role, menuId: string, submenuId?: string, requiredAccess: 'read' | 'full' = 'read'): boolean => {
  const menuPermission = role.permissions.find(p => p.menuId === menuId && !p.submenuId);
  if (!menuPermission || menuPermission.access === 'none') {
    return false;
  }
  
  if (requiredAccess === 'full' && menuPermission.access === 'read') {
    if (submenuId) {
      const submenuPermission = role.permissions.find(
        p => p.menuId === menuId && p.submenuId === submenuId
      );
      return submenuPermission?.access === 'full';
    }
    return false;
  }
  
  if (submenuId) {
    const submenuPermission = role.permissions.find(
      p => p.menuId === menuId && p.submenuId === submenuId
    );
    
    if (!submenuPermission) {
      return true;
    }
    
    if (submenuPermission.access === 'none') {
      return false;
    }
    
    return requiredAccess === 'read' || submenuPermission.access === 'full';
  }
  
  return true;
};

// Save role permissions to Supabase (to be implemented with your DB schema)
export const saveRolePermissions = async (roleId: string, permissions: RolePermission[]): Promise<boolean> => {
  try {
    console.log('Would save permissions for role:', roleId, permissions);
    
    return true;
  } catch (err) {
    console.error('Error saving role permissions:', err);
    return false;
  }
};
