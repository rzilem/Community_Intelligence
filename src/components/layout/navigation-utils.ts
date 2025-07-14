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
      { name: 'Overview', path: '/dashboard' },
      { name: 'All Actions', path: '/dashboard/actions' }
    ]
  },
  {
    name: 'AI Workflow',
    path: '/ai-workflow',
    icon: Brain,
    submenu: [
      { name: 'Workflow Designer', path: '/ai-workflow' },
      { name: 'ML Training', path: '/ai-workflow/ml-training' },
      { name: 'Real-time Analytics', path: '/ai-workflow/analytics' },
      { name: 'IoT Integration', path: '/ai-workflow/iot' },
      { name: 'Mobile Management', path: '/ai-workflow/mobile' },
      { name: 'Business Intelligence', path: '/ai-workflow/bi' }
    ]
  },
  {
    name: 'Community Management',
    path: '/community-management',
    icon: Building2,
    submenu: [
      { name: 'Associations', path: '/associations' },
      { name: 'Homeowners', path: '/homeowners' },
      { name: 'Properties', path: '/properties' },
      { name: 'Maintenance Requests', path: '/maintenance-requests' },
      { name: 'Compliance', path: '/compliance' },
      { name: 'Amenities', path: '/amenities' },
      { name: 'Events', path: '/events' }
    ]
  },
  {
    name: 'Accounting',
    path: '/accounting',
    icon: CreditCard,
    submenu: [
      { name: 'Invoices', path: '/invoices' },
      { name: 'Accounts Receivable', path: '/accounts-receivable' },
      { name: 'Accounts Payable', path: '/accounts-payable' },
      { name: 'General Ledger', path: '/general-ledger' },
      { name: 'Chart of Accounts', path: '/chart-of-accounts' },
      { name: 'Financial Reports', path: '/financial-reports' },
      { name: 'Assessment Schedules', path: '/assessment-schedules' }
    ]
  },
  {
    name: 'Communications',
    path: '/communications',
    icon: MessageSquare,
    submenu: [
      { name: 'Messages', path: '/communications/messages' },
      { name: 'Email Campaigns', path: '/communications/campaigns' },
      { name: 'Announcements', path: '/communications/announcements' },
      { name: 'Notifications', path: '/communications/notifications' },
      { name: 'Templates', path: '/communications/templates' },
      { name: 'Tracking', path: '/communications/tracking' }
    ]
  },
  {
    name: 'Lead Management',
    path: '/lead-management',
    icon: UserPlus,
    submenu: [
      { name: 'Leads', path: '/leads' },
      { name: 'Proposals', path: '/proposals' },
      { name: 'Bid Requests', path: '/bid-requests' },
      { name: 'Follow-ups', path: '/lead-follow-ups' }
    ]
  },
  {
    name: 'Operations',
    path: '/operations',
    icon: Wrench,
    submenu: [
      { name: 'Workflows', path: '/workflows' },
      { name: 'Vendors', path: '/vendors' },
      { name: 'Work Orders', path: '/work-orders' },
      { name: 'Inspections', path: '/inspections' }
    ]
  },
  {
    name: 'Records & Reports',
    path: '/records-reports',
    icon: FileText,
    submenu: [
      { name: 'Documents', path: '/documents' },
      { name: 'Reports', path: '/reports' },
      { name: 'Data Import/Export', path: '/data-import-export' },
      { name: 'Backup & Archive', path: '/backup-archive' }
    ]
  },
  {
    name: 'Resale Management',
    path: '/resale-management',
    icon: Home,
    submenu: [
      { name: 'Resale Certificates', path: '/resale-certificates' },
      { name: 'Transfer Requirements', path: '/transfer-requirements' },
      { name: 'Document Templates', path: '/document-templates' }
    ]
  },
  {
    name: 'System',
    path: '/system',
    icon: Settings,
    submenu: [
      { name: 'Settings', path: '/system/settings' },
      { name: 'User Management', path: '/system/users' },
      { name: 'Permissions', path: '/system/permissions' },
      { name: 'Audit Logs', path: '/system/audit-logs' },
      { name: 'API Keys', path: '/system/api-keys' }
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