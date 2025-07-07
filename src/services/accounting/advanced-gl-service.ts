import { supabase } from '@/integrations/supabase/client';

export interface GLAccountExtended {
  id: string;
  code: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  is_active: boolean;
  balance: number;
  ytd_balance: number;
  budget_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
}

export interface JournalEntryData {
  association_id: string;
  entry_number?: string;
  reference_number?: string;
  description: string;
  entry_date: string;
  line_items: {
    gl_account_id: string;
    debit_amount?: number;
    credit_amount?: number;
    description?: string;
    property_id?: string;
  }[];
}

export class AdvancedGLService {
  
  static async getChartOfAccounts(associationId: string): Promise<GLAccountExtended[]> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('*')
      .eq('association_id', associationId)
      .order('code');

    if (error) throw error;

    return (data || []).map(account => ({
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
      description: account.description,
      is_active: account.is_active,
      balance: account.balance || 0,
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
    type: string;
    category?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<void> {
    const { error } = await supabase
      .from('gl_accounts')
      .insert({
        association_id: data.association_id,
        code: data.code,
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        is_active: data.is_active !== false
      });

    if (error) throw error;
  }

  static async postJournalEntry(data: JournalEntryData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate journal entry
    this.validateJournalEntry(data);

    // Generate entry number if not provided
    const entryNumber = data.entry_number || await this.generateJournalEntryNumber();

    // Calculate total amount from line items
    const totalAmount = data.line_items.reduce((sum, line) => 
      sum + Math.max(line.debit_amount || 0, line.credit_amount || 0), 0);

    // Create journal entry header
    const { data: journalEntry, error: headerError } = await supabase
      .from('journal_entries')
      .insert({
        association_id: data.association_id,
        entry_number: entryNumber,
        reference_number: data.reference_number,
        description: data.description,
        entry_date: data.entry_date,
        status: 'posted',
        source_type: 'manual',
        total_amount: totalAmount,
        created_by: user.id
      })
      .select()
      .single();

    if (headerError) throw headerError;

    // Create journal entry lines
    const lineItems = data.line_items.map((line, index) => ({
      journal_entry_id: journalEntry.id,
      line_number: index + 1,
      gl_account_id: line.gl_account_id,
      debit_amount: line.debit_amount || 0,
      credit_amount: line.credit_amount || 0,
      description: line.description || data.description,
      property_id: line.property_id
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_line_items')
      .insert(lineItems);

    if (linesError) throw linesError;

    return journalEntry.id;
  }

  private static validateJournalEntry(data: JournalEntryData): void {
    const totalDebits = data.line_items.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = data.line_items.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Journal entry is not balanced. Debits must equal credits.');
    }

    if (data.line_items.length < 2) {
      throw new Error('Journal entry must have at least 2 line items.');
    }

    data.line_items.forEach((line, index) => {
      if ((line.debit_amount || 0) > 0 && (line.credit_amount || 0) > 0) {
        throw new Error(`Line ${index + 1}: Cannot have both debit and credit amounts.`);
      }
      if ((line.debit_amount || 0) === 0 && (line.credit_amount || 0) === 0) {
        throw new Error(`Line ${index + 1}: Must have either debit or credit amount.`);
      }
    });
  }

  static async generateTrialBalance(associationId: string, asOfDate: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('code');

    if (error) throw error;

    return (data || []).map(account => ({
      account_code: account.code,
      account_name: account.name,
      account_type: account.type,
      current_balance: account.balance || 0,
      debit_balance: account.balance > 0 ? account.balance : 0,
      credit_balance: account.balance < 0 ? Math.abs(account.balance) : 0
    }));
  }

  static async getAccountBalance(accountId: string): Promise<{
    closing_balance: number;
    ytd_balance: number;
    total_debits: number;
    total_credits: number;
  }> {
    // Since gl_account_balances table doesn't exist yet, calculate from gl_accounts
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('balance')
      .eq('id', accountId)
      .maybeSingle();

    if (error) throw error;

    const balance = data?.balance || 0;
    return {
      closing_balance: balance,
      ytd_balance: balance,
      total_debits: balance > 0 ? balance : 0,
      total_credits: balance < 0 ? Math.abs(balance) : 0,
    };
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
}