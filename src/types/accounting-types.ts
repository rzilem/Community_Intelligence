
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
