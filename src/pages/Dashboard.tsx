
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile, userRole } = useAuth();

  const getWelcomeMessage = () => {
    const firstName = profile?.first_name || 'User';
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 18 ? 'afternoon' : 'evening';
    return `Good ${timeOfDay}, ${firstName}!`;
  };

  const quickActions = [
    {
      title: 'Submit Work Order',
      description: 'Report maintenance issues',
      icon: Settings,
      href: '/community-management/work-orders/new',
      color: 'bg-blue-500',
      roles: ['admin', 'manager', 'resident']
    },
    {
      title: 'Book Amenity',
      description: 'Reserve community amenities',
      icon: Calendar,
      href: '/amenities/book',
      color: 'bg-green-500',
      roles: ['admin', 'manager', 'resident']
    },
    {
      title: 'View Documents',
      description: 'Access community documents',
      icon: FileText,
      href: '/documents',
      color: 'bg-purple-500',
      roles: ['admin', 'manager', 'resident']
    },
    {
      title: 'Manage Residents',
      description: 'View and manage residents',
      icon: Users,
      href: '/residents',
      color: 'bg-orange-500',
      roles: ['admin', 'manager']
    },
    {
      title: 'Financial Reports',
      description: 'View financial data',
      icon: DollarSign,
      href: '/financial/reports',
      color: 'bg-red-500',
      roles: ['admin', 'manager', 'accountant']
    },
    {
      title: 'Create Bid Request',
      description: 'Request vendor proposals',
      icon: FileText,
      href: '/community-management/bid-requests/new',
      color: 'bg-indigo-500',
      roles: ['admin', 'manager']
    }
  ];

  const filteredActions = quickActions.filter(action => 
    action.roles.includes(userRole || 'resident')
  );

  const stats = [
    {
      title: 'Open Work Orders',
      value: '12',
      change: '+2 from last week',
      icon: AlertCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Upcoming Events',
      value: '3',
      change: 'This week',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Assessment Status',
      value: 'Current',
      change: 'All payments up to date',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Community Health',
      value: '98%',
      change: '+1% from last month',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to your Community Intelligence dashboard
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <Bell className="w-4 h-4 mr-2" />
            View Notifications
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in your community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'Pool maintenance completed',
                  time: '2 hours ago',
                  type: 'maintenance'
                },
                {
                  title: 'New resident moved to Unit 204',
                  time: '1 day ago',
                  type: 'resident'
                },
                {
                  title: 'HOA board meeting scheduled',
                  time: '2 days ago',
                  type: 'event'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Announcements</CardTitle>
            <CardDescription>Important updates from management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'Pool closure for maintenance',
                  content: 'The community pool will be closed for routine maintenance from March 15-17.',
                  priority: 'high'
                },
                {
                  title: 'New parking regulations',
                  content: 'Updated parking guidelines are now in effect. Please review the new rules.',
                  priority: 'medium'
                }
              ].map((announcement, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      announcement.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
