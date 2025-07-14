
import React, { useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useAdminAccess } from '@/hooks/dashboard/useAdminAccess';
import { useDashboardRoleContent } from '@/hooks/dashboard/useDashboardRoleContent';
import { useResponsive } from '@/hooks/use-responsive';
import { useAIIssues } from '@/hooks/dashboard/useAIIssues';
import { useNavigate } from 'react-router-dom';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatsSection from '@/components/dashboard/DashboardStats';
import { AIAnalysisSection } from '@/components/dashboard/AIAnalysisSection';
import QuickActionWidgets from '@/components/dashboard/QuickActionWidgets';
import CalendarTab from '@/components/dashboard/CalendarTab';

const Dashboard = () => {
  const { currentAssociation, user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Call ALL hooks at the top, before any conditional logic
  const { stats, recentActivity, isLoading: dataLoading, error } = useDashboardData(currentAssociation?.id);
  const { isTablet, isMobile } = useResponsive();
  const { issues, loading: issuesLoading } = useAIIssues();
  
  // Call the useAdminAccess hook here - ensure it's not causing rerenders
  useAdminAccess(user?.id);
  
  // Call useDashboardRoleContent hook here, before any conditional returns
  const { getContentForRole, getActivityContent, getMessagesContent } = useDashboardRoleContent(
    profile,
    recentActivity,
    dataLoading,
    error ? new Error(error) : null
  );
  
  console.log('Dashboard rendering, auth state:', { 
    isAuthenticated: isAuthenticated ? 'yes' : 'no',
    user: user ? 'logged in' : 'not logged in', 
    profile: profile ? 'profile loaded' : 'no profile',
    loading: loading ? 'auth loading' : 'auth loaded',
    currentPath: window.location.pathname
  });
  
  useEffect(() => {
    // Only redirect if we've confirmed the user isn't authenticated
    if (!loading && !isAuthenticated) {
      console.log('No user detected in Dashboard, redirecting to auth');
      navigate('/auth?tab=login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Memoize the main content structure to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => {
    return (
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
        <DashboardHeader 
          associationName={currentAssociation?.name} 
        />

        <DashboardStatsSection 
          stats={stats} 
          associationName={currentAssociation?.name} 
          loading={dataLoading} 
        />
        
        <QuickActionWidgets />
        
        {/* AI Analysis Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <AIAnalysisSection issues={issues} />
        </div>

        {/* Community Intelligence AI */}
        <AiQueryInput />
        
        {profile?.role === 'treasurer' ? (
          getContentForRole()
        ) : (
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList className={isMobile ? 'w-full' : ''}>
              <TabsTrigger value="calendar" className={isMobile ? 'flex-1' : ''}>Calendar</TabsTrigger>
              <TabsTrigger value="activity" className={isMobile ? 'flex-1' : ''}>Recent Activity</TabsTrigger>
              <TabsTrigger value="messages" className={isMobile ? 'flex-1' : ''}>Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="space-y-4">
              <CalendarTab />
            </TabsContent>
            
            <TabsContent value="activity">
              {getActivityContent()}
            </TabsContent>
            
            <TabsContent value="messages">
              {getMessagesContent()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  }, [
    isMobile, 
    currentAssociation?.name, 
    stats, 
    dataLoading, 
    issues, 
    profile?.role, 
    getContentForRole, 
    getActivityContent, 
    getMessagesContent
  ]);
  
  // Now handle conditional rendering AFTER all hooks are called
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {dashboardContent}
    </AppLayout>
  );
};

export default Dashboard;
