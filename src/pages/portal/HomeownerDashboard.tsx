
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, FileText, Calendar, Users, File, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';

const HomeownerDashboard = () => {
  const { user, profile } = useAuth();
  
  const quickLinks = [
    { title: 'Make a Payment', path: '/portal/homeowner/payments', icon: <CreditCard className="h-5 w-5" />, color: 'bg-blue-100' },
    { title: 'Submit a Request', path: '/portal/homeowner/requests', icon: <FileText className="h-5 w-5" />, color: 'bg-green-100' },
    { title: 'Calendar', path: '/portal/homeowner/calendar', icon: <Calendar className="h-5 w-5" />, color: 'bg-purple-100' },
    { title: 'View Documents', path: '/portal/homeowner/documents', icon: <File className="h-5 w-5" />, color: 'bg-amber-100' },
  ];

  return (
    <AppLayout>
      <div className="container p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Homeowner Portal</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.name || user?.email || 'Homeowner'}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ExternalLink className="h-4 w-4 mr-2" />
              Community Intelligence
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="homeowner" />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Card key={link.path} className="hover:shadow-md transition-shadow">
                  <Link to={link.path}>
                    <CardHeader className="p-4">
                      <div className={`w-10 h-10 rounded-full ${link.color} flex items-center justify-center mb-2`}>
                        {link.icon}
                      </div>
                      <CardTitle className="text-base">{link.title}</CardTitle>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Community Updates</CardTitle>
                <CardDescription>Latest announcements and news</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">Annual Meeting Scheduled</p>
                    <p className="text-sm text-muted-foreground">October 15, 2023 at 7:00 PM in the Community Center</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">Pool Closing for Season</p>
                    <p className="text-sm text-muted-foreground">The community pool will close for the season on September 30</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ask Community Intelligence</CardTitle>
                <CardDescription>Get instant answers about your community</CardDescription>
              </CardHeader>
              <CardContent>
                <AiQueryInput />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeownerDashboard;
