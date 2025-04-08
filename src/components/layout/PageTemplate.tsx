
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

interface PageTemplateProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  icon, 
  description = "This page is currently under development.",
  children
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
