
import { GLAccount } from '@/types/accounting-types';

/**
 * Ensures that GL Accounts have the is_active property
 * This is a helper for backwards compatibility when using mock data
 */
export const ensureGLAccountsHaveIsActive = (accounts: any[]): GLAccount[] => {
  return accounts.map(account => ({
    ...account,
    is_active: account.is_active === undefined ? true : account.is_active
  }));
};

/**
 * Create a mock journal entry with balanced details
 */
export const createMockJournalEntry = (id: string, date: string, description: string) => {
  return {
    id,
    date,
    reference: `JE-${id.substring(0, 8)}`,
    description,
    status: 'draft',
    createdBy: 'System User',
    createdAt: new Date().toISOString()
  };
};
