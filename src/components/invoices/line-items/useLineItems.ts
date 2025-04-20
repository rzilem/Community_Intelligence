
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
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === 'amount' && index > 0) {
      const lineTotal = newLines.slice(1).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
      newLines[0] = { ...newLines[0], amount: invoiceTotal - lineTotal };
    }

    setLines(newLines);
  }, [lines, invoiceTotal]);

  const handleRemoveLine = useCallback((index: number) => {
    if (lines.length > 1) {
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
