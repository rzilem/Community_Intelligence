
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

  // Log dashboard load for debugging
  React.useEffect(() => {
    console.log('📊 Dashboard: Component loaded with profile:', profile?.role);
    console.log('📊 Dashboard: Current association:', currentAssociation?.name);
  }, [profile, currentAssociation]);

  // Show treasurer-specific dashboard for treasurers
  if (profile?.role === 'treasurer') {
    return <TreasurerDashboard />;
  }

  // Mock data for components that require props
  const mockActivityData = [];
  const mockAIIssues = [];

  return (
    <div className="space-y-6 min-h-screen">
      <DashboardHeader associationName={currentAssociation?.name} />
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Messages
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                AI Insights
              </TabsTrigger>
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
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-gray-800">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Requests</span>
                  <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Payments</span>
                  <span className="font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upcoming Events</span>
                  <span className="font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">3</span>
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
