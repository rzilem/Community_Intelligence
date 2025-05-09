
import { useState, useEffect } from 'react';
import { LineItemData } from '@/components/invoices/line-items/LineItem';

/**
 * Hook to manage invoice line items
 */
export const useInvoiceLineItems = (invoiceTotal: number, aiExtractedItems?: any[]) => {
  const [lines, setLines] = useState<LineItemData[]>([{
    glAccount: '',
    fund: 'Operating',
    bankAccount: 'Operating',
    description: '',
    amount: '0',
    isAiGenerated: false
  }]);

  // Initialize line items from AI data if available
  useEffect(() => {
    if (aiExtractedItems && aiExtractedItems.length > 0 && lines.length === 1 && lines[0].description === '') {
      console.log('Initializing line items from AI extracted data', aiExtractedItems);
      
      const aiLines = aiExtractedItems.map(item => ({
        glAccount: '',
        fund: 'Operating',
        bankAccount: 'Operating',
        description: item.description || '',
        amount: typeof item.amount === 'number' ? item.amount.toFixed(2) : String(item.amount) || '0',
        isAiGenerated: true
      }));
      
      setLines(aiLines);
    }
  }, [aiExtractedItems]);

  // Update the first line item whenever the total amount changes
  useEffect(() => {
    if (invoiceTotal > 0 && lines.length > 0) {
      setLines(prevLines => {
        // Calculate the total of all lines except the first one
        const otherLinesTotal = prevLines.slice(1).reduce((sum, line) => {
          const lineAmount = typeof line.amount === 'string' ? parseFloat(line.amount) || 0 : line.amount || 0;
          return sum + lineAmount;
        }, 0);
        
        // Calculate what the first line should be to balance the invoice
        const firstLineAmount = Math.max(0, invoiceTotal - otherLinesTotal);
        
        // Update first line with the calculated amount
        const updatedLines = [...prevLines];
        updatedLines[0] = { ...updatedLines[0], amount: firstLineAmount.toFixed(2) };
        
        return updatedLines;
      });
    }
  }, [invoiceTotal, lines.length]);

  // Calculate lineTotal by safely converting string amounts to numbers
  const lineTotal = lines.reduce((sum, line) => {
    const amount = typeof line.amount === 'string' ? parseFloat(line.amount) || 0 : line.amount || 0;
    return sum + amount;
  }, 0);
  
  // Determine if the invoice is balanced
  const isBalanced = Math.abs(lineTotal - invoiceTotal) < 0.01;

  return {
    lines,
    setLines,
    lineTotal,
    isBalanced
  };
};
