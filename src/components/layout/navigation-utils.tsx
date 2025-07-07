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
  SlidersHorizontal,
  MailCheck,
  Download,
  Clock,
  Network,
  Shield,
} from 'lucide-react';
import { NavItemProps } from './types';
import { isAdminRole } from '@/utils/role-utils';

export const getFilteredNavItems = (userRole?: string): NavItemProps[] => {
  const items: NavItemProps[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];
  
  if (isAdminRole(userRole) || userRole === 'manager') {
    items.push({ 
      name: 'Community Management', 
      path: '/community-management', 
      icon: Building,
      submenu: [
        { name: 'Associations', path: '/associations', icon: Network },
        { name: 'Homeowners', path: '/homeowners', icon: Users2 },
        { name: 'Homeowner Requests', path: '/community-management/homeowner-requests', icon: ClipboardList },
        { name: 'Compliance', path: '/compliance', icon: Shield },
        { name: 'Bid Requests', path: '/community-management/bid-requests', icon: ClipboardList },
      ]
    });
  }
  
  if (isAdminRole(userRole) || ['manager', 'accountant'].includes(userRole || '')) {
    items.push({ 
      name: 'Accounting', 
      path: '/accounting', 
      icon: DollarSign,
      submenu: [
        // Dashboard & Overview
        { name: 'Dashboard', path: '/accounting/dashboard', icon: BarChart },
        { name: 'Financial Reports', path: '/accounting/financial-reports', icon: BarChart2 },
        
        // Data Management
        { name: 'GL Accounts', path: '/accounting/gl-accounts', icon: Database },
        { name: 'Journal Entries', path: '/accounting/journal-entries', icon: BookOpen },
        { name: 'Bank Accounts', path: '/accounting/bank-accounts', icon: Building },
        { name: 'Bank Reconciliation', path: '/accounting/bank-reconciliation', icon: ClipboardCheck },
        
        // Transactions
        { name: 'Invoice Queue', path: '/accounting/invoice-queue', icon: Receipt },
        { name: 'Transactions & Payments', path: '/accounting/transactions-payments', icon: CreditCard },
        { name: 'Accounts Payable', path: '/accounting/accounts-payable', icon: Wallet },
        
        // Assessment & Collections
        { name: 'Assessment Management', path: '/accounting/assessment-management', icon: ListOrdered },
        { name: 'Collection Management', path: '/accounting/collections', icon: ClipboardList },
        
        // Payment Processing
        { name: 'Payment Batches', path: '/accounting/payment-batches', icon: CreditCard },
        { name: 'Resident Payment Portal', path: '/accounting/resident-portal', icon: User },
        
        // Budgeting & Planning
        { name: 'Budget Planning', path: '/accounting/budget-planning', icon: PiggyBank },
        
        // Tax & Compliance
        { name: 'Tax Reporting', path: '/accounting/tax-reporting', icon: FileText },
        { name: 'Financial Statements', path: '/accounting/financial-statements', icon: BarChart2 },
        
        // System Integration
        { name: 'Financial Report Mapping', path: '/accounting/financial-report-mapping', icon: FileBarChart },
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
  
  if (isAdminRole(userRole) || userRole === 'manager') {
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
  
  if (isAdminRole(userRole) || ['manager', 'maintenance', 'accountant'].includes(userRole || '')) {
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
  
  if (isAdminRole(userRole) || ['manager', 'maintenance', 'accountant'].includes(userRole || '')) {
    items.push({ 
      name: 'Records & Reports', 
      path: '/records-reports', 
      icon: FileText,
      submenu: [
        { name: 'Documents', path: '/records-reports/documents', icon: File },
        { name: 'Reports', path: '/records-reports/reports', icon: FileBarChart },
      ]
    });
  }
  
  if (isAdminRole(userRole) || userRole === 'manager') {
    items.push({ 
      name: 'Resale Management', 
      path: '/resale-management', 
      icon: ScrollText,
      submenu: [
        { name: 'Resale Certificate', path: '/resale-management/certificate', icon: Clipboard },
        { name: 'Docs Center', path: '/resale-management/docs-center', icon: FileText },
        { name: 'Resale Calendar', path: '/resale-management/calendar', icon: Calendar },
        { name: 'Order Queue', path: '/resale-management/order-queue', icon: ListOrdered },
        { name: 'Analytics', path: '/resale-management/analytics', icon: BarChart },
      ]
    });
  }
  
  if (isAdminRole(userRole)) {
    items.push({ 
      name: 'System', 
      path: '/system', 
      icon: Settings,
      submenu: [
        { name: 'Settings', path: '/system/settings', icon: SlidersHorizontal },
        { name: 'Email Workflows', path: '/system/email-workflows', icon: MailCheck },
        { name: 'Data Management', path: '/system/data-management', icon: Database },
        { name: 'Financial Report Mapping', path: '/system/financial-report-mapping', icon: FileBarChart },
        { name: 'Workflow Schedule', path: '/system/workflow-schedule', icon: Clock },
        { name: 'Permissions', path: '/system/permissions', icon: Shield },
      ]
    });
  }
  
  return items;
};
