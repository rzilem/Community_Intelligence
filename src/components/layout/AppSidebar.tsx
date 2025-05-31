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
  Building2,
  Home,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Wrench,
  MessageSquare,
  FileCheck,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Properties', url: '/properties', icon: Building2 },
      { title: 'Residents', url: '/residents', icon: Users },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Amenities', url: '/amenities', icon: Calendar },
      { title: 'Maintenance', url: '/maintenance', icon: Wrench },
      { title: 'Communications', url: '/communications', icon: MessageSquare },
      { title: 'Documents', url: '/documents', icon: FileText },
    ],
  },
  {
    title: 'Financial',
    items: [
      { title: 'Assessments', url: '/assessments', icon: DollarSign },
      { title: 'Reports', url: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { title: 'ARC Requests', url: '/arc', icon: FileCheck },
      { title: 'Violations', url: '/violations', icon: Shield },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="sidebar-gradient border-r-0" collapsible="icon">
      <SidebarHeader className="sidebar-header">
        <Link to="/dashboard" className="logo-container">
          <div className="logo-icon">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">Community Intelligence</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        data-active={isActive}
                        className="w-full justify-start"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
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
}