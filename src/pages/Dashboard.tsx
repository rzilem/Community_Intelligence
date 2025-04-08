
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/calendar/CalendarView';
import { StatCard } from '@/components/dashboard/StatCard';
import { Building, Calendar, DollarSign, MessageSquare, Plus, Shield, Users2 } from 'lucide-react';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import TooltipButton from '@/components/ui/tooltip-button';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening across your communities today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipButton 
              variant="outline" 
              tooltip="Create a new HOA"
            >
              <Plus className="h-4 w-4 mr-2" />
              New HOA
            </TooltipButton>
            <TooltipButton
              tooltip="View all notifications"
            >
              View All <Badge>12</Badge>
            </TooltipButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard 
            title="Total Properties" 
            value={245} 
            icon={Building}
            description="Across 5 HOA communities"
            trend={{ value: 12, isPositive: true }} 
          />
          <StatCard 
            title="Active Residents" 
            value={612} 
            icon={Users2}
            description="87% engagement rate" 
          />
          <StatCard 
            title="Assessment Collection" 
            value="$43,250" 
            icon={DollarSign}
            description="92% collected this month"
            trend={{ value: 3, isPositive: true }} 
          />
          <StatCard 
            title="Open Compliance Issues" 
            value={18} 
            icon={Shield}
            description="Down from 27 last month"
            trend={{ value: 33, isPositive: true }} 
          />
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-4">
            <CalendarView />
          </TabsContent>
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  See the latest actions across your HOAs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">New compliance issue reported</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-muted-foreground">Oakridge Estates</span>
                          <span>•</span>
                          <span className="text-muted-foreground">2 hours ago</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">Resident reported improper trash disposal at property #45</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Community-wide announcements and communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">Annual Meeting Reminder</h4>
                        <Badge>New</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        The annual HOA meeting will be held on June 15th at 7PM in the community center. All residents are encouraged to attend.
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sent to: All Residents</span>
                        <span>Posted: 1 day ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AiQueryInput />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
