
import React from 'react';
import { LineItemRow } from './line-items/LineItemRow';
import { LineItemsHeader } from './line-items/LineItemsHeader';
import { EmptyLineItems } from './line-items/EmptyLineItems';
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

  const hasLineMismatch = Math.abs(lineTotal + (externalLines[0]?.amount || 0) - invoiceTotal) > 0.01;
  const maxLinesReached = externalLines.length >= 5;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <LineItemsHeader 
        onAddLine={handleAddLine}
        maxLinesReached={maxLinesReached}
      />
      
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

      {hasLineMismatch && <EmptyLineItems />}
    </div>
  );
};

export default InvoiceLineItems;
