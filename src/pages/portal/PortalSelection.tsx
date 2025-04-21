
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Building, Home, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PortalSelection = () => {
  const navigate = useNavigate();
  
  const portals = [
    {
      title: "Homeowner Portal",
      description: "Access your property information, submit requests, and manage payments",
      icon: Home,
      path: "/portal/homeowner",
      color: "bg-blue-500"
    },
    {
      title: "Board Member Portal",
      description: "View community financials, manage requests, and access board documents",
      icon: Building,
      path: "/portal/board",
      color: "bg-purple-500"
    },
    {
      title: "Vendor Portal",
      description: "Manage your services, view opportunities, and handle invoices",
      icon: Truck,
      path: "/portal/vendor",
      color: "bg-green-500"
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Select Your Portal</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <Card 
              key={portal.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(portal.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${portal.color} text-white flex items-center justify-center mb-4`}>
                  <portal.icon className="w-6 h-6" />
                </div>
                <CardTitle>{portal.title}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
                <Button className="w-full mt-4">
                  Enter Portal
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PortalSelection;
