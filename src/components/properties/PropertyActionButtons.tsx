
import React from 'react';
import { Download, PlusCircle } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

const PropertyActionButtons: React.FC = () => {
  return (
    <div className="flex gap-2">
      <TooltipButton tooltip="Export properties as CSV">
        <Download className="h-4 w-4 mr-2" /> Export
      </TooltipButton>
      <TooltipButton variant="default" tooltip="Add a new property">
        <PlusCircle className="h-4 w-4 mr-2" /> Add Property
      </TooltipButton>
    </div>
  );
};

export default PropertyActionButtons;
