
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useAdminAccess } from '@/hooks/dashboard/useAdminAccess';

// Import the new components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatsSection from '@/components/dashboard/DashboardStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import MessagesFeed from '@/components/dashboard/MessagesFeed';
import CalendarTab from '@/components/dashboard/CalendarTab';

const Dashboard = () => {
  const { currentAssociation, user } = useAuth();
  const { stats, recentActivity, loading, error } = useDashboardData(currentAssociation?.id);
  
  // Use the custom hook for admin access
  useAdminAccess(user?.id);

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Dashboard header */}
        <DashboardHeader 
          associationName={currentAssociation?.name} 
          notificationCount={stats?.notificationCount || 0}
        />

        {/* Stats section */}
        <DashboardStatsSection 
          stats={stats} 
          associationName={currentAssociation?.name} 
          loading={loading} 
        />

        {/* Tabs section */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <CalendarTab />
          </TabsContent>
          
          <TabsContent value="activity">
            <ActivityFeed 
              recentActivity={recentActivity} 
              loading={loading}
              error={error} 
            />
          </TabsContent>
          
          <TabsContent value="messages">
            <MessagesFeed />
          </TabsContent>
        </Tabs>

        <AiQueryInput />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
