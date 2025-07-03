import { supabase } from '@/integrations/supabase/client';

export interface FinancialReport {
  id: string;
  report_type: string;
  report_name: string;
  period_start: string;
  period_end: string;
  report_data: any;
  generated_at: string;
}

export interface ProfitLossData {
  revenue: { name: string; amount: number }[];
  expenses: { name: string; amount: number }[];
  total_revenue: number;
  total_expenses: number;
  net_income: number;
}

export interface BalanceSheetData {
  assets: { name: string; amount: number }[];
  liabilities: { name: string; amount: number }[];
  equity: { name: string; amount: number }[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

export interface CashFlowData {
  operating_activities: { name: string; amount: number }[];
  investing_activities: { name: string; amount: number }[];
  financing_activities: { name: string; amount: number }[];
  net_cash_flow: number;
}

export class ReportingService {
  
  static async generateProfitLossReport(
    associationId: string,
    startDate: string,
    endDate: string
  ): Promise<ProfitLossData> {
    // Get revenue accounts
    const { data: revenueAccounts, error: revenueError } = await supabase
      .from('gl_accounts')
      .select('id, name, balance')
      .eq('association_id', associationId)
      .eq('type', 'revenue');

    if (revenueError) throw revenueError;

    // Get expense accounts
    const { data: expenseAccounts, error: expenseError } = await supabase
      .from('gl_accounts')
      .select('id, name, balance')
      .eq('association_id', associationId)
      .eq('type', 'expense');

    if (expenseError) throw expenseError;

    const revenue = (revenueAccounts || []).map(account => ({
      name: account.name,
      amount: Math.abs(account.balance || 0)
    }));

    const expenses = (expenseAccounts || []).map(account => ({
      name: account.name,
      amount: account.balance || 0
    }));

    const total_revenue = revenue.reduce((sum, item) => sum + item.amount, 0);
    const total_expenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const net_income = total_revenue - total_expenses;

    const reportData: ProfitLossData = {
      revenue,
      expenses,
      total_revenue,
      total_expenses,
      net_income
    };

    // Cache the report
    await this.cacheReport(
      associationId,
      'profit_loss',
      'Profit & Loss Statement',
      startDate,
      endDate,
      reportData
    );

    return reportData;
  }

  static async generateBalanceSheetReport(
    associationId: string,
    asOfDate: string
  ): Promise<BalanceSheetData> {
    // Get asset accounts
    const { data: assetAccounts, error: assetError } = await supabase
      .from('gl_accounts')
      .select('id, name, balance')
      .eq('association_id', associationId)
      .eq('type', 'asset');

    if (assetError) throw assetError;

    // Get liability accounts
    const { data: liabilityAccounts, error: liabilityError } = await supabase
      .from('gl_accounts')
      .select('id, name, balance')
      .eq('association_id', associationId)
      .eq('type', 'liability');

    if (liabilityError) throw liabilityError;

    // Get equity accounts
    const { data: equityAccounts, error: equityError } = await supabase
      .from('gl_accounts')
      .select('id, name, balance')
      .eq('association_id', associationId)
      .eq('type', 'equity');

    if (equityError) throw equityError;

    const assets = (assetAccounts || []).map(account => ({
      name: account.name,
      amount: account.balance || 0
    }));

    const liabilities = (liabilityAccounts || []).map(account => ({
      name: account.name,
      amount: Math.abs(account.balance || 0)
    }));

    const equity = (equityAccounts || []).map(account => ({
      name: account.name,
      amount: Math.abs(account.balance || 0)
    }));

    const total_assets = assets.reduce((sum, item) => sum + item.amount, 0);
    const total_liabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
    const total_equity = equity.reduce((sum, item) => sum + item.amount, 0);

    const reportData: BalanceSheetData = {
      assets,
      liabilities,
      equity,
      total_assets,
      total_liabilities,
      total_equity
    };

    // Cache the report
    await this.cacheReport(
      associationId,
      'balance_sheet',
      'Balance Sheet',
      asOfDate,
      asOfDate,
      reportData
    );

    return reportData;
  }

  static async generateCashFlowReport(
    associationId: string,
    startDate: string,
    endDate: string
  ): Promise<CashFlowData> {
    // Get cash flow data from journal entries
    const { data: journalEntries, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines(*)
      `)
      .eq('association_id', associationId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);

    if (error) throw error;

    // Categorize cash flows (simplified logic)
    const operating_activities = [
      { name: 'Net Income', amount: 0 },
      { name: 'Assessment Collections', amount: 0 },
      { name: 'Operating Expenses', amount: 0 }
    ];

    const investing_activities = [
      { name: 'Equipment Purchases', amount: 0 },
      { name: 'Investment Income', amount: 0 }
    ];

    const financing_activities = [
      { name: 'Loan Proceeds', amount: 0 },
      { name: 'Loan Payments', amount: 0 }
    ];

    // Calculate net cash flow
    const operating_total = operating_activities.reduce((sum, item) => sum + item.amount, 0);
    const investing_total = investing_activities.reduce((sum, item) => sum + item.amount, 0);
    const financing_total = financing_activities.reduce((sum, item) => sum + item.amount, 0);

    const reportData: CashFlowData = {
      operating_activities,
      investing_activities,
      financing_activities,
      net_cash_flow: operating_total + investing_total + financing_total
    };

    // Cache the report
    await this.cacheReport(
      associationId,
      'cash_flow',
      'Cash Flow Statement',
      startDate,
      endDate,
      reportData
    );

    return reportData;
  }

  static async getVarianceReport(
    associationId: string,
    year: number
  ): Promise<any> {
    const { data: budgetEntries, error } = await supabase
      .from('budget_entries')
      .select(`
        *,
        gl_accounts(name, code)
      `)
      .eq('association_id', associationId)
      .eq('budget_year', year);

    if (error) throw error;

    return (budgetEntries || []).map(entry => ({
      account_code: entry.gl_accounts?.code,
      account_name: entry.gl_accounts?.name,
      budgeted_amount: entry.budgeted_amount,
      actual_amount: entry.actual_amount,
      variance_amount: entry.variance_amount,
      variance_percent: entry.variance_percent
    }));
  }

  static async getCachedReport(
    associationId: string,
    reportType: string,
    startDate: string,
    endDate: string
  ): Promise<FinancialReport | null> {
    const { data, error } = await supabase
      .from('financial_reports')
      .select('*')
      .eq('association_id', associationId)
      .eq('report_type', reportType)
      .eq('period_start', startDate)
      .eq('period_end', endDate)
      .gte('expires_at', new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  private static async cacheReport(
    associationId: string,
    reportType: string,
    reportName: string,
    startDate: string,
    endDate: string,
    reportData: any
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

    await supabase
      .from('financial_reports')
      .insert({
        association_id: associationId,
        report_type: reportType,
        report_name: reportName,
        period_start: startDate,
        period_end: endDate,
        report_data: reportData,
        is_cached: true,
        generated_by: user.id,
        expires_at: expiresAt.toISOString()
      });
  }

  static async scheduleReport(
    associationId: string,
    reportType: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<void> {
    // Implementation for report scheduling
    // This would integrate with a job scheduler
    console.log(`Scheduling ${reportType} report for ${associationId} - ${schedule}`);
  }
}