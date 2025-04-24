
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, FileText, CreditCard, Calendar, Building } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  
  const dashboardCards = [
    {
      title: 'Homeowners',
      description: 'View and manage homeowners',
      icon: <Users className="h-6 w-6" />,
      path: '/homeowners',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Properties',
      description: 'Manage properties and units',
      icon: <Building className="h-6 w-6" />,
      path: '/properties',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Documents',
      description: 'Access important documents',
      icon: <FileText className="h-6 w-6" />,
      path: '/documents',
      color: 'bg-yellow-500/10 text-yellow-500'
    },
    {
      title: 'Payments',
      description: 'View payment history',
      icon: <CreditCard className="h-6 w-6" />,
      path: '/accounting/payments',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      title: 'Calendar',
      description: 'View upcoming events',
      icon: <Calendar className="h-6 w-6" />,
      path: '/calendar',
      color: 'bg-pink-500/10 text-pink-500'
    },
    {
      title: 'Portal',
      description: 'Access resident portal',
      icon: <Home className="h-6 w-6" />,
      path: '/portal',
      color: 'bg-indigo-500/10 text-indigo-500'
    },
  ];
  
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to Community Intelligence</h1>
        
        <p className="text-muted-foreground mb-6">
          Select a module below to get started or use the navigation menu.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Link to={card.path} key={card.title}>
              <Card className="cursor-pointer hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${card.color}`}>
                    {card.icon}
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
