
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SidebarNavItem from './SidebarNavItem';
import { NavItemProps } from './types';

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  mainNavItems: NavItemProps[];
  handleSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  isSidebarOpen,
  closeSidebar,
  mainNavItems,
  handleSignOut
}) => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Initialize or update open sections based on current path
    const newOpenSections = {...openSections};
    
    // Check each main navigation item to see if the current path is in its submenu
    mainNavItems.forEach(item => {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some(
          subItem => location.pathname === subItem.path
        );
        
        if (isSubmenuActive) {
          newOpenSections[item.path.replace('/', '')] = true;
        }
      }
    });
    
    setOpenSections(newOpenSections);
  }, [location.pathname]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to check if a main nav item has the current path in its submenu
  const hasActiveSubmenu = (item: NavItemProps) => {
    if (!item.submenu) return false;
    
    return item.submenu.some(
      subItem => location.pathname === subItem.path
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out",
        isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="h-16 py-2.5 px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-lg text-white">Community<br />Intelligence</h1>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={closeSidebar}
          >
            <X size={20} />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 px-2 space-y-1">
          {mainNavItems.map((item) => (
            <SidebarNavItem
              key={item.path}
              name={item.name}
              path={item.path}
              icon={item.icon}
              isOpen={!!openSections[item.path.replace('/', '')]}
              toggleSection={() => toggleSection(item.path.replace('/', ''))}
              isActive={hasActiveSubmenu(item)}
              submenu={item.submenu}
              showBadge={item.name === 'Communications'}
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
