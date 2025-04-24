
// Report-related types
export interface ReportCategory {
  title: string;
  reports: string[];
}

// GL Account related types
export interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string;
  category: string;
  balance: number;
  account_number?: string;
  association_id?: string;
  is_active: boolean;
}

// Journal Entry related types
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

export interface JournalEntryDetail {
  id: string;
  journal_entry_id: string;
  gl_account_id: string;
  description?: string;
  debit: number;
  credit: number;
  gl_account?: GLAccount;
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

export interface GLAccountReconciliation {
  id: string;
  gl_account_id: string;
  statement_date: string;
  book_balance: number;
  statement_balance: number;
  is_reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: string;
  notes?: string;
}

export interface GLAccountTransaction {
  id: string;
  gl_account_id: string;
  date: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance_after: number;
  journal_entry_id?: string;
  created_at: string;
}

export interface GLAccountAuditLog {
  id: string;
  gl_account_id: string;
  action: 'create' | 'update' | 'delete';
  changed_by: string;
  changed_at: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}
