import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarNavItem from './SidebarNavItem';
import { NavItemProps } from './types';
import { useNotificationContext } from '@/contexts/notifications';
import { getPortalMenuItems } from './portals/PortalMenuItems';
import { getNotificationCount } from './utils/notificationUtils';
import SidebarHeader from './SidebarHeader';
import SidebarFooter from './SidebarFooter';
import ActivePortalNav from './portals/ActivePortalNav';

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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { notifications } = useNotificationContext();

  useEffect(() => {
    // Check if we're in a portal route to auto-expand the portal section
    if (location.pathname.startsWith('/portal') || location.pathname.startsWith('/resale-portal')) {
      setActiveSection('portal-selection');
    } else {
      // Check for other section matches
      mainNavItems.forEach(item => {
        if (item.submenu) {
          const isSubmenuActive = item.submenu.some(subItem => location.pathname === subItem.path);
          if (isSubmenuActive) {
            setActiveSection(item.path.replace('/', ''));
          }
        }
      });
    }
  }, [location.pathname, mainNavItems]);

  const toggleSection = (section: string) => {
    // Fixed toggle logic: If the clicked section is already active, close it.
    // Otherwise, open the clicked section and close others
    setActiveSection(activeSection === section ? null : section);
  };

  const hasActiveSubmenu = (item: NavItemProps) => {
    if (!item.submenu) return false;
    return item.submenu.some(subItem => location.pathname === subItem.path);
  };

  const isHomeownerPortal = location.pathname.startsWith('/portal/homeowner');
  const isBoardPortal = location.pathname.startsWith('/portal/board');
  const isResalePortal = location.pathname.startsWith('/resale-portal');
  const isVendorPortal = location.pathname.startsWith('/portal/vendor');

  // Portal menu items for the portal selection submenu
  const portalMenuItems = getPortalMenuItems(location.pathname);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out", 
      isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
    )}>
      <SidebarHeader isMobile={isMobile} closeSidebar={closeSidebar} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 px-2 space-y-1">
          {/* Portal Selection with submenu */}
          <SidebarNavItem 
            name="Portal Selection" 
            path="/portal" 
            icon={Home} 
            isOpen={activeSection === 'portal-selection'} 
            toggleSection={() => toggleSection('portal-selection')} 
            isActive={location.pathname === '/portal' || portalMenuItems.some(item => item.isActive)}
            submenu={portalMenuItems.map(item => ({
              name: item.name,
              path: item.path,
              icon: item.icon
            }))}
          />
          
          {/* Render specific portal content when on that portal */}
          <ActivePortalNav 
            currentPath={location.pathname}
            isHomeownerPortal={isHomeownerPortal}
            isBoardPortal={isBoardPortal}
            isResalePortal={isResalePortal}
            isVendorPortal={isVendorPortal}
          />

          {/* Main navigation items */}
          {mainNavItems.map(item => (
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
              badgeCount={getNotificationCount(item.path, notifications)} 
            />
          ))}
        </div>
      </div>
      
      <SidebarFooter handleSignOut={handleSignOut} />
    </div>
  );
};

export default Sidebar;
