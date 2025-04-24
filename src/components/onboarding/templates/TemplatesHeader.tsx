
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface TemplatesHeaderProps {
  templateCount: number;
  onCreateClick: () => void;
}

const TemplatesHeader: React.FC<TemplatesHeaderProps> = ({ 
  templateCount,
  onCreateClick
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Onboarding Templates</h1>
        <p className="text-muted-foreground">
          {templateCount} {templateCount === 1 ? 'template' : 'templates'} available
        </p>
      </div>
      <TooltipButton
        onClick={onCreateClick}
        tooltip="Create a new onboarding template"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Template
      </TooltipButton>
    </div>
  );
};

export default TemplatesHeader;
