
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageTemplateProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  icon, 
  description = "This page is currently under development." 
}) => {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{description}</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PageTemplate;
