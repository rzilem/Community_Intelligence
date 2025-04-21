
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LogOut, X, Home, Building, Truck, CreditCard, FileText, Calendar, Users, File, WrenchIcon, PiggyBank, BarChart, AlertTriangle, CheckSquare, Mail, BookOpen, Video, Sparkles, DollarSign, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SidebarNavItem from './SidebarNavItem';
import { NavItemProps } from './types';
import { useNotificationContext } from '@/contexts/notifications';

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

  // Homeowner Portal Menu Items
  const homeownerPortalItems = [
    { name: 'Dashboard', path: '/portal/homeowner', icon: LayoutDashboard },
    { name: 'Payments', path: '/portal/homeowner/payments', icon: CreditCard },
    { name: 'Requests', path: '/portal/homeowner/requests', icon: FileText },
    { name: 'Calendar & Events', path: '/portal/homeowner/calendar', icon: Calendar },
    { name: 'Directory', path: '/portal/homeowner/directory', icon: Users },
    { name: 'Documents', path: '/portal/homeowner/documents', icon: File },
  ];

  // Board Portal Menu Items
  const boardPortalItems = [
    { name: 'Dashboard', path: '/portal/board/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', path: '/portal/board/invoices', icon: CreditCard },
    { name: 'Work Orders', path: '/portal/board/work-orders', icon: WrenchIcon },
    { name: 'Collections', path: '/portal/board/collections', icon: PiggyBank },
    { name: 'Homeowners', path: '/portal/board/homeowners', icon: Users },
    { name: 'Bank Accounts', path: '/portal/board/bank-accounts', icon: Building },
    { name: 'Reports', path: '/portal/board/reports', icon: BarChart },
    { name: 'Violations', path: '/portal/board/violations', icon: AlertTriangle },
    { name: 'Board Tasks', path: '/portal/board/tasks', icon: CheckSquare },
    { name: 'Email Community', path: '/portal/board/email', icon: Mail },
    { name: 'Board Portal Training', path: '/portal/board/training', icon: BookOpen },
    { name: 'Board Member Video Education', path: '/portal/board/video-education', icon: Video },
    { name: 'Board Member AI Assistant', path: '/portal/board/ai-assistant', icon: Sparkles },
    { name: 'Board Reimbursement', path: '/portal/board/reimbursement', icon: DollarSign },
  ];

  // Check if current path is in homeowner or board portal
  const isHomeownerPortal = location.pathname.startsWith('/portal/homeowner');
  const isBoardPortal = location.pathname.startsWith('/portal/board');

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
          {/* Main Portal Selection */}
          <div className="mb-2 pb-2 border-b border-white/10">
            <Link
              to="/portal"
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10",
                location.pathname === '/portal' && "bg-white/10 font-medium"
              )}
            >
              <Home size={20} />
              <span>Portal Selection</span>
            </Link>
          </div>
          
          {/* Homeowner Portal Links - Shown only when in homeowner portal */}
          {isHomeownerPortal && (
            <div className="mb-2 pb-2 border-b border-white/10">
              <p className="px-3 py-1 text-white/60 text-xs uppercase">Homeowner Portal</p>
              {homeownerPortalItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10",
                    location.pathname === item.path && "bg-white/10 font-medium"
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
          
          {/* Board Portal Links - Shown only when in board portal */}
          {isBoardPortal && (
            <div className="mb-2 pb-2 border-b border-white/10">
              <p className="px-3 py-1 text-white/60 text-xs uppercase">Board Portal</p>
              {boardPortalItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10",
                    location.pathname === item.path && "bg-white/10 font-medium"
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Portal Quick Links */}
          <SidebarNavItem
            name="Homeowner Portal"
            path="/portal/homeowner"
            icon={Home}
            isOpen={activeSection === 'homeowner-portal'}
            toggleSection={() => toggleSection('homeowner-portal')}
            isActive={location.pathname === '/portal/homeowner'}
          />
          
          <SidebarNavItem
            name="Board Portal"
            path="/portal/board"
            icon={Building}
            isOpen={activeSection === 'board-portal'}
            toggleSection={() => toggleSection('board-portal')}
            isActive={location.pathname === '/portal/board'}
          />
          
          <SidebarNavItem
            name="Vendor Portal"
            path="/portal/vendor"
            icon={Truck}
            isOpen={activeSection === 'vendor-portal'}
            toggleSection={() => toggleSection('vendor-portal')}
            isActive={location.pathname === '/portal/vendor'}
          />

          {/* Main Navigation */}
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
