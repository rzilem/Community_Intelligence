
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AddLineButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export const AddLineButton: React.FC<AddLineButtonProps> = ({ disabled, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClick} 
            className="flex items-center gap-2 text-green-600 hover:bg-green-50"
            disabled={disabled}
          >
            <PlusCircle className="h-4 w-4" />
            Add Line
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {disabled 
            ? "Maximum number of line items reached" 
            : "Add a new line item"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
