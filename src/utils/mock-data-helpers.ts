
import { GLAccount } from '@/types/accounting-types';

// Ensure GL accounts have is_active property
export const ensureGLAccountsHaveIsActive = (accounts: any[]): GLAccount[] => {
  return accounts.map(account => ({
    ...account,
    is_active: typeof account.is_active === 'boolean' ? account.is_active : true,
    type: ensureValidGLAccountType(account.type)
  }));
};

// Ensure GL account type is valid
export const ensureValidGLAccountType = (type: string): GLAccount['type'] => {
  const validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Income', 'Expense'];
  if (!type || !validTypes.includes(type)) {
    return 'Expense'; // Default to Expense if invalid
  }
  return type as GLAccount['type'];
};
