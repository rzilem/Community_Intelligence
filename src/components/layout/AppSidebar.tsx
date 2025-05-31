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
    <Sidebar className="border-r-0" style={{
      background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #2563eb 75%, #1d4ed8 100%)',
      boxShadow: '4px 0 20px rgba(59, 130, 246, 0.15)'
    }}>
      <SidebarHeader style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          color: 'white',
          fontWeight: '700',
          fontSize: '1.25rem',
          textDecoration: 'none'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span>Community Intelligence</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: '600',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '16px 16px 8px 16px'
            }}>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="w-full justify-start"
                        style={{
                          color: isActive ? '#1e40af' : 'rgba(255, 255, 255, 0.9)',
                          background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                          borderRadius: '8px',
                          margin: '2px 8px',
                          fontWeight: isActive ? '600' : '500',
                          transition: 'all 0.2s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
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