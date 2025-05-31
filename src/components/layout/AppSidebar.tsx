
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
    <Sidebar className="sidebar-gradient border-r-0">
      <SidebarHeader className="border-b border-white/10 bg-transparent">
        <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-3">
          <Building className="h-7 w-7 text-white" />
          <span className="text-lg font-bold text-white">Community Intelligence</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="bg-transparent">
        {navigation.map((section) => (
          <SidebarGroup key={section.title} className="px-2">
            <SidebarGroupLabel className="text-white/70 font-semibold text-xs uppercase tracking-wider mb-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.href}
                      className={`
                        text-white/90 hover:text-white hover:bg-white/10 
                        transition-all duration-200 rounded-lg mb-1
                        ${location.pathname === item.href 
                          ? 'bg-white/20 text-white font-medium shadow-sm' 
                          : ''
                        }
                      `}
                    >
                      <Link to={item.href} className="flex items-center space-x-3 px-3 py-2">
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
