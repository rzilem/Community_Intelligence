
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SidebarNavItem from './SidebarNavItem';
import { NavItemProps } from './types';
import { useNotificationContext } from '@/contexts/notifications';

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  mainNavItems: NavItemProps[];
  handleSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  isSidebarOpen,
  closeSidebar,
  toggleSidebar,
  mainNavItems,
  handleSignOut
}) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { notifications } = useNotificationContext();
  
  useEffect(() => {
    // Initialize active section based on current path
    mainNavItems.forEach(item => {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some(
          subItem => location.pathname === subItem.path
        );
        
        if (isSubmenuActive) {
          setActiveSection(item.path.replace('/', ''));
        }
      }
    });
  }, [location.pathname, mainNavItems]);

  const toggleSection = (section: string) => {
    // If clicking the currently active section, close it
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      // Otherwise, set it as the new active section (and close the previous one)
      setActiveSection(section);
    }
  };

  // Helper function to check if a main nav item has the current path in its submenu
  const hasActiveSubmenu = (item: NavItemProps) => {
    if (!item.submenu) return false;
    
    return item.submenu.some(
      subItem => location.pathname === subItem.path
    );
  };

  // Function to get notification count for a specific section
  const getNotificationCount = (itemPath: string): number => {
    const section = itemPath.replace('/', '');
    
    // Count notifications by type
    if (section === 'lead-management') {
      return notifications.filter(n => n.type === 'lead' && !n.read).length;
    } else if (section === 'accounting') {
      return notifications.filter(n => n.type === 'invoice' && !n.read).length;
    } else if (section === 'community-management') {
      return notifications.filter(n => n.type === 'request' && !n.read).length;
    } else if (section === 'resale-management') {
      return notifications.filter(n => n.type === 'event' && !n.read).length;
    } else if (section === 'communications') {
      return notifications.filter(n => n.type === 'message' && !n.read).length;
    }
    
    return 0;
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out",
        !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="h-16 py-2.5 px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-lg text-white">Community<br />Intelligence</h1>
        </div>
        <div className="flex items-center gap-1">
          {/* Desktop collapse button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={toggleSidebar}
            >
              <ChevronLeft size={20} />
              <span className="sr-only">Collapse Sidebar</span>
            </Button>
          )}
          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={closeSidebar}
            >
              <X size={20} />
              <span className="sr-only">Close Sidebar</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 px-2 space-y-1">
          {mainNavItems.map((item) => (
            <SidebarNavItem
              key={item.path}
              name={item.name}
              path={item.path}
              icon={item.icon}
              isOpen={activeSection === item.path.replace('/', '')}
              toggleSection={() => toggleSection(item.path.replace('/', ''))}
              isActive={hasActiveSubmenu(item)}
              submenu={item.submenu}
              showBadge={true}
              badgeCount={getNotificationCount(item.path)}
            />
          ))}
        </div>
      </div>
      
      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-md text-white/80 hover:bg-white/10"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
