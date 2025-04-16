
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Header from './Header';
import { getFilteredNavItems } from './navigation-utils';
import { AppLayoutProps } from './types';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const { user, profile, signOut, userRole } = useAuth();

  console.log('AppLayout rendering, user:', user ? 'logged in' : 'not logged in');

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSignOut = async () => {
    await signOut();
  };

  const mainNavItems = getFilteredNavItems(userRole);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar 
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        mainNavItems={mainNavItems}
        handleSignOut={handleSignOut}
      />

      <div 
        className={cn(
          "flex flex-col w-full transition-all duration-300 ease-in-out",
          !isMobile && isSidebarOpen ? "md:ml-64" : ""
        )}
      >
        <Header 
          isMobile={isMobile}
          user={user}
          profile={profile}
          toggleSidebar={toggleSidebar}
          handleSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
