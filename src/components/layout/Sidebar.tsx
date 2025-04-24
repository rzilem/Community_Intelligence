
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SidebarNavItem from './SidebarNavItem';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  mainNavItems: any[];
  handleSignOut: () => void;
}

const Sidebar = ({
  isMobile,
  isSidebarOpen,
  closeSidebar,
  mainNavItems,
  handleSignOut
}: SidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card shadow-lg transition-transform duration-300 ease-in-out transform",
          isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <h1 className="font-display font-bold text-xl text-primary">
              Community Intelligence
            </h1>
          </div>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={closeSidebar}
            >
              <X size={20} />
              <span className="sr-only">Close Sidebar</span>
            </Button>
          )}
        </div>
        
        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-3">
            <nav className="space-y-1">
              {mainNavItems.map((item, index) => (
                <SidebarNavItem
                  key={`nav-item-${index}`}
                  {...item}
                  onClick={isMobile ? closeSidebar : undefined}
                />
              ))}
            </nav>

            <div className="pt-6 mt-6 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground" 
                onClick={handleSignOut}
              >
                <span>Log out</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
