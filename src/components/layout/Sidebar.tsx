import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LogOut, X, Home, Building, Truck, CreditCard, FileText, Calendar, Users, File, WrenchIcon, PiggyBank, BarChart, AlertTriangle, CheckSquare, Mail, BookOpen, Video, Sparkles, DollarSign, LayoutDashboard, ScrollText, MessageSquare } from 'lucide-react';
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
  const {
    notifications
  } = useNotificationContext();

  useEffect(() => {
    mainNavItems.forEach(item => {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some(subItem => location.pathname === subItem.path);
        if (isSubmenuActive) {
          setActiveSection(item.path.replace('/', ''));
        }
      }
    });
  }, [location.pathname, mainNavItems]);

  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  const hasActiveSubmenu = (item: NavItemProps) => {
    if (!item.submenu) return false;
    return item.submenu.some(subItem => location.pathname === subItem.path);
  };

  const getNotificationCount = (itemPath: string): number => {
    const section = itemPath.replace('/', '');
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

  // All portal items grouped under portal selection
  const portalItems = [
    {
      name: 'Portal Selection',
      path: '/portal',
      icon: Home
    },
    {
      name: 'Homeowner Portal',
      path: '/portal/homeowner',
      icon: Home
    },
    {
      name: 'Board Portal',
      path: '/portal/board',
      icon: Building
    },
    {
      name: 'Vendor Portal',
      path: '/portal/vendor',
      icon: Truck
    },
    {
      name: 'Resale Portal',
      path: '/resale-portal',
      icon: ScrollText
    }
  ];

  // Check if current path is related to any portal
  const isPortalPath = location.pathname.startsWith('/portal') || location.pathname.startsWith('/resale-portal');

  return <div className={cn("fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out", isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0")}>
      <div className="h-16 py-2.5 px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-lg text-white">Community<br />Intelligence</h1>
        </div>
        {isMobile && <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={closeSidebar}>
            <X size={20} />
          </Button>}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 px-2 space-y-1">
          {/* Portal Navigation Section */}
          <div className="mb-2 pb-2 border-b border-white/10">
            <p className="px-3 py-1 text-white/60 text-xs uppercase">Portals</p>
            {portalItems.map((item, index) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10",
                  location.pathname === item.path && "bg-white/10 font-medium",
                  // Add special styling for Portal Selection as the main item
                  index === 0 ? "font-medium" : "pl-6"
                )}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          {/* Render portal-specific menu if in a portal route */}
          {isPortalPath && location.pathname !== '/portal' && (
            <div className="mb-2 pb-2 border-b border-white/10">
              {location.pathname.startsWith('/portal/homeowner') && (
                <>
                  <p className="px-3 py-1 text-white/60 text-xs uppercase">Homeowner Portal</p>
                  <Link to="/portal/homeowner/payments" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/homeowner/payments' && "bg-white/10 font-medium")}>
                    <CreditCard size={20} />
                    <span>Payments</span>
                  </Link>
                  <Link to="/portal/homeowner/requests" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/homeowner/requests' && "bg-white/10 font-medium")}>
                    <FileText size={20} />
                    <span>Requests</span>
                  </Link>
                  <Link to="/portal/homeowner/calendar" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/homeowner/calendar' && "bg-white/10 font-medium")}>
                    <Calendar size={20} />
                    <span>Calendar & Events</span>
                  </Link>
                  <Link to="/portal/homeowner/directory" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/homeowner/directory' && "bg-white/10 font-medium")}>
                    <Users size={20} />
                    <span>Directory</span>
                  </Link>
                  <Link to="/portal/homeowner/documents" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/homeowner/documents' && "bg-white/10 font-medium")}>
                    <File size={20} />
                    <span>Documents</span>
                  </Link>
                </>
              )}
              
              {location.pathname.startsWith('/portal/board') && (
                <>
                  <p className="px-3 py-1 text-white/60 text-xs uppercase">Board Portal</p>
                  {/* Board portal items */}
                  <Link to="/portal/board/dashboard" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/board/dashboard' && "bg-white/10 font-medium")}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/portal/board/invoices" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/board/invoices' && "bg-white/10 font-medium")}>
                    <CreditCard size={20} />
                    <span>Invoices</span>
                  </Link>
                  <Link to="/portal/board/work-orders" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/board/work-orders' && "bg-white/10 font-medium")}>
                    <WrenchIcon size={20} />
                    <span>Work Orders</span>
                  </Link>
                  <Link to="/portal/board/collections" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/board/collections' && "bg-white/10 font-medium")}>
                    <PiggyBank size={20} />
                    <span>Collections</span>
                  </Link>
                  {/* Add more board portal links as needed */}
                </>
              )}
              
              {location.pathname.startsWith('/portal/vendor') && (
                <>
                  <p className="px-3 py-1 text-white/60 text-xs uppercase">Vendor Portal</p>
                  {/* Vendor portal items */}
                  <Link to="/portal/vendor/bids" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/vendor/bids' && "bg-white/10 font-medium")}>
                    <FileText size={20} />
                    <span>Bids & Opportunities</span>
                  </Link>
                  <Link to="/portal/vendor/invoices" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/portal/vendor/invoices' && "bg-white/10 font-medium")}>
                    <CreditCard size={20} />
                    <span>Invoices & Payments</span>
                  </Link>
                </>
              )}
              
              {location.pathname.startsWith('/resale-portal') && (
                <>
                  <p className="px-3 py-1 text-white/60 text-xs uppercase">Resale Portal</p>
                  {/* Resale portal items */}
                  <Link to="/resale-portal/order" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/resale-portal/order' && "bg-white/10 font-medium")}>
                    <FileText size={20} />
                    <span>Order Documents</span>
                  </Link>
                  <Link to="/resale-portal/my-orders" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/resale-portal/my-orders' && "bg-white/10 font-medium")}>
                    <FileText size={20} />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/resale-portal/settings" className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", location.pathname === '/resale-portal/settings' && "bg-white/10 font-medium")}>
                    <Users size={20} />
                    <span>Account Settings</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Main Navigation Items */}
          {!isPortalPath && mainNavItems.map(item => (
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
        <button onClick={handleSignOut} className="w-full flex items-center gap-2 py-2 px-3 rounded-md text-white/80 hover:bg-white/10">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>;
};

export default Sidebar;
