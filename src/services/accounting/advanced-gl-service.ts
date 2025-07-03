import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

interface GLAccountExtended {
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normal_balance: 'debit' | 'credit';
  is_active: boolean;
  parent_account_code?: string;
  cost_center?: string;
  department?: string;
  property_specific?: boolean;
  current_balance: number;
  ytd_balance: number;
  budget_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
}

interface FinancialPeriod {
  year: number;
  month: number;
  is_closed: boolean;
  closing_date?: string;
  total_debits: number;
  total_credits: number;
  net_income: number;
}

interface BudgetLineItem {
  gl_account_code: string;
  period_type: 'monthly' | 'quarterly' | 'annually';
  budget_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  forecast_amount?: number;
}

export class AdvancedGLService {
  
  static async getChartOfAccounts(associationId: string): Promise<GLAccountExtended[]> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select(`
        *,
        gl_account_balances(current_balance, ytd_balance),
        budget_lines(budget_amount)
      `)
      .eq('association_id', associationId)
      .order('code');

    if (error) throw error;

    return (data || []).map(account => ({
      code: account.code,
      name: account.name,
      category: account.category || 'Other',
      subcategory: account.category,
      account_type: account.type as any,
      normal_balance: 'debit' as any,
      is_active: account.is_active,
      parent_account_code: null,
      cost_center: null,
      department: null,
      property_specific: false,
      current_balance: account.balance || 0,
      ytd_balance: account.balance || 0,
      budget_amount: 0,
      variance_amount: 0,
      variance_percentage: 0
    }));
  }

  static async createGLAccount(data: {
    association_id: string;
    code: string;
    name: string;
    account_type: string;
    category?: string;
    subcategory?: string;
    parent_account_code?: string;
    cost_center?: string;
    department?: string;
    normal_balance?: string;
    is_active?: boolean;
  }): Promise<void> {
    const { error } = await supabase
      .from('gl_accounts')
      .insert({
        ...data,
        normal_balance: data.normal_balance || this.getDefaultNormalBalance(data.account_type),
        is_active: data.is_active !== false
      });

    if (error) throw error;
  }

  private static getDefaultNormalBalance(accountType: string): string {
    switch (accountType) {
      case 'asset':
      case 'expense':
        return 'debit';
      case 'liability':
      case 'equity':
      case 'revenue':
        return 'credit';
      default:
        return 'debit';
    }
  }

  static async postJournalEntry(data: {
    association_id: string;
    entry_number?: string;
    reference_number?: string;
    description: string;
    post_date: string;
    line_items: {
      gl_account_code: string;
      debit_amount?: number;
      credit_amount?: number;
      description?: string;
      cost_center?: string;
      department?: string;
      property_id?: string;
    }[];
  }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate journal entry
    this.validateJournalEntry(data);

    // Generate entry number if not provided
    const entryNumber = data.entry_number || await this.generateJournalEntryNumber();

    // Create journal entry header
    const { data: journalEntry, error: headerError } = await supabase
      .from('journal_entries')
      .insert({
        association_id: data.association_id,
        entry_number: entryNumber,
        reference_number: data.reference_number,
        description: data.description,
        post_date: data.post_date,
        entry_status: 'posted',
        total_debits: data.line_items.reduce((sum, line) => sum + (line.debit_amount || 0), 0),
        total_credits: data.line_items.reduce((sum, line) => sum + (line.credit_amount || 0), 0),
        created_by: user.id
      })
      .select()
      .single();

    if (headerError) throw headerError;

    // Create journal entry lines
    const lineItems = data.line_items.map((line, index) => ({
      journal_entry_id: journalEntry.id,
      line_number: index + 1,
      gl_account_code: line.gl_account_code,
      debit_amount: line.debit_amount || 0,
      credit_amount: line.credit_amount || 0,
      description: line.description || data.description,
      cost_center: line.cost_center,
      department: line.department,
      property_id: line.property_id
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(lineItems);

    if (linesError) throw linesError;

    // Update GL account balances
    await this.updateGLBalances(data.association_id, data.line_items, data.post_date);

    return journalEntry.id;
  }

  private static validateJournalEntry(data: any): void {
    const totalDebits = data.line_items.reduce((sum: number, line: any) => sum + (line.debit_amount || 0), 0);
    const totalCredits = data.line_items.reduce((sum: number, line: any) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Journal entry is not balanced. Debits must equal credits.');
    }

    if (data.line_items.length < 2) {
      throw new Error('Journal entry must have at least 2 line items.');
    }

    // Validate each line has either debit or credit (but not both)
    data.line_items.forEach((line: any, index: number) => {
      if ((line.debit_amount || 0) > 0 && (line.credit_amount || 0) > 0) {
        throw new Error(`Line ${index + 1}: Cannot have both debit and credit amounts.`);
      }
      if ((line.debit_amount || 0) === 0 && (line.credit_amount || 0) === 0) {
        throw new Error(`Line ${index + 1}: Must have either debit or credit amount.`);
      }
    });
  }

  private static async updateGLBalances(
    associationId: string,
    lineItems: any[],
    postDate: string
  ): Promise<void> {
    for (const line of lineItems) {
      // Get current balance
      const { data: currentBalance } = await supabase
        .from('gl_account_balances')
        .select('*')
        .eq('association_id', associationId)
        .eq('gl_account_code', line.gl_account_code)
        .eq('period_year', new Date(postDate).getFullYear())
        .eq('period_month', new Date(postDate).getMonth() + 1)
        .single();

      const debitAmount = line.debit_amount || 0;
      const creditAmount = line.credit_amount || 0;
      const netChange = debitAmount - creditAmount;

      if (currentBalance) {
        // Update existing balance
        await supabase
          .from('gl_account_balances')
          .update({
            current_balance: currentBalance.current_balance + netChange,
            ytd_balance: currentBalance.ytd_balance + netChange,
            total_debits: currentBalance.total_debits + debitAmount,
            total_credits: currentBalance.total_credits + creditAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentBalance.id);
      } else {
        // Create new balance record
        await supabase
          .from('gl_account_balances')
          .insert({
            association_id: associationId,
            gl_account_code: line.gl_account_code,
            period_year: new Date(postDate).getFullYear(),
            period_month: new Date(postDate).getMonth() + 1,
            current_balance: netChange,
            ytd_balance: netChange,
            total_debits: debitAmount,
            total_credits: creditAmount
          });
      }
    }
  }

  static async generateTrialBalance(
    associationId: string,
    asOfDate: string
  ): Promise<any[]> {
    const year = new Date(asOfDate).getFullYear();
    const month = new Date(asOfDate).getMonth() + 1;

    const { data, error } = await supabase
      .from('gl_accounts')
      .select(`
        code,
        name,
        account_type,
        normal_balance,
        gl_account_balances!inner(
          current_balance,
          total_debits,
          total_credits
        )
      `)
      .eq('association_id', associationId)
      .eq('is_active', true)
      .eq('gl_account_balances.period_year', year)
      .eq('gl_account_balances.period_month', month)
      .order('code');

    if (error) throw error;

    return (data || []).map(account => ({
      account_code: account.code,
      account_name: account.name,
      account_type: account.account_type,
      normal_balance: account.normal_balance,
      current_balance: account.gl_account_balances?.[0]?.current_balance || 0,
      total_debits: account.gl_account_balances?.[0]?.total_debits || 0,
      total_credits: account.gl_account_balances?.[0]?.total_credits || 0,
      debit_balance: account.normal_balance === 'debit' && (account.gl_account_balances?.[0]?.current_balance || 0) > 0 
        ? account.gl_account_balances?.[0]?.current_balance || 0 : 0,
      credit_balance: account.normal_balance === 'credit' && (account.gl_account_balances?.[0]?.current_balance || 0) > 0 
        ? account.gl_account_balances?.[0]?.current_balance || 0 : 0
    }));
  }

  static async closePeriod(associationId: string, year: number, month: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate period can be closed
    await this.validatePeriodClose(associationId, year, month);

    // Calculate period totals
    const { data: balances } = await supabase
      .from('gl_account_balances')
      .select('*')
      .eq('association_id', associationId)
      .eq('period_year', year)
      .eq('period_month', month);

    const totalDebits = (balances || []).reduce((sum, b) => sum + (b.total_debits || 0), 0);
    const totalCredits = (balances || []).reduce((sum, b) => sum + (b.total_credits || 0), 0);

    // Calculate net income
    const { data: incomeAccounts } = await supabase
      .from('gl_accounts')
      .select(`
        code,
        account_type,
        gl_account_balances!inner(current_balance)
      `)
      .eq('association_id', associationId)
      .in('account_type', ['revenue', 'expense']);

    const netIncome = (incomeAccounts || []).reduce((net, account) => {
      const balance = account.gl_account_balances?.[0]?.current_balance || 0;
      return account.account_type === 'revenue' ? net + balance : net - balance;
    }, 0);

    // Create period record
    await supabase
      .from('financial_periods')
      .insert({
        association_id: associationId,
        year: year,
        month: month,
        is_closed: true,
        closing_date: new Date().toISOString(),
        total_debits: totalDebits,
        total_credits: totalCredits,
        net_income: netIncome,
        closed_by: user.id
      });

    // Close period balances
    await supabase
      .from('gl_account_balances')
      .update({ is_closed: true })
      .eq('association_id', associationId)
      .eq('period_year', year)
      .eq('period_month', month);
  }

  private static async validatePeriodClose(associationId: string, year: number, month: number): Promise<void> {
    // Check if period is already closed
    const { data: existingPeriod } = await supabase
      .from('financial_periods')
      .select('*')
      .eq('association_id', associationId)
      .eq('year', year)
      .eq('month', month)
      .eq('is_closed', true)
      .single();

    if (existingPeriod) {
      throw new Error('Period is already closed');
    }

    // Check if all required reconciliations are complete
    // This would check bank reconciliations, etc.
  }

  private static async generateJournalEntryNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const { data } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .like('entry_number', `JE-${year}${month}-%`)
      .order('entry_number', { ascending: false })
      .limit(1);

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].entry_number.split('-').pop();
      if (lastNumber) {
        sequenceNumber = parseInt(lastNumber) + 1;
      }
    }

    return `JE-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }

  private static calculateVariancePercentage(actual: number, budget: number): number {
    if (budget === 0) return actual === 0 ? 0 : 100;
    return ((actual - budget) / Math.abs(budget)) * 100;
  }

  static async getAccountHierarchy(associationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('code');

    if (error) throw error;

    // Build hierarchical structure
    const accounts = data || [];
    const hierarchy: any[] = [];
    const accountMap = new Map();

    // Create map for quick lookup
    accounts.forEach(account => {
      accountMap.set(account.code, { ...account, children: [] });
    });

    // Build hierarchy
    accounts.forEach(account => {
      const accountNode = accountMap.get(account.code);
      if (account.parent_account_code) {
        const parent = accountMap.get(account.parent_account_code);
        if (parent) {
          parent.children.push(accountNode);
        } else {
          hierarchy.push(accountNode);
        }
      } else {
        hierarchy.push(accountNode);
      }
    });

    return hierarchy;
  }
}