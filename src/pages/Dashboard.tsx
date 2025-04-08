
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
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

const Dashboard = () => {
  const { currentAssociation } = useAuth();
  const { stats, recentActivity, loading, error } = useDashboardData(currentAssociation?.id);

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening{currentAssociation ? ` in ${currentAssociation.name}` : ' across your communities'} today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipButton 
              variant="outline" 
              tooltip="Create a new HOA"
              asChild
            >
              <Link to="/system/associations">
                <Plus className="h-4 w-4 mr-2" />
                New HOA
              </Link>
            </TooltipButton>
            <TooltipButton
              tooltip="View all notifications"
            >
              View All <Badge>{stats?.notificationCount || 0}</Badge>
            </TooltipButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard 
            title="Total Properties" 
            value={stats?.propertyCount || 0} 
            icon={Building}
            description={currentAssociation ? `In ${currentAssociation.name}` : "Across all communities"}
            loading={loading}
          />
          <StatCard 
            title="Active Residents" 
            value={stats?.residentCount || 0} 
            icon={Users2}
            description="Currently registered"
            loading={loading}
          />
          <StatCard 
            title="Assessment Collection" 
            value={stats?.assessmentAmount ? `$${stats.assessmentAmount}` : "$0"} 
            icon={DollarSign}
            description={stats?.collectionRate ? `${stats.collectionRate}% collected this month` : "No data available"}
            trend={stats?.collectionTrend ? { value: stats.collectionTrend, isPositive: stats.collectionTrend > 0 } : undefined}
            loading={loading}
          />
          <StatCard 
            title="Open Compliance Issues" 
            value={stats?.complianceCount || 0} 
            icon={Shield}
            description={stats?.complianceDelta ? `${stats.complianceDelta > 0 ? 'Up' : 'Down'} from last month` : "No previous data"}
            trend={stats?.complianceTrend ? { value: Math.abs(stats.complianceTrend), isPositive: stats.complianceTrend < 0 } : undefined}
            loading={loading}
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
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 items-start animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-muted"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Unable to load activity data
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-6">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {activity.icon || <Shield className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <div className="flex gap-2 text-sm">
                            <span className="text-muted-foreground">{activity.association}</span>
                            <span>•</span>
                            <span className="text-muted-foreground">{activity.timeAgo}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity to display
                  </div>
                )}
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
