
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";

interface InvoiceSummaryProps {
  lineTotal: number;
  invoiceTotal: number;
  isBalanced: boolean;
  onSave: () => void;
  onApprove: () => void;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  lineTotal,
  invoiceTotal,
  isBalanced,
  onSave,
  onApprove
}) => {
  return (
    <>
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Line Items Total:</span>
            <span>${lineTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Invoice Total:</span>
            <span>${invoiceTotal.toFixed(2)}</span>
          </div>
          <div className={`flex justify-between font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
            <span>Difference:</span>
            <span>{isBalanced ? 'Balanced' : `$${Math.abs(lineTotal - invoiceTotal).toFixed(2)}`}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          Payment Amount: <span className="font-semibold">${invoiceTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2" onClick={onSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button className="gap-2" onClick={onApprove} disabled={!isBalanced}>
            <Send className="h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </>
  );
};
