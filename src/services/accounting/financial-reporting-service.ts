import { supabase } from '@/integrations/supabase/client';

export interface BalanceSheetData {
  assets: {
    current_assets: Array<{ account_name: string; account_code: string; balance: number }>;
    fixed_assets: Array<{ account_name: string; account_code: string; balance: number }>;
    total_assets: number;
  };
  liabilities: {
    current_liabilities: Array<{ account_name: string; account_code: string; balance: number }>;
    long_term_liabilities: Array<{ account_name: string; account_code: string; balance: number }>;
    total_liabilities: number;
  };
  equity: {
    equity_accounts: Array<{ account_name: string; account_code: string; balance: number }>;
    total_equity: number;
  };
}

export interface IncomeStatementData {
  revenue: {
    operating_revenue: Array<{ account_name: string; account_code: string; balance: number }>;
    other_revenue: Array<{ account_name: string; account_code: string; balance: number }>;
    total_revenue: number;
  };
  expenses: {
    operating_expenses: Array<{ account_name: string; account_code: string; balance: number }>;
    administrative_expenses: Array<{ account_name: string; account_code: string; balance: number }>;
    total_expenses: number;
  };
  net_income: number;
}

export interface CashFlowData {
  operating_activities: {
    net_income: number;
    adjustments: Array<{ description: string; amount: number }>;
    cash_from_operations: number;
  };
  investing_activities: {
    activities: Array<{ description: string; amount: number }>;
    cash_from_investing: number;
  };
  financing_activities: {
    activities: Array<{ description: string; amount: number }>;
    cash_from_financing: number;
  };
  net_change_in_cash: number;
}

export interface BudgetVarianceData {
  accounts: Array<{
    account_code: string;
    account_name: string;
    budget_amount: number;
    actual_amount: number;
    variance_amount: number;
    variance_percentage: number;
  }>;
  summary: {
    total_budget: number;
    total_actual: number;
    total_variance: number;
    variance_percentage: number;
  };
}

export class FinancialReportingService {
  
  static async generateBalanceSheet(associationId: string, asOfDate: string): Promise<BalanceSheetData> {
    const { data: accounts, error } = await supabase
      .from('gl_accounts_enhanced')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('account_code');

    if (error) throw error;

    const assets = accounts?.filter(acc => acc.account_type === 'asset') || [];
    const liabilities = accounts?.filter(acc => acc.account_type === 'liability') || [];
    const equity = accounts?.filter(acc => acc.account_type === 'equity') || [];

    const currentAssets = assets.filter(acc => acc.account_subtype?.includes('current') || acc.account_code.startsWith('1'));
    const fixedAssets = assets.filter(acc => !acc.account_subtype?.includes('current') && !acc.account_code.startsWith('1'));
    
    const currentLiabilities = liabilities.filter(acc => acc.account_subtype?.includes('current') || acc.account_code.startsWith('2'));
    const longTermLiabilities = liabilities.filter(acc => !acc.account_subtype?.includes('current') && !acc.account_code.startsWith('2'));

    const totalAssets = assets.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const totalEquity = equity.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

    return {
      assets: {
        current_assets: currentAssets.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        fixed_assets: fixedAssets.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        total_assets: totalAssets
      },
      liabilities: {
        current_liabilities: currentLiabilities.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        long_term_liabilities: longTermLiabilities.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        total_liabilities: totalLiabilities
      },
      equity: {
        equity_accounts: equity.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        total_equity: totalEquity
      }
    };
  }

  static async generateIncomeStatement(
    associationId: string, 
    startDate: string, 
    endDate: string
  ): Promise<IncomeStatementData> {
    const { data: accounts, error } = await supabase
      .from('gl_accounts_enhanced')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .in('account_type', ['revenue', 'expense'])
      .order('account_code');

    if (error) throw error;

    const revenueAccounts = accounts?.filter(acc => acc.account_type === 'revenue') || [];
    const expenseAccounts = accounts?.filter(acc => acc.account_type === 'expense') || [];

    const operatingRevenue = revenueAccounts.filter(acc => acc.account_subtype === 'operating' || acc.account_code.startsWith('4'));
    const otherRevenue = revenueAccounts.filter(acc => acc.account_subtype !== 'operating' && !acc.account_code.startsWith('4'));
    
    const operatingExpenses = expenseAccounts.filter(acc => acc.account_subtype === 'operating' || acc.account_code.startsWith('5'));
    const adminExpenses = expenseAccounts.filter(acc => acc.account_subtype === 'administrative' || acc.account_code.startsWith('6'));

    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

    return {
      revenue: {
        operating_revenue: operatingRevenue.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        other_revenue: otherRevenue.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        total_revenue: totalRevenue
      },
      expenses: {
        operating_expenses: operatingExpenses.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        administrative_expenses: adminExpenses.map(acc => ({
          account_name: acc.account_name,
          account_code: acc.account_code,
          balance: acc.current_balance || 0
        })),
        total_expenses: totalExpenses
      },
      net_income: totalRevenue - totalExpenses
    };
  }

  static async generateCashFlowStatement(
    associationId: string,
    startDate: string,
    endDate: string
  ): Promise<CashFlowData> {
    // Get net income from income statement
    const incomeStatement = await this.generateIncomeStatement(associationId, startDate, endDate);
    
    // Simplified cash flow calculation - in real implementation, would analyze cash accounts
    const netIncome = incomeStatement.net_income;
    
    return {
      operating_activities: {
        net_income: netIncome,
        adjustments: [
          { description: 'Depreciation', amount: 0 },
          { description: 'Changes in Receivables', amount: 0 },
          { description: 'Changes in Payables', amount: 0 }
        ],
        cash_from_operations: netIncome
      },
      investing_activities: {
        activities: [
          { description: 'Property & Equipment Purchases', amount: 0 }
        ],
        cash_from_investing: 0
      },
      financing_activities: {
        activities: [
          { description: 'Loan Proceeds', amount: 0 },
          { description: 'Loan Payments', amount: 0 }
        ],
        cash_from_financing: 0
      },
      net_change_in_cash: netIncome
    };
  }

  static async generateBudgetVarianceReport(
    associationId: string,
    budgetYear: number
  ): Promise<BudgetVarianceData> {
    const { data: accounts, error } = await supabase
      .from('gl_accounts_enhanced')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('account_code');

    if (error) throw error;

    // Get budget data - placeholder implementation
    const accountsWithVariance = accounts?.map(acc => {
      const budgetAmount = Math.abs(acc.current_balance || 0) * 1.1; // Placeholder - would come from budget table
      const actualAmount = acc.current_balance || 0;
      const varianceAmount = actualAmount - budgetAmount;
      const variancePercentage = budgetAmount > 0 ? (varianceAmount / budgetAmount) * 100 : 0;

      return {
        account_code: acc.account_code,
        account_name: acc.account_name,
        budget_amount: budgetAmount,
        actual_amount: actualAmount,
        variance_amount: varianceAmount,
        variance_percentage: variancePercentage
      };
    }) || [];

    const totalBudget = accountsWithVariance.reduce((sum, acc) => sum + acc.budget_amount, 0);
    const totalActual = accountsWithVariance.reduce((sum, acc) => sum + acc.actual_amount, 0);
    const totalVariance = totalActual - totalBudget;
    const totalVariancePercentage = totalBudget !== 0 ? (totalVariance / totalBudget) * 100 : 0;

    return {
      accounts: accountsWithVariance,
      summary: {
        total_budget: totalBudget,
        total_actual: totalActual,
        total_variance: totalVariance,
        variance_percentage: totalVariancePercentage
      }
    };
  }

  static async exportToExcel(reportData: any, reportType: string): Promise<void> {
    // Placeholder for Excel export functionality
    // Would use a library like xlsx or similar
    console.log(`Exporting ${reportType} to Excel:`, reportData);
  }

  static async exportToPDF(reportData: any, reportType: string): Promise<void> {
    // Placeholder for PDF export functionality
    // Would use a library like jsPDF or similar
    console.log(`Exporting ${reportType} to PDF:`, reportData);
  }
}