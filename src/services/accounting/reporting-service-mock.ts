export interface BalanceSheetData {
  assets: { name: string; balance: number }[];
  liabilities: { name: string; balance: number }[];
  equity: { name: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface IncomeStatementData {
  revenue: { name: string; balance: number }[];
  expenses: { name: string; balance: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface CashFlowData {
  operating: { name: string; balance: number }[];
  investing: { name: string; balance: number }[];
  financing: { name: string; balance: number }[];
  totalOperating: number;
  totalInvesting: number;
  totalFinancing: number;
  netCashFlow: number;
}

export interface BudgetVarianceData {
  accountName: string;
  budgetedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePercent: number;
}

export interface FinancialReport {
  id: string;
  report_type: string;
  report_name: string;
  period_start: string;
  period_end: string;
  data: any;
  created_at: string;
}

export class ReportingService {
  // Mock data for balance sheet
  private static mockBalanceSheetData: BalanceSheetData = {
    assets: [
      { name: 'Cash - Operating', balance: 50000 },
      { name: 'Accounts Receivable', balance: 15000 },
      { name: 'Reserve Funds', balance: 100000 }
    ],
    liabilities: [
      { name: 'Accounts Payable', balance: 8000 },
      { name: 'Accrued Expenses', balance: 3000 }
    ],
    equity: [
      { name: 'Member Equity', balance: 154000 }
    ],
    totalAssets: 165000,
    totalLiabilities: 11000,
    totalEquity: 154000
  };

  // Mock data for income statement
  private static mockIncomeStatementData: IncomeStatementData = {
    revenue: [
      { name: 'Assessment Income', balance: 120000 },
      { name: 'Late Fees', balance: 2400 },
      { name: 'Interest Income', balance: 500 }
    ],
    expenses: [
      { name: 'Maintenance Expenses', balance: 45000 },
      { name: 'Utilities', balance: 18000 },
      { name: 'Insurance', balance: 12000 },
      { name: 'Management Fees', balance: 15000 }
    ],
    totalRevenue: 122900,
    totalExpenses: 90000,
    netIncome: 32900
  };

  // Mock data for cash flow
  private static mockCashFlowData: CashFlowData = {
    operating: [
      { name: 'Net Income', balance: 32900 },
      { name: 'Changes in A/R', balance: -2000 },
      { name: 'Changes in A/P', balance: 1500 }
    ],
    investing: [
      { name: 'Equipment Purchases', balance: -5000 }
    ],
    financing: [
      { name: 'Reserve Transfers', balance: -10000 }
    ],
    totalOperating: 32400,
    totalInvesting: -5000,
    totalFinancing: -10000,
    netCashFlow: 17400
  };

  // Mock reports
  private static mockReports: FinancialReport[] = [
    {
      id: '1',
      report_type: 'balance_sheet',
      report_name: 'Balance Sheet - Q3 2025',
      period_start: '2025-07-01',
      period_end: '2025-09-30',
      data: {},
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      report_type: 'income_statement',
      report_name: 'Income Statement - Q3 2025',
      period_start: '2025-07-01',
      period_end: '2025-09-30',
      data: {},
      created_at: new Date().toISOString()
    }
  ];

  static async generateBalanceSheet(associationId: string, startDate: string, endDate: string): Promise<BalanceSheetData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockBalanceSheetData;
  }

  static async generateIncomeStatement(associationId: string, startDate: string, endDate: string): Promise<IncomeStatementData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockIncomeStatementData;
  }

  static async generateCashFlowStatement(associationId: string, startDate: string, endDate: string): Promise<CashFlowData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockCashFlowData;
  }

  static async generateBudgetVarianceReport(associationId: string, startDate: string, endDate: string): Promise<BudgetVarianceData[]> {
    // Mock budget variance data
    return [
      {
        accountName: 'Assessment Income',
        budgetedAmount: 125000,
        actualAmount: 120000,
        varianceAmount: -5000,
        variancePercent: -4.0
      },
      {
        accountName: 'Maintenance Expenses',
        budgetedAmount: 40000,
        actualAmount: 45000,
        varianceAmount: 5000,
        variancePercent: 12.5
      },
      {
        accountName: 'Utilities',
        budgetedAmount: 20000,
        actualAmount: 18000,
        varianceAmount: -2000,
        variancePercent: -10.0
      }
    ];
  }

  static async getSavedReports(associationId: string): Promise<FinancialReport[]> {
    return this.mockReports;
  }

  static async saveReport(reportData: Partial<FinancialReport>): Promise<string> {
    const newReport: FinancialReport = {
      id: crypto.randomUUID(),
      report_type: reportData.report_type || 'custom',
      report_name: reportData.report_name || 'Untitled Report',
      period_start: reportData.period_start || new Date().toISOString().split('T')[0],
      period_end: reportData.period_end || new Date().toISOString().split('T')[0],
      data: reportData.data || {},
      created_at: new Date().toISOString()
    };

    this.mockReports.push(newReport);
    return newReport.id;
  }

  static async deleteReport(reportId: string): Promise<void> {
    const index = this.mockReports.findIndex(r => r.id === reportId);
    if (index !== -1) {
      this.mockReports.splice(index, 1);
    }
  }

  static async exportReport(reportId: string, format: 'pdf' | 'excel'): Promise<Uint8Array> {
    // Mock export - return empty array
    await new Promise(resolve => setTimeout(resolve, 1000));
    return new Uint8Array([]);
  }
}