
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface TemplatesHeaderProps {
  templateCount: number;
  onCreateClick: () => void;
}

const TemplatesHeader = ({ 
  templateCount, 
  onCreateClick 
}: TemplatesHeaderProps) => {
  return (
    <>
      <div className="text-sm text-muted-foreground bg-muted p-2 rounded mb-4">
        Available templates: {templateCount}
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Onboarding Templates</h2>
        <TooltipButton 
          tooltip="Create a new template for onboarding clients"
          className="flex items-center gap-2"
          onClick={onCreateClick}
        >
          <PlusCircle className="h-4 w-4" />
          New Template
        </TooltipButton>
      </div>
    </>
  );
};

export default TemplatesHeader;
