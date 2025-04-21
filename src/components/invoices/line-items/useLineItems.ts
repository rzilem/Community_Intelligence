
import { useState, useEffect, useCallback } from 'react';
import { GLAccount } from '@/types/accounting-types';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';

interface LineItem {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

export const useLineItems = (associationId?: string, invoiceTotal: number = 0) => {
  const { accounts: glAccounts, isLoading: isLoadingAccounts } = useGLAccounts({
    associationId,
    includeMaster: true
  });

  const [lines, setLines] = useState<LineItem[]>([{
    glAccount: '',
    fund: 'Operating',
    bankAccount: 'Operating',
    description: '',
    amount: invoiceTotal, // Initialize with invoice total
  }]);

  const lineTotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  
  // Secondary lines total (all except the first line)
  const secondaryLinesTotal = lines.slice(1).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  
  // Calculate the first line's amount by subtracting secondary lines from invoice total
  const adjustedFirstLineAmount = invoiceTotal - secondaryLinesTotal;

  // Update the first line's amount when invoice total or other line totals change
  useEffect(() => {
    console.log('Adjusting first line amount:', { invoiceTotal, secondaryLinesTotal, adjustedAmount: adjustedFirstLineAmount });
    
    if (lines.length > 0 && Math.abs(lines[0].amount - adjustedFirstLineAmount) > 0.001) {
      const newLines = [...lines];
      newLines[0] = { ...newLines[0], amount: adjustedFirstLineAmount };
      setLines(newLines);
    }
  }, [invoiceTotal, secondaryLinesTotal, adjustedFirstLineAmount, lines]);

  const handleAddLine = useCallback(() => {
    const { fund, bankAccount } = lines[0];
    setLines([...lines, {
      glAccount: '',
      fund,
      bankAccount,
      description: '',
      amount: 0
    }]);
  }, [lines]);

  const handleLineChange = useCallback((index: number, field: string, value: string | number) => {
    console.log(`Changing line ${index}, field ${field} to:`, value);
    
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === 'amount' && index > 0) {
      // When changing amount of any line other than the first,
      // recalculate the secondary lines total
      const updatedSecondaryLinesTotal = newLines.slice(1).reduce(
        (sum, line) => sum + (Number(line.amount) || 0), 
        0
      );
      
      // Adjust the first line to maintain the invoice total
      newLines[0] = { 
        ...newLines[0], 
        amount: invoiceTotal - updatedSecondaryLinesTotal 
      };
    }

    setLines(newLines);
  }, [lines, invoiceTotal]);

  const handleRemoveLine = useCallback((index: number) => {
    if (lines.length > 1 && index > 0) {
      const newLines = lines.filter((_, i) => i !== index);
      
      // After removing a line, recalculate the first line's amount
      const updatedSecondaryLinesTotal = newLines.slice(1).reduce(
        (sum, line) => sum + (Number(line.amount) || 0), 
        0
      );
      
      newLines[0] = {
        ...newLines[0],
        amount: invoiceTotal - updatedSecondaryLinesTotal
      };
      
      setLines(newLines);
    }
  }, [lines, invoiceTotal]);

  return {
    lines,
    setLines,
    glAccounts,
    isLoadingAccounts,
    lineTotal,
    adjustedFirstLineAmount,
    handleAddLine,
    handleLineChange,
    handleRemoveLine
  };
};
