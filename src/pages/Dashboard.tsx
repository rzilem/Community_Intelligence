
import React, { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useAdminAccess } from '@/hooks/dashboard/useAdminAccess';
import { useDashboardRoleContent } from '@/hooks/dashboard/useDashboardRoleContent';
import { useResponsive } from '@/hooks/use-responsive';
import { useAIIssues } from '@/hooks/dashboard/useAIIssues';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ui/error-fallback';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatsSection from '@/components/dashboard/DashboardStats';
import { AIAnalysisSection } from '@/components/dashboard/AIAnalysisSection';
import QuickActionWidgets from '@/components/dashboard/QuickActionWidgets';
import CalendarTab from '@/components/dashboard/CalendarTab';

const Dashboard = () => {
  const { currentAssociation, user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { stats, recentActivity, loading: dataLoading, error } = useDashboardData(currentAssociation?.id);
  const { isTablet, isMobile } = useResponsive();
  const { issues, loading: issuesLoading } = useAIIssues();
  
  console.log('Dashboard rendering, auth state:', { 
    isAuthenticated: isAuthenticated ? 'yes' : 'no',
    user: user ? 'logged in' : 'not logged in', 
    profile: profile ? 'profile loaded' : 'no profile',
    loading: loading ? 'auth loading' : 'auth loaded',
    currentPath: window.location.pathname
  });
  
  // Call the useAdminAccess hook here - ensure it's not causing rerenders
  useAdminAccess(user?.id);
  
  useEffect(() => {
    // Only redirect if we've confirmed the user isn't authenticated
    if (!loading && !isAuthenticated) {
      console.log('No user detected in Dashboard, redirecting to auth');
      navigate('/auth?tab=login');
    }
  }, [isAuthenticated, loading, navigate]);
  
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
    return null; // Will be redirected by useEffect
  }
  
  // Use the profile from auth context
  const userProfile = profile;
  
  const { getContentForRole, getActivityContent, getMessagesContent } = useDashboardRoleContent(
    userProfile,
    recentActivity,
    dataLoading,
    error
  );

  // Memoize the main content structure to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => {
    return (
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
        <ErrorBoundary fallback={<ErrorFallback title="Header Error" />}>
          <DashboardHeader 
            associationName={currentAssociation?.name} 
          />
        </ErrorBoundary>

        <ErrorBoundary fallback={<ErrorFallback title="Stats Error" />}>
          <DashboardStatsSection 
            stats={stats} 
            associationName={currentAssociation?.name} 
            loading={dataLoading} 
          />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<ErrorFallback title="Quick Actions Error" />}>
          <QuickActionWidgets />
        </ErrorBoundary>
        
        {/* AI Analysis Section */}
        <ErrorBoundary fallback={<ErrorFallback title="AI Analysis Error" />}>
          <div className="bg-blue-50 rounded-lg p-6">
            <AIAnalysisSection issues={issues} />
          </div>
        </ErrorBoundary>

        {/* Community Intelligence AI */}
        <ErrorBoundary fallback={<ErrorFallback title="AI Query Error" />}>
          <AiQueryInput />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<ErrorFallback title="Dashboard Content Error" />}>
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
                <ErrorBoundary fallback={<ErrorFallback title="Calendar Error" />}>
                  <CalendarTab />
                </ErrorBoundary>
              </TabsContent>
              
              <TabsContent value="activity">
                <ErrorBoundary fallback={<ErrorFallback title="Activity Feed Error" />}>
                  {getActivityContent()}
                </ErrorBoundary>
              </TabsContent>
              
              <TabsContent value="messages">
                <ErrorBoundary fallback={<ErrorFallback title="Messages Error" />}>
                  {getMessagesContent()}
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          )}
        </ErrorBoundary>
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

  return dashboardContent;
};

export default Dashboard;
