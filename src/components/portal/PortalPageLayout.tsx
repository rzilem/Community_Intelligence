
import React, { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';

interface PortalPageLayoutProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: ReactNode;
  portalType: 'homeowner' | 'board' | 'vendor';
}

export const PortalPageLayout: React.FC<PortalPageLayoutProps> = ({
  title,
  description,
  icon,
  children,
  portalType
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated, redirect to login if not
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?tab=login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        
        {!user && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to view this page
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
