
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Building, Home, Truck, CreditCard, FileText, Calendar, Users, File, WrenchIcon, BarChart, CheckSquare, ScrollText } from 'lucide-react';
import { Button }  from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';

const PortalSelection = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const portals = [
    {
      title: "Homeowner Portal",
      description: "Access your property information, submit requests, and manage payments",
      icon: Home,
      path: "/portal/homeowner",
      color: "bg-blue-500",
      features: [
        { name: "Payments", icon: CreditCard, path: "/portal/homeowner/payments" },
        { name: "Requests", icon: FileText, path: "/portal/homeowner/requests" },
        { name: "Calendar & Events", icon: Calendar, path: "/portal/homeowner/calendar" },
        { name: "Directory", icon: Users, path: "/portal/homeowner/directory" },
        { name: "Documents", icon: File, path: "/portal/homeowner/documents" },
      ]
    },
    {
      title: "Board Member Portal",
      description: "View community financials, manage requests, and access board documents",
      icon: Building,
      path: "/portal/board",
      color: "bg-purple-500",
      features: [
        { name: "Invoices", icon: CreditCard, path: "/portal/board/invoices" },
        { name: "Work Orders", icon: WrenchIcon, path: "/portal/board/work-orders" },
        { name: "Reports", icon: BarChart, path: "/portal/board/reports" },
        { name: "Board Tasks", icon: CheckSquare, path: "/portal/board/tasks" },
      ]
    },
    {
      title: "Vendor Portal",
      description: "Manage your services, view opportunities, and handle invoices",
      icon: Truck,
      path: "/portal/vendor",
      color: "bg-green-500",
      features: [
        { name: "Bids & Opportunities", icon: FileText, path: "/portal/vendor/bids" },
        { name: "Invoices & Payments", icon: CreditCard, path: "/portal/vendor/invoices" },
      ]
    },
    {
      title: "Resale Portal",
      description: "Order, track, and manage resale documents and certificates",
      icon: ScrollText,
      path: "/resale-portal",
      color: "bg-orange-500",
      features: [
        { name: "Order Documents", icon: FileText, path: "/resale-portal/order" },
        { name: "My Orders", icon: FileText, path: "/resale-portal/my-orders" },
        { name: "Account Settings", icon: Users, path: "/resale-portal/settings" },
      ]
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to your Community Portals</h1>
          <p className="text-muted-foreground mt-1">
            Select the portal you'd like to access, {profile?.name || user?.email || ''}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal) => (
            <Card 
              key={portal.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${portal.color} text-white flex items-center justify-center mb-4`}>
                  <portal.icon className="w-6 h-6" />
                </div>
                <CardTitle>{portal.title}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-medium mb-2">Features:</h3>
                <ul className="space-y-2">
                  {portal.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      <feature.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate(portal.path)}>
                  Enter Portal
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PortalSelection;
