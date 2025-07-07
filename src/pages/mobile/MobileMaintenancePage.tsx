import React from 'react';
import PropertyInspection from '@/components/mobile/PropertyInspection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileMaintenancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default MobileMaintenancePage;