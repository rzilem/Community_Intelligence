
import { GLAccount } from '@/types/accounting-types';
import { ensureValidAccountType } from './accounting-helpers';

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
    
    // Use the ensureValidAccountType utility to ensure correct type values
    return ensureValidAccountType(account);
  });
};
