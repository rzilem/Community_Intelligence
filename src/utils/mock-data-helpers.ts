
import { GLAccount } from '@/types/accounting-types';

/**
 * Ensures that GL accounts have the required is_active property.
 * This helper is used for older mock data that might not have this property.
 */
export const ensureGLAccountsHaveIsActive = (accounts: any[]): GLAccount[] => {
  return accounts.map(account => {
    // If the account doesn't have is_active, default to true
    if (account.is_active === undefined) {
      account.is_active = true;
    }
    
    // Ensure that the type property is valid according to the GLAccount type
    const validTypes: GLAccount['type'][] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Income', 'Expense'];
    if (!validTypes.includes(account.type as GLAccount['type'])) {
      account.type = 'Expense'; // Default to Expense if not valid
    }
    
    return account as GLAccount;
  });
};
