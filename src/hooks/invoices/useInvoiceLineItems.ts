
import { useState, useEffect } from 'react';

interface LineItem {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: string;  // Using string for consistent input handling
}

/**
 * Hook to manage invoice line items
 */
export const useInvoiceLineItems = (invoiceTotal: number) => {
  const [lines, setLines] = useState<LineItem[]>([{
    glAccount: '',
    fund: 'Operating',
    bankAccount: 'Operating',
    description: '',
    amount: '0',
  }]);

  // Update the first line item whenever the total amount changes
  useEffect(() => {
    if (invoiceTotal > 0) {
      setLines(prevLines => {
        const otherLinesTotal = prevLines.slice(1).reduce((sum, line) => {
          const lineAmount = typeof line.amount === 'string' ? parseFloat(line.amount) || 0 : line.amount || 0;
          return sum + lineAmount;
        }, 0);
        
        const firstLineAmount = Math.max(0, invoiceTotal - otherLinesTotal);
        
        // Update first line with the calculated amount
        const updatedLines = [...prevLines];
        updatedLines[0] = { ...updatedLines[0], amount: firstLineAmount.toFixed(2) };
        
        return updatedLines;
      });
    }
  }, [invoiceTotal]);

  // Calculate lineTotal by safely converting string amounts to numbers
  const lineTotal = lines.reduce((sum, line) => {
    const amount = typeof line.amount === 'string' ? parseFloat(line.amount) || 0 : line.amount || 0;
    return sum + amount;
  }, 0);
  
  const isBalanced = Math.abs(lineTotal - invoiceTotal) < 0.01;

  return {
    lines,
    setLines,
    lineTotal,
    isBalanced
  };
};
