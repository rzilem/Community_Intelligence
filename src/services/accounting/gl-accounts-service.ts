import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type GLAccount = Database['public']['Tables']['gl_accounts_enhanced']['Row'];
type GLAccountInsert = Database['public']['Tables']['gl_accounts_enhanced']['Insert'];
type GLAccountUpdate = Database['public']['Tables']['gl_accounts_enhanced']['Update'];

export interface GLAccountWithBalance extends GLAccount {
  children?: GLAccountWithBalance[];
  isExpanded?: boolean;
}

export class GLAccountsService {
  // Fetch all GL accounts for an association
  static async getAccounts(associationId: string): Promise<GLAccount[]> {
    const { data, error } = await supabase
      .from('gl_accounts_enhanced')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('account_code');

    if (error) throw error;
    return data || [];
  }

  // Fetch hierarchical chart of accounts
  static async getChartOfAccounts(associationId: string): Promise<GLAccountWithBalance[]> {
    const accounts = await this.getAccounts(associationId);
    return this.buildAccountHierarchy(accounts);
  }

  // Create a new GL account
  static async createAccount(account: GLAccountInsert): Promise<GLAccount> {
    // Check if account code already exists
    const { data: existing } = await supabase
      .from('gl_accounts_enhanced')
      .select('id')
      .eq('association_id', account.association_id)
      .eq('account_code', account.account_code)
      .single();

    if (existing) {
      throw new Error(`Account code ${account.account_code} already exists`);
    }

    const { data, error } = await supabase
      .from('gl_accounts_enhanced')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update an existing GL account
  static async updateAccount(id: string, updates: GLAccountUpdate): Promise<GLAccount> {
    const { data, error } = await supabase
      .from('gl_accounts_enhanced')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a GL account (soft delete by marking inactive)
  static async deleteAccount(id: string): Promise<void> {
    // Check if account has children or transactions
    const { data: children } = await supabase
      .from('gl_accounts_enhanced')
      .select('id')
      .eq('parent_account_id', id);

    if (children && children.length > 0) {
      throw new Error('Cannot delete account with child accounts');
    }

    // Check for journal entry lines
    const { data: transactions } = await supabase
      .from('journal_entry_lines')
      .select('id')
      .eq('gl_account_id', id)
      .limit(1);

    if (transactions && transactions.length > 0) {
      throw new Error('Cannot delete account with existing transactions');
    }

    const { error } = await supabase
      .from('gl_accounts_enhanced')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Update account balance (used after posting journal entries)
  static async updateAccountBalance(accountId: string, amount: number, isDebit: boolean): Promise<void> {
    const { data: account, error: fetchError } = await supabase
      .from('gl_accounts_enhanced')
      .select('current_balance, normal_balance')
      .eq('id', accountId)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = account.current_balance || 0;
    const normalBalance = account.normal_balance;
    
    // Calculate new balance based on normal balance and transaction type
    let newBalance = currentBalance;
    if ((normalBalance === 'debit' && isDebit) || (normalBalance === 'credit' && !isDebit)) {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    const { error } = await supabase
      .from('gl_accounts_enhanced')
      .update({ current_balance: newBalance })
      .eq('id', accountId);

    if (error) throw error;
  }

  // Get account balance for a specific period
  static async getAccountBalance(accountId: string, startDate?: string, endDate?: string): Promise<number> {
    let query = supabase
      .from('journal_entry_lines')
      .select(`
        debit_amount,
        credit_amount,
        journal_entries!inner(entry_date, status)
      `)
      .eq('gl_account_id', accountId)
      .eq('journal_entries.status', 'posted');

    if (startDate) {
      query = query.gte('journal_entries.entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('journal_entries.entry_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get the account's normal balance to determine calculation
    const { data: account } = await supabase
      .from('gl_accounts_enhanced')
      .select('normal_balance')
      .eq('id', accountId)
      .single();

    const normalBalance = account?.normal_balance || 'debit';
    
    return (data || []).reduce((balance, line) => {
      const debit = line.debit_amount || 0;
      const credit = line.credit_amount || 0;
      
      if (normalBalance === 'debit') {
        return balance + debit - credit;
      } else {
        return balance + credit - debit;
      }
    }, 0);
  }

  // Build hierarchical structure from flat array
  private static buildAccountHierarchy(accounts: GLAccount[]): GLAccountWithBalance[] {
    const accountMap = new Map<string, GLAccountWithBalance>();
    const rootAccounts: GLAccountWithBalance[] = [];

    // Create map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [], isExpanded: false });
    });

    // Build hierarchy
    accounts.forEach(account => {
      const accountWithChildren = accountMap.get(account.id)!;
      
      if (account.parent_account_id) {
        const parent = accountMap.get(account.parent_account_id);
        if (parent) {
          parent.children!.push(accountWithChildren);
        }
      } else {
        rootAccounts.push(accountWithChildren);
      }
    });

    return rootAccounts;
  }

  // Get default chart of accounts for new associations
  static async createDefaultChartOfAccounts(associationId: string): Promise<void> {
    const defaultAccounts: Omit<GLAccountInsert, 'association_id'>[] = [
      // Assets
      { account_code: '1000', account_name: 'Cash - Operating', account_type: 'asset', account_subtype: 'current_asset', normal_balance: 'debit', is_system_account: true },
      { account_code: '1100', account_name: 'Accounts Receivable', account_type: 'asset', account_subtype: 'current_asset', normal_balance: 'debit', is_system_account: true },
      { account_code: '1200', account_name: 'Reserve Fund', account_type: 'asset', account_subtype: 'current_asset', normal_balance: 'debit', is_system_account: true },
      
      // Liabilities
      { account_code: '2000', account_name: 'Accounts Payable', account_type: 'liability', account_subtype: 'current_liability', normal_balance: 'credit', is_system_account: true },
      { account_code: '2100', account_name: 'Accrued Expenses', account_type: 'liability', account_subtype: 'current_liability', normal_balance: 'credit', is_system_account: true },
      
      // Equity
      { account_code: '3000', account_name: 'Member Equity', account_type: 'equity', account_subtype: 'member_equity', normal_balance: 'credit', is_system_account: true },
      
      // Revenue
      { account_code: '4000', account_name: 'Assessment Income', account_type: 'revenue', account_subtype: 'assessment_income', normal_balance: 'credit', is_system_account: true },
      { account_code: '4100', account_name: 'Late Fee Income', account_type: 'revenue', account_subtype: 'other_income', normal_balance: 'credit', is_system_account: true },
      
      // Expenses
      { account_code: '6000', account_name: 'Maintenance Expenses', account_type: 'expense', account_subtype: 'maintenance_expense', normal_balance: 'debit', is_system_account: true },
      { account_code: '6100', account_name: 'Administrative Expenses', account_type: 'expense', account_subtype: 'administrative_expense', normal_balance: 'debit', is_system_account: true },
      { account_code: '6200', account_name: 'Reserve Expenses', account_type: 'expense', account_subtype: 'reserve_expense', normal_balance: 'debit', is_system_account: true },
    ];

    const accountsToInsert = defaultAccounts.map(account => ({
      ...account,
      association_id: associationId
    }));

    const { error } = await supabase
      .from('gl_accounts_enhanced')
      .insert(accountsToInsert);

    if (error) throw error;
  }
}