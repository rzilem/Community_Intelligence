
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  Building,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  ClipboardList,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const AppSidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const navigation = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Associations', href: '/associations', icon: Building },
        { name: 'Homeowners', href: '/homeowners', icon: Users },
        { name: 'Calendar', href: '/operations/calendar', icon: Calendar },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Maintenance Requests', href: '/maintenance-requests', icon: ClipboardList },
        { name: 'Homeowner Requests', href: '/community-management/homeowner-requests', icon: UserPlus },
        { name: 'Bid Requests', href: '/community-management/bid-requests', icon: FileText },
        { name: 'Compliance', href: '/compliance', icon: AlertTriangle },
      ]
    },
    {
      title: 'Financial',
      items: [
        { name: 'Accounting', href: '/accounting/dashboard', icon: DollarSign },
        { name: 'Billing', href: '/billing', icon: CreditCard },
        { name: 'Bank Accounts', href: '/accounting/bank-accounts', icon: CreditCard },
        { name: 'Invoice Queue', href: '/accounting/invoice-queue', icon: FileText },
      ]
    },
    {
      title: 'Communication',
      items: [
        { name: 'Messaging', href: '/communications/messaging', icon: MessageSquare },
        { name: 'Announcements', href: '/communications/announcements', icon: MessageSquare },
      ]
    },
    {
      title: 'Reports & Documents',
      items: [
        { name: 'Documents', href: '/records-reports/documents', icon: FileText },
        { name: 'Reports', href: '/records-reports/reports', icon: FileText },
      ]
    }
  ];

  // Add admin-only sections
  if (profile?.role === 'admin') {
    navigation.push({
      title: 'Administration',
      items: [
        { name: 'System Settings', href: '/system/settings', icon: Settings },
        { name: 'User Management', href: '/system/permissions', icon: Users },
        { name: 'Data Management', href: '/system/data-management', icon: FileText },
      ]
    });
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2">
          <Building className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold">Community Intelligence</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.href}
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export { AppSidebar };
