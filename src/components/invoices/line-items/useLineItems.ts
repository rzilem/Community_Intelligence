
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
    amount: 0,
  }]);

  const lineTotal = lines.slice(1).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const adjustedFirstLineAmount = invoiceTotal - lineTotal;

  // Update the first line's amount when invoice total or other line totals change
  useEffect(() => {
    if (lines.length > 0 && lines[0]) {
      const newLines = [...lines];
      newLines[0] = { ...newLines[0], amount: adjustedFirstLineAmount };
      setLines(newLines);
    }
  }, [invoiceTotal, lineTotal, adjustedFirstLineAmount]);

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
      // Recalculate the first line's amount after changing any other line's amount
      const secondaryLinesTotal = newLines.slice(1).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
      newLines[0] = { ...newLines[0], amount: invoiceTotal - secondaryLinesTotal };
    }

    setLines(newLines);
  }, [lines, invoiceTotal]);

  const handleRemoveLine = useCallback((index: number) => {
    if (lines.length > 1 && index > 0) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }, [lines]);

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
