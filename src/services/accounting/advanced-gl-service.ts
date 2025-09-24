// Advanced GL Service with mock implementations
import { supabase } from '@/integrations/supabase/client';

export interface GLAccountExtended {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  description: string;
  is_active: boolean;
  balance: number;
  ytd_balance: number;
  budget_amount: number;
  variance_amount: number;
  variance_percentage: number;
}

export interface JournalEntryLineItem {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference?: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: string;
  line_items: JournalEntryLineItem[];
}

export interface JournalEntryData {
  association_id: string;
  date: string;
  reference?: string;
  description: string;
  line_items: Array<{
    account_id: string;
    debit_amount?: number;
    credit_amount?: number;
    description?: string;
  }>;
}

export class AdvancedGLService {
  
  static async getChartOfAccounts(associationId: string): Promise<GLAccountExtended[]> {
    try {
      // Mock GL accounts data since gl_accounts_enhanced table doesn't exist
      const mockAccounts = [
        {
          id: '1',
          account_code: '1000',
          account_name: 'Cash - Operating',
          account_type: 'asset',
          account_subtype: 'current_asset',
          description: 'Main operating cash account',
          is_active: true,
          current_balance: 25000.00
        },
        {
          id: '2',
          account_code: '1100',
          account_name: 'Accounts Receivable',
          account_type: 'asset',
          account_subtype: 'current_asset',
          description: 'Outstanding dues and assessments',
          is_active: true,
          current_balance: 8500.00
        },
        {
          id: '3',
          account_code: '2000',
          account_name: 'Accounts Payable',
          account_type: 'liability',
          account_subtype: 'current_liability',
          description: 'Outstanding vendor payments',
          is_active: true,
          current_balance: 3200.00
        },
        {
          id: '4',
          account_code: '4000',
          account_name: 'Assessment Income',
          account_type: 'revenue',
          account_subtype: 'operating_revenue',
          description: 'Monthly HOA assessments',
          is_active: true,
          current_balance: 45000.00
        },
        {
          id: '5',
          account_code: '5000',
          account_name: 'Maintenance Expense',
          account_type: 'expense',
          account_subtype: 'operating_expense',
          description: 'Property maintenance costs',
          is_active: true,
          current_balance: 12500.00
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockAccounts.map(account => ({
        id: account.id,
        code: account.account_code,
        name: account.account_name,
        type: account.account_type,
        category: account.account_subtype,
        description: account.description,
        is_active: account.is_active,
        balance: account.current_balance || 0,
        ytd_balance: account.current_balance || 0,
        budget_amount: 0,
        variance_amount: 0,
        variance_percentage: 0
      }));
    } catch (error) {
      console.error('Error getting chart of accounts:', error);
      throw error;
    }
  }

  static async createGLAccount(data: {
    association_id: string;
    code: string;
    name: string;
    type: string;
    category?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<GLAccountExtended> {
    try {
      // Mock account creation
      console.log('Creating GL account:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAccount: GLAccountExtended = {
        id: `mock-${Date.now()}`,
        code: data.code,
        name: data.name,
        type: data.type,
        category: data.category || '',
        description: data.description || '',
        is_active: data.is_active !== false,
        balance: 0,
        ytd_balance: 0,
        budget_amount: 0,
        variance_amount: 0,
        variance_percentage: 0
      };
      
      return newAccount;
    } catch (error) {
      console.error('Error creating GL account:', error);
      throw error;
    }
  }

  static async updateGLAccount(id: string, data: {
    code?: string;
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<GLAccountExtended> {
    try {
      // Mock account update
      console.log('Updating GL account:', id, data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAccount: GLAccountExtended = {
        id,
        code: data.code || '1000',
        name: data.name || 'Updated Account',
        type: data.type || 'asset',
        category: data.category || '',
        description: data.description || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        balance: 0,
        ytd_balance: 0,
        budget_amount: 0,
        variance_amount: 0,
        variance_percentage: 0
      };
      
      return updatedAccount;
    } catch (error) {
      console.error('Error updating GL account:', error);
      throw error;
    }
  }

  static async deleteGLAccount(id: string): Promise<void> {
    try {
      // Mock account deletion
      console.log('Deleting GL account:', id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return;
    } catch (error) {
      console.error('Error deleting GL account:', error);
      throw error;
    }
  }

  static async getJournalEntries(associationId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    accountId?: string;
    status?: string;
  }): Promise<JournalEntry[]> {
    try {
      // Mock journal entries
      const mockEntries: JournalEntry[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          reference: 'JE001',
          description: 'Monthly assessment collection',
          total_debit: 5000.00,
          total_credit: 5000.00,
          status: 'posted',
          line_items: [
            {
              id: '1',
              account_code: '1000',
              account_name: 'Cash - Operating',
              account_type: 'asset',
              debit_amount: 5000.00,
              credit_amount: 0,
              description: 'Assessment collection'
            },
            {
              id: '2',
              account_code: '4000',
              account_name: 'Assessment Income',
              account_type: 'revenue',
              debit_amount: 0,
              credit_amount: 5000.00,
              description: 'Monthly assessments'
            }
          ]
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000).toISOString(),
          reference: 'JE002',
          description: 'Maintenance expense payment',
          total_debit: 1200.00,
          total_credit: 1200.00,
          status: 'posted',
          line_items: [
            {
              id: '3',
              account_code: '5000',
              account_name: 'Maintenance Expense',
              account_type: 'expense',
              debit_amount: 1200.00,
              credit_amount: 0,
              description: 'Pool maintenance'
            },
            {
              id: '4',
              account_code: '1000',
              account_name: 'Cash - Operating',
              account_type: 'asset',
              debit_amount: 0,
              credit_amount: 1200.00,
              description: 'Payment to vendor'
            }
          ]
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockEntries;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  }

  static async createJournalEntry(data: JournalEntryData): Promise<JournalEntry> {
    try {
      // Mock journal entry creation
      console.log('Creating journal entry:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockEntry: JournalEntry = {
        id: `mock-${Date.now()}`,
        date: data.date,
        reference: data.reference || `JE${Date.now()}`,
        description: data.description,
        total_debit: data.line_items.reduce((sum, item) => sum + (item.debit_amount || 0), 0),
        total_credit: data.line_items.reduce((sum, item) => sum + (item.credit_amount || 0), 0),
        status: 'draft',
        line_items: data.line_items.map((item, index) => ({
          id: `${index + 1}`,
          account_code: '1000',
          account_name: 'Mock Account',
          account_type: 'asset',
          debit_amount: item.debit_amount || 0,
          credit_amount: item.credit_amount || 0,
          description: item.description || ''
        }))
      };
      
      return mockEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  static async postJournalEntry(data: JournalEntryData): Promise<string> {
    try {
      // Mock journal entry posting
      console.log('Posting journal entry:', data);
      
      // Validate journal entry
      this.validateJournalEntry(data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return `JE${Date.now()}`;
    } catch (error) {
      console.error('Error posting journal entry:', error);
      throw error;
    }
  }

  static validateJournalEntry(data: JournalEntryData): void {
    const totalDebits = data.line_items.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
    const totalCredits = data.line_items.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Journal entry is not balanced. Debits must equal credits.');
    }
    
    if (data.line_items.length < 2) {
      throw new Error('Journal entry must have at least 2 line items.');
    }
    
    if (!data.description?.trim()) {
      throw new Error('Journal entry description is required.');
    }
  }

  static async getAccountBalances(associationId: string, asOfDate?: string): Promise<GLAccountExtended[]> {
    try {
      // Mock account balances - reuse the chart of accounts mock
      return await this.getChartOfAccounts(associationId);
    } catch (error) {
      console.error('Error getting account balances:', error);
      throw error;
    }
  }

  static async getTrialBalance(associationId: string, asOfDate?: string): Promise<{
    accounts: GLAccountExtended[];
    total_debits: number;
    total_credits: number;
    is_balanced: boolean;
  }> {
    try {
      // Mock trial balance
      const accounts = await this.getChartOfAccounts(associationId);
      const totalDebits = accounts
        .filter(acc => ['asset', 'expense'].includes(acc.type))
        .reduce((sum, acc) => sum + acc.balance, 0);
      const totalCredits = accounts
        .filter(acc => ['liability', 'equity', 'revenue'].includes(acc.type))
        .reduce((sum, acc) => sum + acc.balance, 0);
      
      return {
        accounts,
        total_debits: totalDebits,
        total_credits: totalCredits,
        is_balanced: Math.abs(totalDebits - totalCredits) < 0.01
      };
    } catch (error) {
      console.error('Error getting trial balance:', error);
      throw error;
    }
  }
}