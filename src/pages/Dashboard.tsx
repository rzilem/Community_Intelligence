
import React from 'react';
import { useAuth } from '@/contexts/auth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActionWidgets from '@/components/dashboard/QuickActionWidgets';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AIAnalysisSection } from '@/components/dashboard/AIAnalysisSection';
import CalendarTab from '@/components/dashboard/CalendarTab';
import { MessagesFeed } from '@/components/dashboard/MessagesFeed';
import TreasurerDashboard from '@/components/dashboard/TreasurerDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const { profile, currentAssociation } = useAuth();

  // Show treasurer-specific dashboard for treasurers
  if (profile?.role === 'treasurer') {
    return <TreasurerDashboard />;
  }

  // Mock data for components that require props
  const mockActivityData = [];
  const mockAIIssues = [];

  return (
    <div className="space-y-6">
      <DashboardHeader associationName={currentAssociation?.name} />
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <QuickActionWidgets />
              <ActivityFeed 
                recentActivity={mockActivityData} 
                loading={false} 
                error={null} 
              />
            </TabsContent>
            
            <TabsContent value="calendar">
              <CalendarTab />
            </TabsContent>
            
            <TabsContent value="messages">
              <MessagesFeed />
            </TabsContent>
            
            <TabsContent value="ai-insights">
              <AIAnalysisSection issues={mockAIIssues} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active Requests</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Upcoming Events</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
