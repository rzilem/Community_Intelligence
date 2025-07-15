import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import PropertyInspection from '@/components/mobile/PropertyInspection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      {isMobile ? (
        <div className="min-h-screen bg-background">
          {/* Mobile Header */}
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Property Inspection</h1>
          </div>

          {/* Main Content */}
          <PropertyInspection />
        </div>
      ) : (
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Property Inspection</h1>
          </div>
          <p className="text-muted-foreground">
            Mobile-optimized property inspection tools. Best used on mobile devices.
          </p>
          <div className="bg-muted/50 p-6 rounded-lg">
            <PropertyInspection />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MobileMaintenancePage;