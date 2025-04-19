
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface LineItemsHeaderProps {
  onAddLine: () => void;
  maxLinesReached: boolean;
}

export const LineItemsHeader = ({ onAddLine, maxLinesReached }: LineItemsHeaderProps) => {
  return (
    <div className="flex justify-between items-center border-b pb-4">
      <h3 className="text-xl font-semibold text-gray-800">Line Items</h3>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddLine} 
              className="flex items-center gap-2 text-green-600 hover:bg-green-50"
              disabled={maxLinesReached}
            >
              <PlusCircle className="h-4 w-4" />
              Add Line
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {maxLinesReached 
              ? "Maximum number of line items reached" 
              : "Add a new line item"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
