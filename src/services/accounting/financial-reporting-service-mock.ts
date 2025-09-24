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
    // Mock balance sheet data
    return {
      assets: {
        current_assets: [
          { account_name: 'Cash - Operating', account_code: '1000', balance: 50000 },
          { account_name: 'Accounts Receivable', account_code: '1100', balance: 15000 }
        ],
        fixed_assets: [
          { account_name: 'Property & Equipment', account_code: '1500', balance: 200000 }
        ],
        total_assets: 265000
      },
      liabilities: {
        current_liabilities: [
          { account_name: 'Accounts Payable', account_code: '2000', balance: 8000 }
        ],
        long_term_liabilities: [
          { account_name: 'Long-term Debt', account_code: '2500', balance: 50000 }
        ],
        total_liabilities: 58000
      },
      equity: {
        equity_accounts: [
          { account_name: 'Member Equity', account_code: '3000', balance: 207000 }
        ],
        total_equity: 207000
      }
    };
  }

  static async generateIncomeStatement(
    associationId: string, 
    startDate: string, 
    endDate: string
  ): Promise<IncomeStatementData> {
    // Mock income statement data
    return {
      revenue: {
        operating_revenue: [
          { account_name: 'Assessment Income', account_code: '4000', balance: 120000 },
          { account_name: 'Late Fee Income', account_code: '4100', balance: 2500 }
        ],
        other_revenue: [
          { account_name: 'Interest Income', account_code: '4500', balance: 500 }
        ],
        total_revenue: 123000
      },
      expenses: {
        operating_expenses: [
          { account_name: 'Maintenance Expenses', account_code: '6000', balance: 45000 },
          { account_name: 'Utilities', account_code: '6010', balance: 15000 }
        ],
        administrative_expenses: [
          { account_name: 'Management Fees', account_code: '6100', balance: 12000 },
          { account_name: 'Insurance', account_code: '6110', balance: 8000 }
        ],
        total_expenses: 80000
      },
      net_income: 43000
    };
  }

  static async generateCashFlowStatement(
    associationId: string,
    startDate: string,
    endDate: string
  ): Promise<CashFlowData> {
    // Get net income from income statement
    const incomeStatement = await this.generateIncomeStatement(associationId, startDate, endDate);
    const netIncome = incomeStatement.net_income;
    
    return {
      operating_activities: {
        net_income: netIncome,
        adjustments: [
          { description: 'Depreciation', amount: 5000 },
          { description: 'Changes in Receivables', amount: -2000 },
          { description: 'Changes in Payables', amount: 1000 }
        ],
        cash_from_operations: netIncome + 4000
      },
      investing_activities: {
        activities: [
          { description: 'Property & Equipment Purchases', amount: -10000 }
        ],
        cash_from_investing: -10000
      },
      financing_activities: {
        activities: [
          { description: 'Loan Proceeds', amount: 0 },
          { description: 'Loan Payments', amount: -5000 }
        ],
        cash_from_financing: -5000
      },
      net_change_in_cash: netIncome + 4000 - 10000 - 5000
    };
  }

  static async generateBudgetVarianceReport(
    associationId: string,
    budgetYear: number
  ): Promise<BudgetVarianceData> {
    // Mock budget variance data
    const accounts = [
      {
        account_code: '4000',
        account_name: 'Assessment Income',
        budget_amount: 120000,
        actual_amount: 118000,
        variance_amount: -2000,
        variance_percentage: -1.67
      },
      {
        account_code: '6000',
        account_name: 'Maintenance Expenses',
        budget_amount: 50000,
        actual_amount: 45000,
        variance_amount: -5000,
        variance_percentage: -10.0
      }
    ];

    const totalBudget = accounts.reduce((sum, acc) => sum + acc.budget_amount, 0);
    const totalActual = accounts.reduce((sum, acc) => sum + acc.actual_amount, 0);
    const totalVariance = totalActual - totalBudget;
    const totalVariancePercentage = totalBudget !== 0 ? (totalVariance / totalBudget) * 100 : 0;

    return {
      accounts,
      summary: {
        total_budget: totalBudget,
        total_actual: totalActual,
        total_variance: totalVariance,
        variance_percentage: totalVariancePercentage
      }
    };
  }

  static async exportToExcel(reportData: any, reportType: string): Promise<void> {
    console.log(`Mock: Exporting ${reportType} to Excel:`, reportData);
  }

  static async exportToPDF(reportData: any, reportType: string): Promise<void> {
    console.log(`Mock: Exporting ${reportType} to PDF:`, reportData);
  }
}