
import { GLAccount } from '@/types/accounting-types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Ensure account has valid type
export const ensureValidAccountType = (account: any): GLAccount => {
  // List of valid account types
  const validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Income', 'Expense'];
  
  // Convert to valid type if needed
  let type = account.type;
  if (!validTypes.includes(type)) {
    // Default to "Expense" if invalid
    console.warn(`Invalid account type: ${type}. Defaulting to "Expense".`);
    type = 'Expense';
  }
  
  return {
    ...account,
    type,
    is_active: typeof account.is_active === 'boolean' ? account.is_active : true
  };
};

// Ensure all accounts in array have valid types
export const ensureValidAccountTypes = (accounts: any[]): GLAccount[] => {
  return accounts.map(account => ensureValidAccountType(account));
};

// Helper to get GL account label
export const getFormattedGLAccountLabel = (account: GLAccount): string => {
  return `${account.code} - ${account.name}`;
};

// Format GL account for display
export const formatGLAccount = (account: GLAccount): string => {
  return `${account.code} - ${account.name}`;
};

// Check if a journal entry is balanced
export const isJournalEntryBalanced = (debitTotal: number, creditTotal: number): boolean => {
  return Math.abs(debitTotal - creditTotal) < 0.01;
};
