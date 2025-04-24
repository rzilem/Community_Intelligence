
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TooltipButton from '@/components/ui/tooltip-button';
import { ChevronLeft } from 'lucide-react';

const BackToLeadsButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 left-4 z-10">
      <TooltipButton 
        variant="outline"
        onClick={() => navigate('/lead-management/dashboard')}
        tooltip="Return to leads dashboard"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Leads
      </TooltipButton>
    </div>
  );
};

export default BackToLeadsButton;
