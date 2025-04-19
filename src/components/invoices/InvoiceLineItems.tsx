
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineItemRow } from './line-items/LineItemRow';
import { useLineItems } from './line-items/useLineItems';

interface LineItem {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

interface InvoiceLineItemsProps {
  lines: LineItem[];
  onLinesChange: (lines: LineItem[]) => void;
  associationId?: string;
  showPreview?: boolean;
  invoiceTotal: number;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  lines: externalLines,
  onLinesChange,
  associationId,
  showPreview = true,
  invoiceTotal = 0
}) => {
  const {
    glAccounts,
    lineTotal,
    handleAddLine,
    handleLineChange,
    handleRemoveLine
  } = useLineItems(associationId, invoiceTotal);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-800">Line Items</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddLine} 
                className="flex items-center gap-2 text-green-600 hover:bg-green-50"
                disabled={externalLines.length >= 5}
              >
                <PlusCircle className="h-4 w-4" />
                Add Line
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {externalLines.length >= 5 
                ? "Maximum number of line items reached" 
                : "Add a new line item"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {externalLines.map((line, index) => (
        <LineItemRow
          key={index}
          index={index}
          line={line}
          isFirstLine={index === 0}
          glAccounts={glAccounts}
          onLineChange={handleLineChange}
          onRemoveLine={handleRemoveLine}
          showPreview={showPreview}
        />
      ))}

      {Math.abs(lineTotal + (externalLines[0]?.amount || 0) - invoiceTotal) > 0.01 && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Line items do not match the total invoice amount</span>
        </div>
      )}
    </div>
  );
};

export default InvoiceLineItems;
