
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageTemplateProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  icon, 
  description = "This page is currently under development.",
  children,
  actions
}) => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {actions && (
          <div className="flex items-center">
            {actions}
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}

      {!children ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{description}</p>
          </CardContent>
        </Card>
      ) : (
        children
      )}
    </div>
  );
};

export default PageTemplate;
