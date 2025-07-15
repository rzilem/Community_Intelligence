import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import ResidentMobileApp from '@/components/mobile/ResidentMobileApp';
import { Home } from 'lucide-react';

const ResidentPortalPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout>
      {isMobile ? (
        <ResidentMobileApp />
      ) : (
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Resident Portal</h1>
          </div>
          <p className="text-muted-foreground">
            Access your resident portal from a mobile device for the best experience.
          </p>
          <div className="bg-muted/50 p-6 rounded-lg">
            <ResidentMobileApp />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ResidentPortalPage;