
import React, { useEffect } from 'react';
import { LineItemsList } from './line-items/LineItemsList';
import { LineItemsHeader } from './line-items/LineItemsHeader';
import { EmptyLineItems } from './line-items/EmptyLineItems';
import { useLineItems } from './line-items/useLineItems';
import { LoadingState } from '@/components/ui/loading-state';
import { GLAccount } from '@/types/accounting-types';

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
    isLoadingAccounts,
    lineTotal,
    handleAddLine,
    handleLineChange,
    handleRemoveLine
  } = useLineItems(associationId, invoiceTotal);

  // When a line item changes, propagate changes up to parent
  const handleChange = (index: number, field: string, value: string | number) => {
    console.log(`LineItem change at index ${index}, field ${field}:`, value);
    const updatedLines = [...externalLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
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
      onLinesChange(externalLines.filter((_, i) => i !== index));
    }
  };

  const hasLineMismatch = Math.abs(lineTotal + (externalLines[0]?.amount || 0) - invoiceTotal) > 0.01;
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

      {hasLineMismatch && <EmptyLineItems />}
    </div>
  );
};

export default InvoiceLineItems;
