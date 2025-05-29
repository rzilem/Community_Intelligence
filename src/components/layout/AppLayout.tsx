
import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useResponsive } from '@/hooks/use-responsive';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../ErrorBoundary';
import { ErrorFallback } from '../ui/error-fallback';
import { getFilteredNavItems } from './navigation-utils';

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, profile } = useAuth();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const mainNavItems = getFilteredNavItems(profile?.role);

  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary fallback={<ErrorFallback title="Navigation Error" description="There was an error loading the navigation. Please refresh the page." />}>
        <Header 
          isMobile={isMobile}
          user={user}
          profile={profile}
          toggleSidebar={toggleSidebar}
          handleSignOut={handleSignOut}
        />
      </ErrorBoundary>
      
      <div className="flex">
        <ErrorBoundary fallback={<ErrorFallback title="Sidebar Error" description="There was an error loading the sidebar menu." />}>
          <Sidebar 
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            closeSidebar={closeSidebar}
            mainNavItems={mainNavItems}
            handleSignOut={handleSignOut}
          />
        </ErrorBoundary>
        
        <main className="flex-1 ml-64 min-h-screen bg-background">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
