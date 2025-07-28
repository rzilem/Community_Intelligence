// Simplified financial service with mock data to avoid database schema issues
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

class AdvancedFinancialService {
  // Mock data for development
  private mockScenarios: BudgetScenario[] = [
    {
      id: '1',
      association_id: '',
      name: 'Best Case Scenario',
      scenario_type: 'best_case',
      assumptions: { revenue_growth: 0.15 },
      adjustments: { revenue_multiplier: 1.15 },
      results: { net_income_change: 25000 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockKPIs: FinancialKPI[] = [
    {
      id: '1',
      association_id: '',
      kpi_name: 'Collection Rate',
      kpi_type: 'percentage',
      current_value: 96.5,
      target_value: 95,
      period_start: '2024-01-01',
      period_end: '2024-12-31',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockForecasts: CashFlowForecast[] = [
    {
      id: '1',
      association_id: '',
      forecast_date: '2024-02-01',
      forecast_type: 'monthly',
      opening_balance: 100000,
      projected_income: 85000,
      projected_expenses: 72000,
      closing_balance: 113000,
      confidence_level: 0.95,
      assumptions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Budget Scenarios
  async getBudgetScenarios(associationId: string): Promise<BudgetScenario[]> {
    return this.mockScenarios.map(s => ({ ...s, association_id: associationId }));
  }

  async createBudgetScenario(scenario: Omit<BudgetScenario, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetScenario> {
    const newScenario: BudgetScenario = {
      ...scenario,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockScenarios.push(newScenario);
    return newScenario;
  }

  async updateBudgetScenario(scenarioId: string, updates: Partial<BudgetScenario>): Promise<BudgetScenario> {
    const index = this.mockScenarios.findIndex(s => s.id === scenarioId);
    if (index === -1) throw new Error('Scenario not found');
    
    this.mockScenarios[index] = {
      ...this.mockScenarios[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return this.mockScenarios[index];
  }

  async runScenarioAnalysis(scenarioId: string): Promise<any> {
    const scenario = this.mockScenarios.find(s => s.id === scenarioId);
    if (!scenario) throw new Error('Scenario not found');

    const results = {
      revenue_impact: this.calculateRevenueImpact(scenario.adjustments),
      expense_impact: this.calculateExpenseImpact(scenario.adjustments),
      net_income_change: 0,
      key_metrics: {},
      risk_factors: this.identifyRiskFactors(scenario.assumptions)
    };

    results.net_income_change = results.revenue_impact - results.expense_impact;
    return results;
  }

  private calculateRevenueImpact(adjustments: Record<string, any>): number {
    return adjustments.revenue_multiplier ? adjustments.base_revenue * adjustments.revenue_multiplier : 0;
  }

  private calculateExpenseImpact(adjustments: Record<string, any>): number {
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
    return this.mockKPIs.map(k => ({ ...k, association_id: associationId }));
  }

  async createFinancialKPI(kpi: Omit<FinancialKPI, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialKPI> {
    const newKPI: FinancialKPI = {
      ...kpi,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockKPIs.push(newKPI);
    return newKPI;
  }

  async calculateKPIs(associationId: string): Promise<FinancialKPI[]> {
    return this.mockKPIs.map(k => ({ ...k, association_id: associationId }));
  }

  // Cash Flow Forecasting
  async getCashFlowForecasts(associationId: string): Promise<CashFlowForecast[]> {
    return this.mockForecasts.map(f => ({ ...f, association_id: associationId }));
  }

  async generateCashFlowForecast(
    associationId: string,
    startDate: string,
    endDate: string,
    forecastType: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<CashFlowForecast[]> {
    const forecasts: CashFlowForecast[] = [];
    const dates = this.generateForecastDates(startDate, endDate, forecastType);

    let previousBalance = 50000; // Mock starting balance

    for (const date of dates) {
      const projectedIncome = 85000 + (Math.random() - 0.5) * 10000;
      const projectedExpenses = 72000 + (Math.random() - 0.5) * 8000;
      const closingBalance = previousBalance + projectedIncome - projectedExpenses;

      const forecast: CashFlowForecast = {
        id: Date.now().toString() + Math.random(),
        association_id: associationId,
        forecast_date: date,
        forecast_type: forecastType,
        opening_balance: previousBalance,
        projected_income: projectedIncome,
        projected_expenses: projectedExpenses,
        closing_balance: closingBalance,
        confidence_level: this.calculateConfidenceLevel(date),
        assumptions: this.getDefaultAssumptions(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      forecasts.push(forecast);
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

  private calculateConfidenceLevel(date: string): number {
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
}

export const advancedFinancialService = new AdvancedFinancialService();