
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Settings, Workflow, Network, Shield, Puzzle, Database, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface SystemMenuCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
}

const SystemMenuCard: React.FC<SystemMenuCardProps> = ({ title, icon, description, link }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to={link}>
        <CardHeader className="flex flex-row items-start space-y-0">
          <div className="mr-4 rounded-full bg-muted p-2">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
};

const System = () => {
  const systemMenuItems = [
    {
      title: 'Integrations',
      icon: <Puzzle className="h-5 w-5" />,
      description: 'Set up and manage third-party system integrations such as Stripe, Plaid, and more.',
      link: '/system/integrations'
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configure global system settings, preferences, and defaults.',
      link: '/system/settings'
    },
    {
      title: 'Email Workflows',
      icon: <Workflow className="h-5 w-5" />,
      description: 'Manage automated email sequences, templates, and notification rules.',
      link: '/system/email-workflows'
    },
    {
      title: 'Data Management',
      icon: <Database className="h-5 w-5" />,
      description: 'Manage associations, import and export data in various formats.',
      link: '/system/data-management'
    },
    {
      title: 'Financial Report Mapping',
      icon: <FileText className="h-5 w-5" />,
      description: 'Map GL codes from financial reports during client transitions.',
      link: '/system/financial-report-mapping'
    },
    {
      title: 'Workflow Schedule',
      icon: <Workflow className="h-5 w-5" />,
      description: 'View and configure scheduled system processes and automations.',
      link: '/system/workflow-schedule'
    },
    {
      title: 'Permissions',
      icon: <Shield className="h-5 w-5" />,
      description: 'Configure user roles, permissions, and access controls.',
      link: '/system/permissions'
    }
  ];

  return (
    <AppLayout>
      <PageTemplate 
        title="System" 
        icon={<Settings className="h-8 w-8" />}
        description="Manage system-wide settings and configurations."
      >
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemMenuItems.map((item, index) => (
            <SystemMenuCard 
              key={index}
              title={item.title}
              icon={item.icon}
              description={item.description}
              link={item.link}
            />
          ))}
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default System;
