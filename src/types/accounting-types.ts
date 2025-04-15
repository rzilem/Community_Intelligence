
export interface ReportCategory {
  title: string;
  reports: string[];
}

export interface GLAccount {
  id: string;
  number: string;
  name: string;
  type: string;
  balance: number;
  code: string;
  description: string;
  category: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  status: 'draft' | 'posted' | 'reconciled';
  createdBy: string;
  createdAt: string;
  associationId?: string;
}

// Budget-related types
export interface BudgetEntry {
  id: string;
  glAccountId: string;
  monthlyAmounts: MonthlyAmount[];
  annualTotal: number;
  previousYearActual?: number;
  previousYearBudget?: number;
  notes?: string;
}

export interface MonthlyAmount {
  month: number; // 1-12 for Jan-Dec
  amount: number;
}

export interface Budget {
  id: string;
  name: string;
  year: string;
  status: 'draft' | 'approved' | 'final';
  totalRevenue: number;
  totalExpenses: number;
  createdBy: string;
  createdAt: string;
  description: string;
  associationId: string;
  fundType: 'operating' | 'reserve' | 'capital';
}

export interface GLAccountGroup {
  id: string;
  code: string;
  name: string;
  accounts: GLAccount[];
  totalBudget: number;
  totalPreviousYear: number;
  change: number;
  isExpanded: boolean;
}

export interface BudgetSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  previousYearTotalRevenue: number;
  previousYearTotalExpenses: number;
  previousYearNetIncome: number;
  revenueChange: number;
  expenseChange: number;
  netIncomeChange: number;
}

export interface BudgetPrediction {
  glAccountId: string;
  suggestedAmount: number;
  confidence: number;
  reasoning: string;
}
