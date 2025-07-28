import { supabase } from '@/integrations/supabase/client';

export interface BudgetScenario {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  base_budget_id?: string;
  scenario_type: 'what_if' | 'best_case' | 'worst_case' | 'baseline';
  assumptions: Record<string, any>;
  adjustments: Record<string, any>;
  results: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialKPI {
  id: string;
  association_id: string;
  kpi_name: string;
  kpi_type: 'ratio' | 'percentage' | 'currency' | 'count';
  current_value?: number;
  target_value?: number;
  period_start: string;
  period_end: string;
  calculation_method?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CashFlowForecast {
  id: string;
  association_id: string;
  forecast_date: string;
  forecast_type: 'monthly' | 'quarterly' | 'yearly';
  opening_balance: number;
  projected_income: number;
  projected_expenses: number;
  closing_balance: number;
  confidence_level?: number;
  assumptions: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialBenchmark {
  id: string;
  association_id: string;
  benchmark_type: string;
  metric_name: string;
  association_value?: number;
  benchmark_value?: number;
  variance_percentage?: number;
  peer_group?: string;
  period_start: string;
  period_end: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AutomatedJournalEntry {
  id: string;
  association_id: string;
  template_name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_run_date?: string;
  last_run_date?: string;
  journal_entry_template: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

class AdvancedFinancialService {
  // Budget Scenarios
  async getBudgetScenarios(associationId: string): Promise<BudgetScenario[]> {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createBudgetScenario(scenario: Omit<BudgetScenario, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetScenario> {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .insert(scenario)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBudgetScenario(scenarioId: string, updates: Partial<BudgetScenario>): Promise<BudgetScenario> {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .update(updates)
      .eq('id', scenarioId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async runScenarioAnalysis(scenarioId: string): Promise<any> {
    const scenario = await this.getBudgetScenario(scenarioId);
    if (!scenario) throw new Error('Scenario not found');

    // Perform scenario calculations based on assumptions and adjustments
    const results = {
      revenue_impact: this.calculateRevenueImpact(scenario.adjustments),
      expense_impact: this.calculateExpenseImpact(scenario.adjustments),
      net_income_change: 0,
      key_metrics: {},
      risk_factors: this.identifyRiskFactors(scenario.assumptions)
    };

    results.net_income_change = results.revenue_impact - results.expense_impact;

    // Update scenario with results
    await this.updateBudgetScenario(scenarioId, { results });

    return results;
  }

  private calculateRevenueImpact(adjustments: Record<string, any>): number {
    // Implement revenue impact calculation logic
    return adjustments.revenue_multiplier ? adjustments.base_revenue * adjustments.revenue_multiplier : 0;
  }

  private calculateExpenseImpact(adjustments: Record<string, any>): number {
    // Implement expense impact calculation logic
    return adjustments.expense_multiplier ? adjustments.base_expenses * adjustments.expense_multiplier : 0;
  }

  private identifyRiskFactors(assumptions: Record<string, any>): string[] {
    const risks: string[] = [];
    
    if (assumptions.occupancy_rate && assumptions.occupancy_rate < 0.9) {
      risks.push('Low occupancy rate assumptions');
    }
    
    if (assumptions.expense_growth && assumptions.expense_growth > 0.05) {
      risks.push('High expense growth rate');
    }

    return risks;
  }

  // Financial KPIs
  async getFinancialKPIs(associationId: string): Promise<FinancialKPI[]> {
    const { data, error } = await supabase
      .from('financial_kpis')
      .select('*')
      .eq('association_id', associationId)
      .order('kpi_name');

    if (error) throw error;
    return data || [];
  }

  async createFinancialKPI(kpi: Omit<FinancialKPI, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialKPI> {
    const { data, error } = await supabase
      .from('financial_kpis')
      .insert(kpi)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async calculateKPIs(associationId: string): Promise<FinancialKPI[]> {
    const kpis = await this.getFinancialKPIs(associationId);
    const updatedKPIs: FinancialKPI[] = [];

    for (const kpi of kpis) {
      const currentValue = await this.calculateKPIValue(kpi);
      const updatedKPI = await this.updateFinancialKPI(kpi.id, { current_value: currentValue });
      updatedKPIs.push(updatedKPI);
    }

    return updatedKPIs;
  }

  private async calculateKPIValue(kpi: FinancialKPI): Promise<number> {
    // Implement KPI calculation logic based on type
    switch (kpi.kpi_name) {
      case 'Collection Rate':
        return await this.calculateCollectionRate(kpi.association_id, kpi.period_start, kpi.period_end);
      case 'Operating Expense Ratio':
        return await this.calculateOperatingExpenseRatio(kpi.association_id, kpi.period_start, kpi.period_end);
      case 'Reserve Fund Ratio':
        return await this.calculateReserveFundRatio(kpi.association_id);
      default:
        return 0;
    }
  }

  private async calculateCollectionRate(associationId: string, startDate: string, endDate: string): Promise<number> {
    // Calculate assessment collection rate
    const { data: assessments } = await supabase
      .from('assessments')
      .select('amount, paid')
      .gte('due_date', startDate)
      .lte('due_date', endDate);

    if (!assessments?.length) return 0;

    const totalAssessed = assessments.reduce((sum, a) => sum + a.amount, 0);
    const totalCollected = assessments.filter(a => a.paid).reduce((sum, a) => sum + a.amount, 0);

    return totalAssessed > 0 ? (totalCollected / totalAssessed) * 100 : 0;
  }

  private async calculateOperatingExpenseRatio(associationId: string, startDate: string, endDate: string): Promise<number> {
    // Calculate operating expense ratio
    // This would need actual transaction data
    return 0.75; // Placeholder
  }

  private async calculateReserveFundRatio(associationId: string): Promise<number> {
    // Calculate reserve fund as percentage of annual budget
    return 0.25; // Placeholder
  }

  // Cash Flow Forecasting
  async getCashFlowForecasts(associationId: string): Promise<CashFlowForecast[]> {
    const { data, error } = await supabase
      .from('cash_flow_forecasts')
      .select('*')
      .eq('association_id', associationId)
      .order('forecast_date');

    if (error) throw error;
    return data || [];
  }

  async generateCashFlowForecast(
    associationId: string,
    startDate: string,
    endDate: string,
    forecastType: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<CashFlowForecast[]> {
    const forecasts: CashFlowForecast[] = [];
    const dates = this.generateForecastDates(startDate, endDate, forecastType);

    let previousBalance = await this.getCurrentCashBalance(associationId);

    for (const date of dates) {
      const projectedIncome = await this.projectIncome(associationId, date, forecastType);
      const projectedExpenses = await this.projectExpenses(associationId, date, forecastType);
      const closingBalance = previousBalance + projectedIncome - projectedExpenses;

      const forecast: Omit<CashFlowForecast, 'id' | 'created_at' | 'updated_at'> = {
        association_id: associationId,
        forecast_date: date,
        forecast_type: forecastType,
        opening_balance: previousBalance,
        projected_income: projectedIncome,
        projected_expenses: projectedExpenses,
        closing_balance: closingBalance,
        confidence_level: this.calculateConfidenceLevel(date),
        assumptions: this.getDefaultAssumptions()
      };

      const { data, error } = await supabase
        .from('cash_flow_forecasts')
        .insert(forecast)
        .select()
        .single();

      if (error) throw error;
      forecasts.push(data);

      previousBalance = closingBalance;
    }

    return forecasts;
  }

  private generateForecastDates(startDate: string, endDate: string, type: 'monthly' | 'quarterly' | 'yearly'): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      
      switch (type) {
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarterly':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    
    return dates;
  }

  private async getCurrentCashBalance(associationId: string): Promise<number> {
    // Get current cash balance from bank accounts or financial records
    return 50000; // Placeholder
  }

  private async projectIncome(associationId: string, date: string, type: string): Promise<number> {
    // Project income based on historical data and trends
    return 25000; // Placeholder
  }

  private async projectExpenses(associationId: string, date: string, type: string): Promise<number> {
    // Project expenses based on historical data and trends
    return 20000; // Placeholder
  }

  private calculateConfidenceLevel(date: string): number {
    // Calculate confidence level based on how far out the forecast is
    const now = new Date();
    const forecastDate = new Date(date);
    const monthsOut = (forecastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return Math.max(0.5, 1 - (monthsOut * 0.1));
  }

  private getDefaultAssumptions(): Record<string, any> {
    return {
      assessment_collection_rate: 0.95,
      expense_growth_rate: 0.03,
      emergency_reserve_target: 0.25
    };
  }

  // Helper methods
  private async getBudgetScenario(scenarioId: string): Promise<BudgetScenario | null> {
    const { data, error } = await supabase
      .from('budget_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  private async updateFinancialKPI(kpiId: string, updates: Partial<FinancialKPI>): Promise<FinancialKPI> {
    const { data, error } = await supabase
      .from('financial_kpis')
      .update(updates)
      .eq('id', kpiId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const advancedFinancialService = new AdvancedFinancialService();