
import { GLAccount } from '@/types/accounting-types';
import { JournalEntryDetail } from '@/hooks/accounting/useJournalEntries';

/**
 * Validates if a journal entry is balanced (debits = credits)
 * @param details - Journal entry line items 
 */
export const isJournalEntryBalanced = (details: JournalEntryDetail[]): boolean => {
  if (!details || details.length === 0) return false;
  
  const totalDebits = details.reduce((sum, detail) => sum + (Number(detail.debit) || 0), 0);
  const totalCredits = details.reduce((sum, detail) => sum + (Number(detail.credit) || 0), 0);
  
  // Using a small epsilon to handle floating point precision issues
  return Math.abs(totalDebits - totalCredits) < 0.01;
};

/**
 * Formats GL account code and name for display
 */
export const formatGLAccount = (account: GLAccount | undefined): string => {
  if (!account) return 'Unknown Account';
  return `${account.code} - ${account.name}`;
};

/**
 * Formats a currency amount for display
 */
export const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return '$0.00';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numericAmount);
};

/**
 * Gets the correct CSS class for an account based on its balance nature
 * (assets and expenses are naturally debit accounts, liabilities, equity, and revenue are naturally credit)
 */
export const getAccountBalanceClass = (accountType: string, amount: number): string => {
  const isDebitNature = ['Asset', 'Expense'].includes(accountType);
  const isNegative = amount < 0;
  
  if (isDebitNature) {
    return isNegative ? 'text-red-600' : 'text-green-600';
  } else {
    return isNegative ? 'text-green-600' : 'text-red-600';
  }
};

/**
 * Checks if an account is an income statement account (revenue or expense)
 */
export const isIncomeStatementAccount = (accountType: string): boolean => {
  return ['Revenue', 'Expense', 'Income'].includes(accountType as string);
};

/**
 * Groups accounts by their category
 */
export const groupAccountsByCategory = (accounts: GLAccount[]): Record<string, GLAccount[]> => {
  return accounts.reduce((groups: Record<string, GLAccount[]>, account) => {
    const category = account.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(account);
    return groups;
  }, {});
};

/**
 * Ensure the type property of GLAccount is valid
 */
export const ensureValidAccountType = (account: any): GLAccount => {
  // If type is not one of the valid values, default to 'Expense'
  const validTypes: GLAccount['type'][] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Income', 'Expense'];
  
  const validAccount = { 
    ...account,
    type: validTypes.includes(account.type as GLAccount['type']) ? account.type : 'Expense'
  } as GLAccount;
  
  return validAccount;
};

/**
 * Ensure an array of accounts has valid types
 */
export const ensureValidAccountTypes = (accounts: any[]): GLAccount[] => {
  return accounts.map(ensureValidAccountType);
};
