
import React from 'react';

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
          <h1 className="text-3xl font-bold font-display tracking-tight text-hoa-blue-900">{title}</h1>
        </div>
        {actions && (
          <div className="flex items-center">
            {actions}
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-muted-foreground font-sans">{description}</p>
      )}

      {!children ? (
        <div className="card">
          <div className="card-content">
            <p className="font-sans">{description}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default PageTemplate;
