
import React from 'react';
import {
  LayoutDashboard,
  Building,
  Users2,
  FileText,
  MessageSquare,
  ClipboardList,
  DollarSign,
  BarChart3,
  CreditCard,
  Receipt,
  Wallet,
  BookOpen,
  BarChart,
  PiggyBank,
  Send,
  Bell,
  User,
  BarChart2,
  Calendar,
  Building2,
  Mail,
  LineChart,
  ClipboardCheck,
  Printer,
  Database,
  File,
  FileBarChart,
  ScrollText,
  Clipboard,
  ListOrdered,
  Settings,
  Puzzle,
  SlidersHorizontal,
  MailCheck,
  Download,
  Clock,
  Network,
  Shield,
} from 'lucide-react';
import { NavItemProps } from './types';

export const getFilteredNavItems = (userRole?: string): NavItemProps[] => {
  const items: NavItemProps[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];
  
  if (userRole === 'admin' || userRole === 'manager') {
    items.push({ 
      name: 'Community Management', 
      path: '/community-management', 
      icon: Building,
      submenu: [
        { name: 'Associations', path: '/associations', icon: Network },
        { name: 'Homeowners', path: '/homeowners', icon: Users2 },
        { name: 'Homeowner Requests', path: '/community-management/homeowner-requests', icon: ClipboardList },
        { name: 'Compliance', path: '/compliance', icon: Shield },
        { name: 'Communications', path: '/communications', icon: MessageSquare },
        { name: 'Bid Requests', path: '/bid-requests', icon: ClipboardList },
      ]
    });
  }
  
  if (['admin', 'manager', 'accountant'].includes(userRole || '')) {
    items.push({ 
      name: 'Accounting', 
      path: '/accounting', 
      icon: DollarSign,
      submenu: [
        { name: 'Dashboard', path: '/accounting/dashboard', icon: BarChart },
        { name: 'Bank Accounts', path: '/accounting/bank-accounts', icon: Building },
        { name: 'Invoice Queue', path: '/accounting/invoice-queue', icon: Receipt },
        { name: 'Transactions', path: '/accounting/transactions', icon: Receipt },
        { name: 'Payments', path: '/accounting/payments', icon: Wallet },
        { name: 'Journal Entries', path: '/accounting/journal-entries', icon: BookOpen },
        { name: 'GL Accounts', path: '/accounting/gl-accounts', icon: Database },
        { name: 'Financial Reports', path: '/accounting/financial-reports', icon: BarChart2 },
        { name: 'Budget Planning', path: '/accounting/budget-planning', icon: PiggyBank },
      ]
    });
  }
  
  items.push({ 
    name: 'Communications', 
    path: '/communications', 
    icon: MessageSquare,
    submenu: [
      { name: 'Messaging', path: '/communications/messaging', icon: Send },
      { name: 'Announcements', path: '/communications/announcements', icon: Bell },
    ]
  });
  
  if (['admin', 'manager'].includes(userRole || '')) {
    items.push({ 
      name: 'Lead Management', 
      path: '/lead-management', 
      icon: User,
      submenu: [
        { name: 'Leads Dashboard', path: '/lead-management/dashboard', icon: BarChart },
        { name: 'Proposals', path: '/lead-management/proposals', icon: FileText },
        { name: 'Email Campaigns', path: '/lead-management/email-campaigns', icon: Mail },
        { name: 'Analytics', path: '/lead-management/analytics', icon: LineChart },
        { name: 'Onboarding Wizard', path: '/lead-management/onboarding', icon: ClipboardCheck },
      ]
    });
  }
  
  if (['admin', 'manager', 'maintenance', 'accountant'].includes(userRole || '')) {
    items.push({ 
      name: 'Operations', 
      path: '/operations', 
      icon: BarChart,
      submenu: [
        { name: 'Dashboard', path: '/operations/dashboard', icon: BarChart },
        { name: 'Calendar', path: '/operations/calendar', icon: Calendar },
        { name: 'Vendors', path: '/operations/vendors', icon: Building2 },
        { name: 'Letter Templates', path: '/operations/letter-templates', icon: File },
        { name: 'Workflows', path: '/operations/workflows', icon: FileBarChart },
        { name: 'Print Queue', path: '/operations/print-queue', icon: Printer },
      ]
    });
  }
  
  if (['admin', 'manager', 'maintenance', 'accountant'].includes(userRole || '')) {
    items.push({ 
      name: 'Records & Reports', 
      path: '/records-reports', 
      icon: FileText,
      submenu: [
        { name: 'Records', path: '/records-reports/records', icon: Database },
        { name: 'Documents', path: '/records-reports/documents', icon: File },
        { name: 'Reports', path: '/records-reports/reports', icon: FileBarChart },
      ]
    });
  }
  
  if (['admin', 'manager'].includes(userRole || '')) {
    items.push({ 
      name: 'Resale Management', 
      path: '/resale-management', 
      icon: ScrollText,
      submenu: [
        { name: 'Resale Certificate', path: '/resale-management/certificate', icon: Clipboard },
        { name: 'Condo Questionnaire', path: '/resale-management/questionnaire', icon: ClipboardList },
        { name: 'Resale Calendar', path: '/resale-management/calendar', icon: Calendar },
        { name: 'Order Queue', path: '/resale-management/order-queue', icon: ListOrdered },
        { name: 'Analytics', path: '/resale-management/analytics', icon: BarChart },
      ]
    });
  }
  
  if (userRole === 'admin') {
    items.push({ 
      name: 'System', 
      path: '/system', 
      icon: Settings,
      submenu: [
        { name: 'Integrations', path: '/system/integrations', icon: Puzzle },
        { name: 'Settings', path: '/system/settings', icon: SlidersHorizontal },
        { name: 'Email Workflows', path: '/system/email-workflows', icon: MailCheck },
        { name: 'Data Import & Export', path: '/system/import-export', icon: Download },
        { name: 'Workflow Schedule', path: '/system/workflow-schedule', icon: Clock },
        { name: 'Associations', path: '/system/associations', icon: Network },
        { name: 'Permissions', path: '/system/permissions', icon: Shield },
      ]
    });
  }
  
  return items;
};
