
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Users, CreditCard, Settings, LogOut, Menu } from 'lucide-react';

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  mainNavItems: any[];
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

  if (isMobile && !isSidebarOpen) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isMobile ? "w-full" : "w-64",
        isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Community Intelligence</span>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)] py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Menu</h2>
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/dashboard"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-gray-100"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/homeowners"
              className={cn(
                "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/homeowners"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-gray-100"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Homeowners
            </Link>
            <Link
              to="/user/profile"
              className={cn(
                "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/user/profile"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-gray-100"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
