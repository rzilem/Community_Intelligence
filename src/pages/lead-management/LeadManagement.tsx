
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { User, Mail, BarChart3, FilePlus, ClipboardCheck, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const LeadManagement = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: "Lead Dashboard",
      description: "View and manage all incoming leads",
      icon: <User className="h-8 w-8" />,
      path: "/lead-management/dashboard",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Email Campaigns",
      description: "Create and manage email marketing campaigns",
      icon: <Mail className="h-8 w-8" />,
      path: "/lead-management/email-campaigns",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Analytics",
      description: "Track conversion metrics and lead sources",
      icon: <BarChart3 className="h-8 w-8" />,
      path: "/lead-management/analytics",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Proposals",
      description: "Create and track client proposals",
      icon: <FilePlus className="h-8 w-8" />,
      path: "/lead-management/proposals",
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "Onboarding",
      description: "Manage community onboarding processes",
      icon: <ClipboardCheck className="h-8 w-8" />,
      path: "/lead-management/onboarding",
      color: "bg-red-100 text-red-700"
    },
    {
      title: "Templates",
      description: "Create and manage common templates",
      icon: <Briefcase className="h-8 w-8" />,
      path: "/lead-management/templates",
      color: "bg-indigo-100 text-indigo-700"
    }
  ];

  return (
    <PageTemplate 
      title="Lead Management" 
      icon={<User className="h-8 w-8" />}
      description="Manage and track potential new clients and business opportunities."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className={`p-3 w-fit rounded-md ${feature.color} mb-2`}>
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button 
                className="w-full"
                onClick={() => navigate(feature.path)}
              >
                View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
};

export default LeadManagement;
