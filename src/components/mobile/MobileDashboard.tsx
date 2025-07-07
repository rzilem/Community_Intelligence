import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';

interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  assignee?: string;
  location?: string;
}

const MobileDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMetrics([
        {
          id: '1',
          title: 'Collections Rate',
          value: '94.2%',
          change: 2.4,
          changeType: 'increase',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          id: '2',
          title: 'Active Requests',
          value: '23',
          change: -5,
          changeType: 'decrease',
          icon: Wrench,
          color: 'text-blue-600'
        },
        {
          id: '3',
          title: 'Occupancy Rate',
          value: '96.8%',
          change: 1.2,
          changeType: 'increase',
          icon: Users,
          color: 'text-purple-600'
        },
        {
          id: '4',
          title: 'Critical Issues',
          value: '2',
          change: -3,
          changeType: 'decrease',
          icon: AlertTriangle,
          color: 'text-red-600'
        }
      ]);

      setTasks([
        {
          id: '1',
          title: 'HVAC Inspection - Building A',
          status: 'pending',
          priority: 'high',
          dueDate: 'Today',
          assignee: 'Mike Johnson',
          location: 'Building A'
        },
        {
          id: '2',
          title: 'Pool Maintenance',
          status: 'in-progress',
          priority: 'medium',
          dueDate: 'Tomorrow',
          assignee: 'Sarah Wilson',
          location: 'Community Pool'
        },
        {
          id: '3',
          title: 'Elevator Safety Check',
          status: 'pending',
          priority: 'critical',
          dueDate: 'Today',
          assignee: 'Tom Davis',
          location: 'Building B'
        },
        {
          id: '4',
          title: 'Landscaping Review',
          status: 'completed',
          priority: 'low',
          dueDate: 'Yesterday',
          assignee: 'Lisa Brown',
          location: 'Common Areas'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Activity;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-40 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Reports
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map(metric => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${metric.color}`} />
                    <div className="text-2xl font-bold">{metric.value}</div>
                  </div>
                  <div className={`flex items-center text-sm ${
                    metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{metric.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Wrench className="h-6 w-6 mb-2" />
              <span className="text-sm">New Request</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <MapPin className="h-6 w-6 mb-2" />
              <span className="text-sm">Check-in</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Residents</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Zap className="h-6 w-6 mb-2" />
              <span className="text-sm">Emergency</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Today's Tasks
            <Badge variant="secondary">{tasks.filter(t => t.dueDate === 'Today').length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => {
              const StatusIcon = getStatusIcon(task.status);
              return (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <StatusIcon className={`h-5 w-5 ${
                    task.status === 'completed' ? 'text-green-600' : 
                    task.status === 'in-progress' ? 'text-blue-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{task.dueDate}</span>
                      {task.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {task.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)} variant="secondary">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" className="w-full mt-3">
            View All Tasks
          </Button>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Goals</span>
              <span>78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Response Time</span>
              <span>92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Resident Satisfaction</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {tasks.filter(t => t.priority === 'critical').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.filter(t => t.priority === 'critical').map(task => (
                <div key={task.id} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="font-medium text-red-800">{task.title}</div>
                  <div className="text-sm text-red-600 mt-1">
                    Due: {task.dueDate} • {task.location}
                  </div>
                  <Button size="sm" variant="destructive" className="mt-2">
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileDashboard;