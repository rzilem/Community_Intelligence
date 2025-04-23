
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
  associationId: string;  // Updated from association_id
  fundType: 'operating' | 'reserve' | 'capital';  // Updated from fund_type
  entries?: BudgetEntry[];
}

export interface BudgetEntry {
  id: string;
  glAccountId: string;  // Updated from gl_account_id
  monthlyAmounts: MonthlyAmount[];
  annualTotal: number;  // Updated from annual_total
  previousYearActual?: number;
  previousYearBudget?: number;
  notes?: string;
  budget_id?: string; // Kept for compatibility
}
