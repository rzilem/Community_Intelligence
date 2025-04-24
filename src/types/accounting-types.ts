
export interface BudgetSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  changeFromLastYear: number;
  changePercentage: number;
  insights: string[];
  previousYearTotalRevenue?: number;
  previousYearTotalExpenses?: number;
  previousYearNetIncome?: number;
  revenueChange?: number;
  expenseChange?: number;
  netIncomeChange?: number;
}

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Income" | "Expense";
  category?: string;
  balance?: number;
  account_number?: string;
  is_active: boolean;
  association_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GLAccountGroup {
  id: string;
  name: string;
  accounts: GLAccount[];
  total: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  amount: number;
  debit_accounts?: any[];
  credit_accounts?: any[];
  status: 'draft' | 'posted' | 'voided';
  createdBy: string;
  created_at?: string;
  updated_at?: string;
  associationId?: string;
}

export interface Budget {
  id: string;
  name: string;
  year: string;
  status: 'draft' | 'approved' | 'final';
  fundType: 'operating' | 'reserve' | 'capital';
  description?: string;
  totalRevenue?: number;
  totalExpenses?: number;
  association_id?: string;
  associationId?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  createdBy?: string;
}

export interface BudgetEntry {
  id?: string;
  budget_id?: string;
  budgetId?: string;
  gl_account_id?: string;
  glAccountId?: string;
  annual_total?: number;
  annualTotal?: number;
  monthly_amounts?: any;
  monthlyAmounts?: any;
  previous_year_budget?: number;
  previousYearBudget?: number;
  previous_year_actual?: number;
  previousYearActual?: number;
  notes?: string;
  gl_account?: GLAccount;
  glAccount?: GLAccount;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetPrediction {
  year: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  lineItems: {
    accountId: string;
    accountName: string;
    amount: number;
    percentChange: number;
  }[];
  insights: string[];
}

export interface ReportCategory {
  title: string;
  reports: string[];
  description?: string;
}
