
import React from 'react';
import LineItem, { LineItemData } from './line-items/LineItem';
import { LineItemsWarning } from './line-items/LineItemsWarning';
import { AddLineButton } from './line-items/AddLineButton';
import { useLineItemsLogic } from './line-items/useLineItemsLogic';

interface InvoiceLineItemsProps {
  lines: LineItemData[];
  onLinesChange: (lines: LineItemData[]) => void;
  associationId?: string;
  showPreview?: boolean;
  invoiceTotal: number;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  lines,
  onLinesChange,
  associationId,
  showPreview = true,
  invoiceTotal = 0
}) => {
  const {
    lineTotal,
    handleAddLine,
    handleLineChange,
    handleRemoveLine,
    isBalanced
  } = useLineItemsLogic({
    lines,
    onLinesChange,
    invoiceTotal
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-800">Line Items</h3>
        <AddLineButton 
          disabled={lines.length >= 5} 
          onClick={handleAddLine} 
        />
      </div>
      
      {lines.map((line, index) => (
        <LineItem
          key={index}
          line={line}
          index={index}
          isFirst={index === 0}
          showPreview={showPreview}
          onLineChange={handleLineChange}
          onRemove={handleRemoveLine}
          linesCount={lines.length}
        />
      ))}

      <LineItemsWarning show={!isBalanced} />
    </div>
  );
};

export default InvoiceLineItems;
