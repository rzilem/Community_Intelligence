
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Calendar, Home, LineChart, MessageSquare, Settings, Users2, Building, ClipboardList, DollarSign, Shield, HelpCircle, Menu, X, LogOut, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = React.useState(false);
  const { signOut } = useAuth();

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Properties', path: '/properties', icon: Building },
    { name: 'Residents', path: '/residents', icon: Users2 },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Accounting', path: '/accounting', icon: DollarSign },
    { name: 'Compliance', path: '/compliance', icon: Shield },
    { name: 'Reports', path: '/reports', icon: LineChart },
    { name: 'Communications', path: '/communications', icon: MessageSquare },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="hidden md:flex border-r">
          <SidebarHeader className="h-16 py-2.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!collapsed && (
                <h1 className="font-display font-bold text-lg text-white">Community<br />Intelligence</h1>
              )}
              {collapsed && (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="font-display font-bold text-lg text-hoa-blue">CI</span>
                </div>
              )}
            </div>
            <SidebarTrigger>
              {collapsed ? <ChevronLeft size={20} /> : <X size={20} />}
            </SidebarTrigger>
          </SidebarHeader>
          
          <SidebarContent className="overflow-auto">
            <div className="p-2">
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => navigate(item.path)}
                        className={`w-full ${location.pathname === item.path ? 'bg-sidebar-accent text-white' : 'text-white/80 hover:bg-white/10'}`}
                      >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                        {item.name === 'Communications' && (
                          <Badge className="ml-auto bg-hoa-accent text-white">3</Badge>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
          
          <SidebarFooter className="p-2 border-t border-white/10">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => navigate('/settings')} className="text-white/80 hover:bg-white/10 w-full">
                    <Settings size={20} />
                    <span>Settings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => navigate('/help')} className="text-white/80 hover:bg-white/10 w-full">
                    <HelpCircle size={20} />
                    <span>Help</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={handleSignOut} className="text-white/80 hover:bg-white/10 w-full">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile header */}
          <header className="flex md:hidden items-center justify-between h-16 px-4 border-b bg-white">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu size={20} />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            
            <div className="flex items-center">
              <h1 className="font-display font-bold text-xl text-hoa-blue">Community Intelligence</h1>
            </div>
            
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell size={20} />
            </Button>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
