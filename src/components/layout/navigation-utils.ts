import { NavItemProps } from './types';
import { UserRole } from '@/types/profile-types';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  UserPlus,
  Wrench,
  Database,
  BarChart3,
  Settings,
  Brain,
  Building2,
  CreditCard,
  Home,
  Mail,
  TrendingUp,
} from 'lucide-react';

export const mainNavItems: NavItemProps[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    submenu: [
      { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { name: 'All Actions', path: '/dashboard/actions', icon: LayoutDashboard }
    ]
  },
  {
    name: 'AI Workflow',
    path: '/ai-workflow',
    icon: Brain,
    submenu: [
      { name: 'Workflow Designer', path: '/ai-workflow', icon: Brain },
      { name: 'ML Training', path: '/ai-workflow/ml-training', icon: Brain },
      { name: 'Real-time Analytics', path: '/ai-workflow/analytics', icon: TrendingUp },
      { name: 'IoT Integration', path: '/ai-workflow/iot', icon: Database },
      { name: 'Mobile Management', path: '/ai-workflow/mobile', icon: Settings },
      { name: 'Business Intelligence', path: '/ai-workflow/bi', icon: BarChart3 }
    ]
  },
  {
    name: 'Community Management',
    path: '/community-management',
    icon: Building2,
    submenu: [
      { name: 'Associations', path: '/associations', icon: Building2 },
      { name: 'Homeowners', path: '/homeowners', icon: Users },
      { name: 'Properties', path: '/properties', icon: Home },
      { name: 'Maintenance Requests', path: '/maintenance-requests', icon: Wrench },
      { name: 'Compliance', path: '/compliance', icon: FileText },
      { name: 'Amenities', path: '/amenities', icon: Building2 },
      { name: 'Events', path: '/events', icon: Building2 }
    ]
  },
  {
    name: 'Accounting',
    path: '/accounting',
    icon: CreditCard,
    submenu: [
      { name: 'Invoices', path: '/accounting/invoice-queue', icon: CreditCard },
      { name: 'Accounts Receivable', path: '/accounting/accounts-receivable', icon: CreditCard },
      { name: 'Accounts Payable', path: '/accounting/accounts-payable', icon: CreditCard },
      { name: 'General Ledger', path: '/accounting/general-ledger', icon: CreditCard },
      { name: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: CreditCard },
      { name: 'Financial Reports', path: '/accounting/financial-reports', icon: CreditCard },
      { name: 'Assessment Schedules', path: '/accounting/assessment-schedules', icon: CreditCard }
    ]
  },
  {
    name: 'Communications',
    path: '/communications',
    icon: MessageSquare,
    submenu: [
      { name: 'Messages', path: '/communications/messaging', icon: MessageSquare },
      { name: 'Email Campaigns', path: '/enhanced-email-campaigns', icon: Mail },
      { name: 'Announcements', path: '/communications/announcements', icon: MessageSquare },
      { name: 'Notifications', path: '/communications/notifications', icon: MessageSquare },
      { name: 'Templates', path: '/communications/templates', icon: MessageSquare },
      { name: 'Tracking', path: '/communications/tracking', icon: MessageSquare }
    ]
  },
  {
    name: 'Lead Management',
    path: '/lead-management',
    icon: UserPlus,
    submenu: [
      { name: 'Leads', path: '/lead-management/leads', icon: UserPlus },
      { name: 'Proposals', path: '/lead-management/proposals', icon: UserPlus },
      { name: 'Bid Requests', path: '/community-management/bid-requests', icon: UserPlus },
      { name: 'Follow-ups', path: '/lead-management/lead-follow-ups', icon: UserPlus }
    ]
  },
  {
    name: 'Operations',
    path: '/operations',
    icon: Wrench,
    submenu: [
      { name: 'Workflows', path: '/operations/workflows', icon: Wrench },
      { name: 'Vendors', path: '/operations/vendors', icon: Wrench },
      { name: 'Work Orders', path: '/operations/work-orders', icon: Wrench },
      { name: 'Inspections', path: '/operations/inspections', icon: Wrench }
    ]
  },
  {
    name: 'Records & Reports',
    path: '/records-reports',
    icon: FileText,
    submenu: [
      { name: 'Documents', path: '/records-reports/documents', icon: FileText },
      { name: 'Reports', path: '/records-reports/reports', icon: FileText },
      { name: 'Data Import/Export', path: '/records-reports/data-import-export', icon: FileText },
      { name: 'Backup & Archive', path: '/records-reports/backup-archive', icon: FileText }
    ]
  },
  {
    name: 'Resale Management',
    path: '/resale-management',
    icon: Home,
    submenu: [
      { name: 'Resale Certificates', path: '/resale-certificates', icon: Home },
      { name: 'Transfer Requirements', path: '/transfer-requirements', icon: Home },
      { name: 'Document Templates', path: '/document-templates', icon: Home }
    ]
  },
  {
    name: 'System',
    path: '/system',
    icon: Settings,
    submenu: [
      { name: 'Settings', path: '/system/settings', icon: Settings },
      { name: 'User Management', path: '/system/users', icon: Settings },
      { name: 'Permissions', path: '/system/permissions', icon: Settings },
      { name: 'Audit Logs', path: '/system/audit-logs', icon: Settings },
      { name: 'API Keys', path: '/system/api-keys', icon: Settings }
    ]
  }
];

export function getFilteredNavItems(userRole?: UserRole): NavItemProps[] {
  if (!userRole) return [];

  // Filter navigation items based on user role
  switch (userRole) {
    case 'admin':
      return mainNavItems; // Admins see everything
    
    case 'manager':
      return mainNavItems.filter(item => 
        !['System'].includes(item.name)
      );
    
    case 'maintenance':
      return mainNavItems.filter(item => 
        ['Dashboard', 'Community Management', 'Operations', 'Communications'].includes(item.name)
      );
    
    case 'accountant':
      return mainNavItems.filter(item => 
        ['Dashboard', 'Accounting', 'Records & Reports', 'Communications'].includes(item.name)
      );
    
    case 'resident':
      return mainNavItems.filter(item => 
        ['Dashboard', 'Community Management'].includes(item.name)
      ).map(item => {
        if (item.name === 'Community Management') {
          return {
            ...item,
            submenu: item.submenu?.filter(sub => 
              ['Amenities', 'Events'].includes(sub.name)
            )
          };
        }
        return item;
      });
    
    default:
      return mainNavItems.filter(item => 
        ['Dashboard'].includes(item.name)
      );
  }
}