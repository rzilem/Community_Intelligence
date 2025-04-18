
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceSummaryProps {
  lineTotal: number;
  invoiceTotal: number;
  isBalanced: boolean;
  onSave: () => void;
  onApprove: () => void;
  isSaving?: boolean;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  lineTotal,
  invoiceTotal,
  isBalanced,
  onSave,
  onApprove,
  isSaving = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between">
          <div className="font-medium text-gray-700">Line Items Total:</div>
          <div className="font-semibold">{formatCurrency(lineTotal)}</div>
        </div>
        
        <div className="flex justify-between">
          <div className="font-medium text-gray-700">Invoice Total:</div>
          <div className="font-semibold">{formatCurrency(invoiceTotal)}</div>
        </div>
        
        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
          <div className="font-medium text-gray-700">Difference:</div>
          <div className={cn(
            "font-semibold",
            isBalanced ? "text-green-600" : "text-red-600"
          )}>
            {isBalanced ? "Balanced" : formatCurrency(lineTotal - invoiceTotal)}
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 justify-end mt-6">
        <Button 
          variant="outline" 
          className="px-5"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        
        <Button 
          className="px-5"
          onClick={onApprove}
          disabled={!isBalanced || isSaving}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </div>
    </div>
  );
};
