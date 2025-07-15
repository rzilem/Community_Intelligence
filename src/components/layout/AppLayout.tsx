
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { getFilteredNavItems } from './navigation-utils';
import { AppLayoutProps } from './types';
import GlobalSearch from '../global/GlobalSearch';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initialize from localStorage for desktop, default to closed on mobile
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : !isMobile;
    }
    return !isMobile;
  });
  const { user, profile, signOut, userRole, isAuthenticated } = useAuth();

  console.log('AppLayout rendering, auth state:', { 
    isAuthenticated: isAuthenticated ? 'yes' : 'no',
    user: user ? 'logged in' : 'not logged in', 
    profile: profile ? 'profile loaded' : 'no profile',
    currentPath: location.pathname
  });

  // Handle mobile sidebar closure on route change
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Update sidebar state when mobile status changes
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Memoize nav items to prevent unnecessary re-renders
  const mainNavItems = useMemo(() => {
    return getFilteredNavItems(userRole as any);
  }, [userRole]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      // Persist to localStorage for desktop
      if (!isMobile) {
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      }
      return newState;
    });
  };

  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar 
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
          toggleSidebar={toggleSidebar}
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
        <GlobalSearch />
      </div>
    </ThemeProvider>
  );
};

export default AppLayout;
