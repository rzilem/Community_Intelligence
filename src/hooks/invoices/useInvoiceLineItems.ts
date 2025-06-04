
import { useState, useEffect } from 'react';

export interface LineItem {
  id: string;
  description: string;
  amount: number;
  glAccount: string;
}

export const useInvoiceLineItems = (totalAmount: number) => {
  const [lines, setLines] = useState<LineItem[]>([
    {
      id: '1',
      description: '',
      amount: totalAmount || 0,
      glAccount: ''
    }
  ]);

  // Calculate total of all line items
  const lineTotal = lines.reduce((sum, line) => sum + (line.amount || 0), 0);
  
  // Check if line items balance with invoice total
  const isBalanced = Math.abs(lineTotal - (totalAmount || 0)) < 0.01;

  // Update line items when total amount changes
  useEffect(() => {
    if (lines.length === 1 && lines[0].description === '' && totalAmount) {
      setLines([{
        id: '1',
        description: '',
        amount: totalAmount,
        glAccount: ''
      }]);
    }
  }, [totalAmount]);

  return {
    lines,
    setLines,
    lineTotal,
    isBalanced
  };
};
