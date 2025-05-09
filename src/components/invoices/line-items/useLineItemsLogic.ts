
import { useCallback, useMemo } from 'react';
import { LineItemData } from './LineItem';

interface UseLineItemsLogicProps {
  lines: LineItemData[];
  onLinesChange: (lines: LineItemData[]) => void;
  invoiceTotal: number;
}

export const useLineItemsLogic = ({ 
  lines, 
  onLinesChange, 
  invoiceTotal = 0 
}: UseLineItemsLogicProps) => {
  // Calculate the sum of all line amounts
  const lineTotal = useMemo(() => 
    lines.reduce((sum, line) => {
      const amount = typeof line.amount === 'string' ? 
        parseFloat(line.amount) || 0 : 
        line.amount || 0;
      return sum + amount;
    }, 0),
    [lines]
  );

  // Check if invoice total matches line items total
  const isBalanced = useMemo(() => {
    return Math.abs(lineTotal - invoiceTotal) <= 0.01;
  }, [lineTotal, invoiceTotal]);

  // Handle adding a new line item
  const handleAddLine = useCallback(() => {
    // Copy fund and bankAccount from the first line item as defaults
    const { fund, bankAccount } = lines[0];
    
    onLinesChange([...lines, {
      glAccount: '',
      fund, 
      bankAccount,
      description: '',
      amount: '0'
    }]);
  }, [lines, onLinesChange]);

  // Handle line item changes
  const handleLineChange = useCallback((index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    onLinesChange(newLines);
  }, [lines, onLinesChange]);

  // Handle removing a line item
  const handleRemoveLine = useCallback((index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index);
      onLinesChange(newLines);
    }
  }, [lines, onLinesChange]);

  return {
    lineTotal,
    handleAddLine,
    handleLineChange,
    handleRemoveLine,
    isBalanced
  };
};
