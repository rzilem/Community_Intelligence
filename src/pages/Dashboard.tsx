import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useAdminAccess } from '@/hooks/dashboard/useAdminAccess';
import { useDashboardRoleContent } from '@/hooks/dashboard/useDashboardRoleContent';
import { useIsMobile } from '@/hooks/use-mobile';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatsSection from '@/components/dashboard/DashboardStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import MessagesFeed from '@/components/dashboard/MessagesFeed';
import CalendarTab from '@/components/dashboard/CalendarTab';

const Dashboard = () => {
  const { currentAssociation, user } = useAuth();
  const { stats, recentActivity, loading, error } = useDashboardData(currentAssociation?.id);
  const isMobile = useIsMobile();
  
  useAdminAccess(user?.id);
  const { getContentForRole, getActivityContent, getMessagesContent } = useDashboardRoleContent(
    user,
    recentActivity,
    loading,
    error
  );

  return (
    <AppLayout>
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

        <AiQueryInput />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
