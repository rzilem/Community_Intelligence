// AppSidebar.tsx - Restore Beautiful Blue Gradient Sidebar
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
      <SidebarHeader className="border-b border-blue-600/20 bg-gradient-to-b from-blue-900/50 to-transparent">
        <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200">
          <Building className="h-8 w-8 text-blue-200" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">Community</span>
            <span className="text-sm font-medium text-blue-200">Intelligence</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="bg-transparent">
        {navigation.map((section) => (
          <SidebarGroup key={section.title} className="px-3 py-2">
            <SidebarGroupLabel className="text-blue-200 font-semibold text-xs uppercase tracking-wider mb-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        className={`
                          group relative overflow-hidden rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-white text-blue-900 shadow-lg transform scale-[1.02]' 
                            : 'text-white/90 hover:bg-white/10 hover:text-white hover:transform hover:scale-[1.01]'
                          }
                        `}
                      >
                        <Link to={item.href} className="flex items-center space-x-3 px-3 py-2.5">
                          <item.icon className={`h-5 w-5 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'
                          }`} />
                          <span className="font-medium">{item.name}</span>
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-20 rounded-lg" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export { AppSidebar };