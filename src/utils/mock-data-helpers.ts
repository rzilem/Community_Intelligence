
import { GLAccount } from '@/types/accounting-types';

/**
 * Ensures all GL account objects in an array have the is_active property
 * @param accounts Array of GL account objects that might be missing the is_active property
 * @returns Array of GL account objects with is_active property set
 */
export function ensureGLAccountsHaveIsActive(accounts: Partial<GLAccount>[]): GLAccount[] {
  return accounts.map(account => ({
    ...account,
    is_active: account.is_active !== undefined ? account.is_active : true
  })) as GLAccount[];
}

/**
 * Creates a mock GL account with default values
 * @param overrides Properties to override in the default GL account
 * @returns A mock GL account with the specified overrides
 */
export function createMockGLAccount(overrides: Partial<GLAccount> = {}): GLAccount {
  return {
    id: `mock-${Math.random().toString(36).substring(2, 9)}`,
    code: '1000',
    name: 'Mock Account',
    type: 'Asset',
    description: 'Mock account for testing',
    category: 'Current Assets',
    balance: 0,
    is_active: true,
    ...overrides
  };
}
