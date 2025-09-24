export interface BudgetEntry {
  id: string;
  association_id: string;
  gl_account_id: string;
  budget_year: number;
  period_number: number;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percent: number;
  created_at: string;
  updated_at: string;
}

export class BudgetService {
  static async getBudgetEntries(associationId: string, budgetYear: number): Promise<BudgetEntry[]> {
    // Mock budget entries
    return [
      {
        id: '1',
        association_id: associationId,
        gl_account_id: 'gl-1',
        budget_year: budgetYear,
        period_number: 1,
        budgeted_amount: 10000.00,
        actual_amount: 9500.00,
        variance_amount: -500.00,
        variance_percent: -5.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  static async createBudgetEntry(data: any): Promise<BudgetEntry> {
    return {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async updateBudgetEntry(id: string, data: any): Promise<BudgetEntry> {
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  static async deleteBudgetEntry(id: string): Promise<void> {
    console.log('Mock: Deleting budget entry:', id);
  }

  static async generateBudgetVarianceReport(associationId: string, budgetYear: number): Promise<any> {
    return {
      total_budgeted: 120000.00,
      total_actual: 115000.00,
      total_variance: -5000.00,
      variance_percentage: -4.17,
      entries: await this.getBudgetEntries(associationId, budgetYear)
    };
  }
}