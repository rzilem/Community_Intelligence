
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import Sidebar from './Sidebar';
import AppLayoutHeader from './AppLayoutHeader';
import AppLayoutContent from './AppLayoutContent';
import { getFilteredNavItems } from './navigation-utils';
import { AppLayoutProps } from './types';
import { useAppLayoutState } from './hooks/useAppLayoutState';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile, signOut, userRole, isAuthenticated } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isSidebarOpen, toggleSidebar, setIsSidebarOpen } = useAppLayoutState(isMobile);

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
  }, [location.pathname, isMobile, setIsSidebarOpen]);

  // Initialize real-time notifications
  useRealTimeNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const mainNavItems = getFilteredNavItems(userRole);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar 
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        mainNavItems={mainNavItems}
        handleSignOut={handleSignOut}
      />

      <AppLayoutContent 
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
      >
        <AppLayoutHeader 
          user={user}
          profile={profile}
          toggleSidebar={toggleSidebar}
          handleSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </AppLayoutContent>
    </div>
  );
};

export default AppLayout;
