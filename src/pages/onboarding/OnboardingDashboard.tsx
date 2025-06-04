
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserPlus, CheckCircle, Clock, AlertTriangle, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const OnboardingDashboard: React.FC = () => {
  const mockOnboardingItems = [
    {
      id: 1,
      type: 'New Resident',
      name: 'Sarah Johnson',
      property: '123 Main St, Unit 4B',
      stage: 'Document Collection',
      progress: 60,
      status: 'in_progress',
      dueDate: '2024-01-15',
      tasksCompleted: 3,
      totalTasks: 5
    },
    {
      id: 2,
      type: 'Property Transfer',
      name: 'Michael Chen',
      property: '456 Oak Ave',
      stage: 'HOA Approval',
      progress: 85,
      status: 'pending_approval',
      dueDate: '2024-01-10',
      tasksCompleted: 4,
      totalTasks: 5
    },
    {
      id: 3,
      type: 'New Resident',
      name: 'Emily Rodriguez',
      property: '789 Pine St, Unit 2A',
      stage: 'Welcome Package',
      progress: 20,
      status: 'just_started',
      dueDate: '2024-01-20',
      tasksCompleted: 1,
      totalTasks: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending_approval': return 'bg-yellow-500';
      case 'just_started': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending_approval': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <PageTemplate
      title="Onboarding Dashboard"
      icon={<UserPlus className="h-8 w-8" />}
      description="Manage new resident and property transfer onboarding processes"
      actions={
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          New Onboarding
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Onboardings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Onboarding Items */}
        <Card>
          <CardHeader>
            <CardTitle>Active Onboarding Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOnboardingItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.property}</p>
                      <p className="text-sm">Current Stage: <span className="font-medium">{item.stage}</span></p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(item.status)} text-white`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Due: {item.dueDate}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress ({item.tasksCompleted}/{item.totalTasks} tasks)</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm">Update Progress</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default OnboardingDashboard;
