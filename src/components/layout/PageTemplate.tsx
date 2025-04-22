
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageTemplateProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  backLink?: string; // Add backLink prop to support navigation back
}

const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  icon, 
  description = "This page is currently under development.",
  children,
  actions,
  backLink
}) => {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backLink && (
              <Link to={backLink}>
                <Button variant="ghost" size="icon" className="mr-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
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
          <div className="card">
            <div className="card-content">
              <p>{description}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </AppLayout>
  );
};

export default PageTemplate;
