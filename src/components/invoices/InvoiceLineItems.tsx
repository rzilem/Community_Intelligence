
import React, { useEffect } from 'react';
import { LineItemsList } from './line-items/LineItemsList';
import { LineItemsHeader } from './line-items/LineItemsHeader';
import { EmptyLineItems } from './line-items/EmptyLineItems';
import { useLineItems } from './line-items/useLineItems';
import { LoadingState } from '@/components/ui/loading-state';
import { GLAccount } from '@/types/accounting-types';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
    lines,
    glAccounts,
    isLoadingAccounts,
    lineTotal,
    handleAddLine,
    handleLineChange,
    handleRemoveLine
  } = useLineItems(associationId, invoiceTotal);

  // Sync external lines with internal state on initial render and when invoice total changes
  useEffect(() => {
    console.log('InvoiceLineItems: External lines updated or invoice total changed', {
      externalLinesLength: externalLines.length,
      invoiceTotal
    });
    
    if (externalLines.length > 0) {
      // Calculate what would be the first line amount
      const secondaryLinesTotal = externalLines.slice(1).reduce(
        (sum, line) => sum + (Number(line.amount) || 0), 
        0
      );
      
      const updatedFirstLineAmount = invoiceTotal - secondaryLinesTotal;
      
      // Update first line with the calculated amount
      const updatedLines = [...externalLines];
      if (updatedLines[0]) {
        updatedLines[0] = {
          ...updatedLines[0],
          amount: updatedFirstLineAmount
        };
        
        console.log('Setting first line amount:', {
          invoiceTotal,
          secondaryLinesTotal,
          firstLineAmount: updatedFirstLineAmount
        });
        
        onLinesChange(updatedLines);
      }
    }
  }, [invoiceTotal]);

  // When a line item changes, propagate changes up to parent
  const handleChange = (index: number, field: string, value: string | number) => {
    console.log(`LineItem change at index ${index}, field ${field}:`, value);
    const updatedLines = [...externalLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    
    // If changing amount on secondary line, adjust first line's amount
    if (field === 'amount' && index > 0) {
      const secondaryLinesTotal = updatedLines.slice(1).reduce(
        (sum, line) => sum + (Number(line.amount) || 0), 
        0
      );
      
      updatedLines[0] = {
        ...updatedLines[0],
        amount: invoiceTotal - secondaryLinesTotal
      };
    }
    
    onLinesChange(updatedLines);
  };

  const handleAddLineItem = () => {
    const { fund, bankAccount } = externalLines[0] || { fund: 'Operating', bankAccount: 'Operating' };
    const newLine = {
      glAccount: '',
      fund,
      bankAccount,
      description: '',
      amount: 0
    };
    onLinesChange([...externalLines, newLine]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (externalLines.length > 1 && index > 0) {
      const updatedLines = externalLines.filter((_, i) => i !== index);
      
      // After removing a line, recalculate the first line's amount
      const secondaryLinesTotal = updatedLines.slice(1).reduce(
        (sum, line) => sum + (Number(line.amount) || 0), 
        0
      );
      
      updatedLines[0] = {
        ...updatedLines[0],
        amount: invoiceTotal - secondaryLinesTotal
      };
      
      onLinesChange(updatedLines);
    }
  };

  const hasLineMismatch = Math.abs(
    externalLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0) - invoiceTotal
  ) > 0.01;
  
  const maxLinesReached = externalLines.length >= 5;

  if (isLoadingAccounts) {
    return <LoadingState variant="spinner" text="Loading GL accounts..." className="py-6" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <LineItemsHeader 
        onAddLine={handleAddLineItem}
        maxLinesReached={maxLinesReached}
      />
      
      <LineItemsList
        lines={externalLines}
        glAccounts={glAccounts}
        onLineChange={handleChange}
        onRemoveLine={handleRemoveLineItem}
        showPreview={showPreview}
      />

      {hasLineMismatch && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Line items do not match the total invoice amount</AlertTitle>
        </Alert>
      )}
    </div>
  );
};

export default InvoiceLineItems;
