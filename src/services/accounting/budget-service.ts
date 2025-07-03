import { supabase } from '@/integrations/supabase/client';

export interface BudgetEntry {
  id: string;
  gl_account_id: string;
  budget_year: number;
  period_number: number;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percent: number;
  gl_account?: {
    code: string;
    name: string;
    type: string;
  };
}

export interface BudgetSummary {
  total_budgeted: number;
  total_actual: number;
  total_variance: number;
  variance_percent: number;
  by_category: {
    [category: string]: {
      budgeted: number;
      actual: number;
      variance: number;
    };
  };
}

export class BudgetService {
  
  static async createBudget(
    associationId: string,
    year: number,
    budgetData: {
      gl_account_id: string;
      period_type: 'monthly' | 'quarterly' | 'annually';
      periods: { period_number: number; amount: number }[];
    }[]
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const budgetEntries = budgetData.flatMap(item =>
      item.periods.map(period => ({
        association_id: associationId,
        gl_account_id: item.gl_account_id,
        budget_year: year,
        period_type: item.period_type,
        period_number: period.period_number,
        budgeted_amount: period.amount,
        actual_amount: 0,
        created_by: user.id
      }))
    );

    const { error } = await supabase
      .from('budget_entries')
      .upsert(budgetEntries, {
        onConflict: 'association_id,gl_account_id,budget_year,period_number'
      });

    if (error) throw error;
  }

  static async getBudgetEntries(
    associationId: string,
    year: number,
    periodNumber?: number
  ): Promise<BudgetEntry[]> {
    let query = supabase
      .from('budget_entries')
      .select(`
        *,
        gl_accounts(code, name, type)
      `)
      .eq('association_id', associationId)
      .eq('budget_year', year);

    if (periodNumber !== undefined) {
      query = query.eq('period_number', periodNumber);
    }

    const { data, error } = await query.order('period_number');

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      gl_account_id: entry.gl_account_id,
      budget_year: entry.budget_year,
      period_number: entry.period_number,
      budgeted_amount: entry.budgeted_amount,
      actual_amount: entry.actual_amount,
      variance_amount: entry.variance_amount,
      variance_percent: entry.variance_percent,
      gl_account: entry.gl_accounts ? {
        code: entry.gl_accounts.code,
        name: entry.gl_accounts.name,
        type: entry.gl_accounts.type
      } : undefined
    }));
  }

  static async updateActualAmounts(
    associationId: string,
    year: number,
    periodNumber: number
  ): Promise<void> {
    // Get all budget entries for the period
    const { data: budgetEntries, error: budgetError } = await supabase
      .from('budget_entries')
      .select('*')
      .eq('association_id', associationId)
      .eq('budget_year', year)
      .eq('period_number', periodNumber);

    if (budgetError) throw budgetError;

    // Calculate actual amounts from journal entries
    for (const entry of budgetEntries || []) {
      const { data: actualData, error: actualError } = await supabase
        .from('journal_entry_lines')
        .select(`
          debit_amount,
          credit_amount,
          journal_entries!inner(entry_date)
        `)
        .eq('gl_account_id', entry.gl_account_id)
        .gte('journal_entries.entry_date', `${year}-${String(periodNumber).padStart(2, '0')}-01`)
        .lt('journal_entries.entry_date', 
          periodNumber === 12 
            ? `${year + 1}-01-01`
            : `${year}-${String(periodNumber + 1).padStart(2, '0')}-01`
        );

      if (actualError) throw actualError;

      const actualAmount = (actualData || []).reduce((sum, line) => 
        sum + (line.debit_amount || 0) - (line.credit_amount || 0), 0
      );

      // Update budget entry with actual amount
      await supabase
        .from('budget_entries')
        .update({ actual_amount: actualAmount })
        .eq('id', entry.id);
    }
  }

  static async getBudgetSummary(
    associationId: string,
    year: number
  ): Promise<BudgetSummary> {
    const { data: entries, error } = await supabase
      .from('budget_entries')
      .select(`
        *,
        gl_accounts(type, category)
      `)
      .eq('association_id', associationId)
      .eq('budget_year', year);

    if (error) throw error;

    const summary = (entries || []).reduce((acc, entry) => {
      acc.total_budgeted += entry.budgeted_amount;
      acc.total_actual += entry.actual_amount;
      acc.total_variance += entry.variance_amount;

      const category = entry.gl_accounts?.category || 'Other';
      if (!acc.by_category[category]) {
        acc.by_category[category] = { budgeted: 0, actual: 0, variance: 0 };
      }

      acc.by_category[category].budgeted += entry.budgeted_amount;
      acc.by_category[category].actual += entry.actual_amount;
      acc.by_category[category].variance += entry.variance_amount;

      return acc;
    }, {
      total_budgeted: 0,
      total_actual: 0,
      total_variance: 0,
      variance_percent: 0,
      by_category: {} as { [key: string]: { budgeted: number; actual: number; variance: number } }
    });

    summary.variance_percent = summary.total_budgeted !== 0 
      ? (summary.total_variance / summary.total_budgeted) * 100 
      : 0;

    return summary;
  }

  static async copyBudgetFromPreviousYear(
    associationId: string,
    fromYear: number,
    toYear: number,
    adjustmentPercent: number = 0
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: previousBudget, error } = await supabase
      .from('budget_entries')
      .select('*')
      .eq('association_id', associationId)
      .eq('budget_year', fromYear);

    if (error) throw error;

    const newBudgetEntries = (previousBudget || []).map(entry => ({
      association_id: associationId,
      gl_account_id: entry.gl_account_id,
      budget_year: toYear,
      period_type: entry.period_type,
      period_number: entry.period_number,
      budgeted_amount: entry.budgeted_amount * (1 + adjustmentPercent / 100),
      actual_amount: 0,
      created_by: user.id
    }));

    const { error: insertError } = await supabase
      .from('budget_entries')
      .insert(newBudgetEntries);

    if (insertError) throw insertError;
  }

  static async generateBudgetTemplate(
    associationId: string,
    year: number,
    baseOnActuals: boolean = true
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get all GL accounts for the association
    const { data: glAccounts, error: glError } = await supabase
      .from('gl_accounts')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true);

    if (glError) throw glError;

    const budgetEntries = [];

    for (const account of glAccounts || []) {
      let monthlyAmount = 0;

      if (baseOnActuals) {
        // Calculate average monthly amount from previous year
        const { data: actualData } = await supabase
          .from('journal_entry_lines')
          .select(`
            debit_amount,
            credit_amount,
            journal_entries!inner(entry_date)
          `)
          .eq('gl_account_id', account.id)
          .gte('journal_entries.entry_date', `${year - 1}-01-01`)
          .lt('journal_entries.entry_date', `${year}-01-01`);

        const totalActual = (actualData || []).reduce((sum, line) => 
          sum + (line.debit_amount || 0) - (line.credit_amount || 0), 0
        );

        monthlyAmount = totalActual / 12;
      }

      // Create 12 monthly budget entries
      for (let month = 1; month <= 12; month++) {
        budgetEntries.push({
          association_id: associationId,
          gl_account_id: account.id,
          budget_year: year,
          period_type: 'monthly',
          period_number: month,
          budgeted_amount: monthlyAmount,
          actual_amount: 0,
          created_by: user.id
        });
      }
    }

    const { error: insertError } = await supabase
      .from('budget_entries')
      .insert(budgetEntries);

    if (insertError) throw insertError;
  }
}