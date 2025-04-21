
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, FileText, CreditCard, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';

const VendorDashboard = () => {
  const { user, profile } = useAuth();
  
  const quickLinks = [
    { title: 'View Bids', path: '/portal/vendor/bids', icon: <FileText className="h-5 w-5" />, color: 'bg-blue-100' },
    { title: 'Invoices', path: '/portal/vendor/invoices', icon: <CreditCard className="h-5 w-5" />, color: 'bg-green-100' },
    { title: 'Vendor Status', path: '/portal/vendor/status', icon: <Star className="h-5 w-5" />, color: 'bg-purple-100' },
  ];

  return (
    <AppLayout>
      <div className="container p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendor Portal</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.name || user?.email || 'Vendor'}
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
            <div className="border rounded-lg p-4 mb-6">
              <h2 className="font-semibold mb-4 text-lg">Vendor Navigation</h2>
              <nav className="space-y-2">
                <Link
                  to="/portal/vendor"
                  className="flex items-center gap-2 p-2 rounded-md bg-gray-100 font-medium"
                >
                  <Truck className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/portal/vendor/bids"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <span>Bids & Opportunities</span>
                </Link>
                <Link
                  to="/portal/vendor/invoices"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Invoices & Payments</span>
                </Link>
                <Link
                  to="/portal/vendor/status"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Star className="h-5 w-5" />
                  <span>Vendor Status</span>
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <CardTitle>Upcoming Bid Opportunities</CardTitle>
                <CardDescription>New projects available for bidding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-medium">Pool Resurfacing Project</p>
                      <p className="text-sm text-muted-foreground">Bid Due: October 25, 2023</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-medium">Community Landscaping Contract</p>
                      <p className="text-sm text-muted-foreground">Bid Due: November 5, 2023</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Clubhouse Renovation Project</p>
                      <p className="text-sm text-muted-foreground">Bid Due: November 15, 2023</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ask Community Intelligence</CardTitle>
                <CardDescription>Get instant answers about your vendor account</CardDescription>
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

export default VendorDashboard;
