import { useCallback, useMemo, useEffect } from 'react';
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
  // Calculate the total of all lines except the first one
  const lineTotal = useMemo(() => 
    lines.slice(1).reduce((sum, line) => {
      const amount = typeof line.amount === 'string' ? 
        parseFloat(line.amount) || 0 : 
        line.amount || 0;
      return sum + amount;
    }, 0),
    [lines]
  );

  // Calculate the amount for the first line to keep the total balanced
  const adjustedFirstLineAmount = useMemo(() => {
    return invoiceTotal - lineTotal;
  }, [invoiceTotal, lineTotal]);

  // Handle adding a new line item
  const handleAddLine = useCallback(() => {
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
    
    // Handle amount field specially
    if (field === 'amount') {
      // For first line, we calculate this automatically
      if (index === 0) {
        // We'll set it to the adjusted amount, but keep it as a string
        const formattedAmount = adjustedFirstLineAmount.toFixed(2);
        newLines[index] = { ...newLines[index], [field]: formattedAmount };
      } else {
        // Allow direct string input for other lines
        newLines[index] = { ...newLines[index], [field]: value };
        
        // Update the first line's amount to maintain balance - as a string
        newLines[0] = { 
          ...newLines[0], 
          amount: adjustedFirstLineAmount.toFixed(2)
        };
      }
    } else {
      // For other fields, just update the value
      newLines[index] = { ...newLines[index], [field]: value };
    }

    onLinesChange(newLines);
  }, [lines, onLinesChange, adjustedFirstLineAmount]);

  // Handle removing a line item
  const handleRemoveLine = useCallback((index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index);
      onLinesChange(newLines);
    }
  }, [lines, onLinesChange]);

  // Update first line amount when the invoice total changes
  useEffect(() => {
    if (lines[0] && invoiceTotal > 0) {
      // Only update if the first line amount doesn't match the adjusted value
      const currentFirstLineAmount = typeof lines[0].amount === 'string' ? 
        parseFloat(lines[0].amount) || 0 : lines[0].amount || 0;
      
      if (Math.abs(currentFirstLineAmount - adjustedFirstLineAmount) > 0.01) {
        const newLines = [...lines];
        newLines[0] = { 
          ...newLines[0], 
          amount: adjustedFirstLineAmount.toFixed(2)
        };
        onLinesChange(newLines);
      }
    }
  }, [invoiceTotal, adjustedFirstLineAmount, lines, onLinesChange]);

  // Calculate whether the totals are balanced
  const isBalanced = useMemo(() => {
    const firstLineAmount = typeof lines[0]?.amount === 'string' ? 
      parseFloat(lines[0]?.amount) || 0 : 
      lines[0]?.amount || 0;
    
    return Math.abs(lineTotal + firstLineAmount - invoiceTotal) <= 0.01;
  }, [lines, lineTotal, invoiceTotal]);

  return {
    lineTotal,
    adjustedFirstLineAmount,
    handleAddLine,
    handleLineChange,
    handleRemoveLine,
    isBalanced
  };
};
