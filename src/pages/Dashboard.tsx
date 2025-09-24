import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, DollarSign, Wrench, AlertCircle, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalResidents: 0,
    openMaintenance: 0,
    overdueAmount: 0,
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // For now, use placeholder data until HOA context is set up
      // In production, this would call the hoa-operations edge function
      setStats({
        totalProperties: 42,
        totalResidents: 156,
        openMaintenance: 7,
        overdueAmount: 4250.00,
        upcomingEvents: [
          { id: 1, title: 'Board Meeting', date: '2025-10-01' },
          { id: 2, title: 'Pool Maintenance', date: '2025-09-28' }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Properties', value: stats.totalProperties, icon: Home, color: 'text-blue-500' },
    { title: 'Residents', value: stats.totalResidents, icon: Users, color: 'text-green-500' },
    { title: 'Open Maintenance', value: stats.openMaintenance, icon: Wrench, color: 'text-orange-500' },
    { title: 'Overdue Amount', value: `$${stats.overdueAmount.toFixed(2)}`, icon: DollarSign, color: 'text-red-500' }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Community Intelligence</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Assistant */}
          <div className="lg:col-span-2">
            <AiQueryInput />
          </div>

          {/* Quick Actions & Events */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="mr-2 h-4 w-4" />
                  Submit Maintenance Request
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Amenity
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pay Assessment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Management
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.upcomingEvents.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.upcomingEvents.map(event => (
                      <li key={event.id} className="text-sm">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-muted-foreground block">{event.date}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}