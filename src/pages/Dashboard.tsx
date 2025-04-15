
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useAdminAccess } from '@/hooks/dashboard/useAdminAccess';
import { useDashboardRoleContent } from '@/hooks/dashboard/useDashboardRoleContent';
import { useResponsive } from '@/hooks/use-responsive';
import { useAIIssues } from '@/hooks/dashboard/useAIIssues';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatsSection from '@/components/dashboard/DashboardStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import MessagesFeed from '@/components/dashboard/MessagesFeed';
import CalendarTab from '@/components/dashboard/CalendarTab';
import QuickActionWidgets from '@/components/dashboard/QuickActionWidgets';
import { AIAnalysisSection } from '@/components/dashboard/AIAnalysisSection';
import { Profile } from '@/types/profile-types';

const Dashboard = () => {
  const { currentAssociation, user } = useAuth();
  const { stats, recentActivity, loading, error } = useDashboardData(currentAssociation?.id);
  const { isTablet, isMobile } = useResponsive();
  const { issues, loading: issuesLoading } = useAIIssues();
  
  useAdminAccess(user?.id);
  
  // Convert user to Profile type if needed
  const userProfile: Profile | undefined = user ? {
    ...user,
    role: user.role || 'user', // Ensure role is always defined
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString()
  } as Profile : undefined;
  
  const { getContentForRole, getActivityContent, getMessagesContent } = useDashboardRoleContent(
    userProfile,
    recentActivity,
    loading,
    error
  );

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
      <DashboardHeader 
        associationName={currentAssociation?.name} 
        notificationCount={stats?.notificationCount || 0}
      />

      <DashboardStatsSection 
        stats={stats} 
        associationName={currentAssociation?.name} 
        loading={loading} 
      />
      
      <QuickActionWidgets />
      
      {/* AI Analysis Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <AIAnalysisSection issues={issues} />
      </div>

      {/* Community Intelligence AI */}
      <AiQueryInput />
      
      {user?.role === 'treasurer' ? (
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
};

export default Dashboard;
