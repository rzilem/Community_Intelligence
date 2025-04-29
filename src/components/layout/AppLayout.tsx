
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import Sidebar from './Sidebar';
import Header from './Header';
import { getFilteredNavItems } from './navigation-utils';
import { AppLayoutProps } from './types';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const { user, profile, signOut, userRole, isAuthenticated } = useAuth();

  console.log('AppLayout rendering, auth state:', { 
    isAuthenticated: isAuthenticated ? 'yes' : 'no',
    user: user ? 'logged in' : 'not logged in', 
    profile: profile ? 'profile loaded' : 'no profile',
    currentPath: location.pathname
  });

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useRealTimeNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const mainNavItems = getFilteredNavItems(userRole);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar 
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
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
