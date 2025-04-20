
import React from 'react';
import { LineItemsList } from './line-items/LineItemsList';
import { LineItemsHeader } from './line-items/LineItemsHeader';
import { EmptyLineItems } from './line-items/EmptyLineItems';
import { useLineItems } from './line-items/useLineItems';
import { LoadingState } from '@/components/ui/loading-state';

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

  const hasLineMismatch = Math.abs(lineTotal + (externalLines[0]?.amount || 0) - invoiceTotal) > 0.01;
  const maxLinesReached = externalLines.length >= 5;

  if (isLoadingAccounts) {
    return <LoadingState variant="spinner" text="Loading GL accounts..." className="py-6" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <LineItemsHeader 
        onAddLine={handleAddLine}
        maxLinesReached={maxLinesReached}
      />
      
      <LineItemsList
        lines={externalLines}
        glAccounts={glAccounts}
        onLineChange={handleLineChange}
        onRemoveLine={handleRemoveLine}
        showPreview={showPreview}
      />

      {hasLineMismatch && <EmptyLineItems />}
    </div>
  );
};

export default InvoiceLineItems;
