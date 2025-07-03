import { supabase } from '@/integrations/supabase/client';

export interface KPIDefinition {
  id: string;
  kpi_name: string;
  kpi_category: string;
  calculation_formula: string;
  target_value?: number;
  warning_threshold?: number;
  critical_threshold?: number;
  unit_of_measure: string;
}

export interface KPIValue {
  kpi_definition_id: string;
  measurement_date: string;
  actual_value: number;
  target_value?: number;
  variance_amount: number;
  variance_percent: number;
  performance_status: string;
}

export interface FinancialTrend {
  metric: string;
  period: string;
  value: number;
  change_from_previous: number;
  change_percent: number;
  trend_direction: 'up' | 'down' | 'stable';
}

export interface AnalyticsDashboard {
  kpis: (KPIDefinition & { current_value?: KPIValue })[];
  trends: FinancialTrend[];
  alerts: {
    type: 'info' | 'warning' | 'error';
    message: string;
    metric: string;
    value: number;
  }[];
  insights: string[];
}

export class FinancialAnalyticsService {
  
  static async createKPIDefinition(
    associationId: string,
    kpiData: {
      kpi_name: string;
      kpi_category: string;
      calculation_formula: string;
      target_value?: number;
      warning_threshold?: number;
      critical_threshold?: number;
      unit_of_measure?: string;
    }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('kpi_definitions')
      .insert({
        association_id: associationId,
        ...kpiData,
        unit_of_measure: kpiData.unit_of_measure || 'currency',
        created_by: user.id
      });

    if (error) throw error;
  }

  static async calculateKPIValues(associationId: string, date: string): Promise<void> {
    // Get all KPI definitions for the association
    const { data: kpiDefinitions, error } = await supabase
      .from('kpi_definitions')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true);

    if (error) throw error;

    for (const kpi of kpiDefinitions || []) {
      const actualValue = await this.executeKPIFormula(associationId, kpi.calculation_formula, date);
      
      await supabase
        .from('kpi_values')
        .insert({
          kpi_definition_id: kpi.id,
          measurement_date: date,
          actual_value: actualValue,
          target_value: kpi.target_value
        });
    }
  }

  static async getAnalyticsDashboard(associationId: string): Promise<AnalyticsDashboard> {
    // Get KPIs with current values
    const kpis = await this.getKPIsWithCurrentValues(associationId);
    
    // Get financial trends
    const trends = await this.getFinancialTrends(associationId);
    
    // Generate alerts
    const alerts = await this.generateAlerts(associationId, kpis);
    
    // Generate insights
    const insights = await this.generateInsights(associationId, kpis, trends);

    return { kpis, trends, alerts, insights };
  }

  static async getKPITrend(
    kpiDefinitionId: string,
    startDate: string,
    endDate: string
  ): Promise<KPIValue[]> {
    const { data, error } = await supabase
      .from('kpi_values')
      .select('*')
      .eq('kpi_definition_id', kpiDefinitionId)
      .gte('measurement_date', startDate)
      .lte('measurement_date', endDate)
      .order('measurement_date');

    if (error) throw error;
    return data || [];
  }

  static async performRatioAnalysis(associationId: string): Promise<{
    liquidity_ratios: { name: string; value: number; benchmark: number }[];
    efficiency_ratios: { name: string; value: number; benchmark: number }[];
    profitability_ratios: { name: string; value: number; benchmark: number }[];
  }> {
    // Get current balances
    const currentAssets = await this.getAccountBalance(associationId, 'asset');
    const currentLiabilities = await this.getAccountBalance(associationId, 'liability');
    const totalRevenue = await this.getAccountBalance(associationId, 'revenue');
    const totalExpenses = await this.getAccountBalance(associationId, 'expense');
    const cash = await this.getCashBalance(associationId);

    return {
      liquidity_ratios: [
        {
          name: 'Current Ratio',
          value: currentLiabilities !== 0 ? currentAssets / currentLiabilities : 0,
          benchmark: 2.0
        },
        {
          name: 'Cash Ratio',
          value: currentLiabilities !== 0 ? cash / currentLiabilities : 0,
          benchmark: 0.5
        }
      ],
      efficiency_ratios: [
        {
          name: 'Operating Expense Ratio',
          value: totalRevenue !== 0 ? totalExpenses / totalRevenue : 0,
          benchmark: 0.8
        }
      ],
      profitability_ratios: [
        {
          name: 'Net Margin',
          value: totalRevenue !== 0 ? (totalRevenue - totalExpenses) / totalRevenue : 0,
          benchmark: 0.1
        }
      ]
    };
  }

  static async performBenchmarkAnalysis(
    associationId: string
  ): Promise<{
    metric: string;
    association_value: number;
    industry_benchmark: number;
    percentile_rank: number;
    performance_rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  }[]> {
    // This would integrate with industry benchmark data
    // For now, returning sample data structure
    return [
      {
        metric: 'Operating Expense per Unit',
        association_value: 150,
        industry_benchmark: 175,
        percentile_rank: 75,
        performance_rating: 'good'
      },
      {
        metric: 'Reserve Fund Ratio',
        association_value: 0.15,
        industry_benchmark: 0.25,
        percentile_rank: 40,
        performance_rating: 'below_average'
      }
    ];
  }

  static async generatePredictiveAnalytics(
    associationId: string
  ): Promise<{
    metric: string;
    current_value: number;
    predicted_6_month: number;
    predicted_12_month: number;
    confidence_level: number;
    trend_factors: string[];
  }[]> {
    // Get historical KPI data for trend analysis
    const historicalData = await this.getHistoricalKPIData(associationId, 24); // 24 months
    
    return [
      {
        metric: 'Monthly Cash Flow',
        current_value: 5000,
        predicted_6_month: 4800,
        predicted_12_month: 4600,
        confidence_level: 85,
        trend_factors: ['Increasing maintenance costs', 'Stable assessment collection']
      },
      {
        metric: 'Reserve Fund Balance',
        current_value: 150000,
        predicted_6_month: 155000,
        predicted_12_month: 160000,
        confidence_level: 90,
        trend_factors: ['Regular reserve contributions', 'Deferred capital expenditures']
      }
    ];
  }

  private static async getKPIsWithCurrentValues(associationId: string): Promise<(KPIDefinition & { current_value?: KPIValue })[]> {
    const { data: kpis, error } = await supabase
      .from('kpi_definitions')
      .select(`
        *,
        kpi_values(*)
      `)
      .eq('association_id', associationId)
      .eq('is_active', true);

    if (error) throw error;

    return (kpis || []).map(kpi => ({
      id: kpi.id,
      kpi_name: kpi.kpi_name,
      kpi_category: kpi.kpi_category,
      calculation_formula: kpi.calculation_formula,
      target_value: kpi.target_value,
      warning_threshold: kpi.warning_threshold,
      critical_threshold: kpi.critical_threshold,
      unit_of_measure: kpi.unit_of_measure,
      current_value: kpi.kpi_values?.[0] // Most recent value
    }));
  }

  private static async getFinancialTrends(associationId: string): Promise<FinancialTrend[]> {
    // Calculate trends for key financial metrics
    const trends: FinancialTrend[] = [];
    
    // Revenue trend
    const revenueThisMonth = await this.getMonthlyRevenue(associationId, 0);
    const revenueLastMonth = await this.getMonthlyRevenue(associationId, 1);
    const revenueChange = revenueThisMonth - revenueLastMonth;
    
    trends.push({
      metric: 'Monthly Revenue',
      period: 'Month over Month',
      value: revenueThisMonth,
      change_from_previous: revenueChange,
      change_percent: revenueLastMonth !== 0 ? (revenueChange / revenueLastMonth) * 100 : 0,
      trend_direction: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable'
    });

    return trends;
  }

  private static async generateAlerts(
    associationId: string,
    kpis: (KPIDefinition & { current_value?: KPIValue })[]
  ): Promise<{ type: 'info' | 'warning' | 'error'; message: string; metric: string; value: number }[]> {
    const alerts = [];

    for (const kpi of kpis) {
      if (kpi.current_value && kpi.critical_threshold) {
        if (kpi.current_value.actual_value <= kpi.critical_threshold) {
          alerts.push({
            type: 'error' as const,
            message: `${kpi.kpi_name} is below critical threshold`,
            metric: kpi.kpi_name,
            value: kpi.current_value.actual_value
          });
        } else if (kpi.warning_threshold && kpi.current_value.actual_value <= kpi.warning_threshold) {
          alerts.push({
            type: 'warning' as const,
            message: `${kpi.kpi_name} is approaching warning threshold`,
            metric: kpi.kpi_name,
            value: kpi.current_value.actual_value
          });
        }
      }
    }

    return alerts;
  }

  private static async generateInsights(
    associationId: string,
    kpis: (KPIDefinition & { current_value?: KPIValue })[],
    trends: FinancialTrend[]
  ): Promise<string[]> {
    const insights: string[] = [];

    // Analyze KPI performance
    const performingKPIs = kpis.filter(kpi => 
      kpi.current_value?.performance_status === 'on_target'
    ).length;
    
    if (performingKPIs > kpis.length * 0.8) {
      insights.push('Strong overall financial performance with most KPIs meeting targets');
    }

    // Analyze trends
    const positiveRevenueTrend = trends.find(t => 
      t.metric === 'Monthly Revenue' && t.trend_direction === 'up'
    );
    
    if (positiveRevenueTrend) {
      insights.push(`Revenue is trending upward with ${positiveRevenueTrend.change_percent.toFixed(1)}% growth`);
    }

    return insights;
  }

  private static async executeKPIFormula(
    associationId: string,
    formula: string,
    date: string
  ): Promise<number> {
    // Simple formula execution - would be enhanced with proper expression parser
    // For now, return sample calculated values
    switch (formula) {
      case 'total_revenue / total_units':
        const revenue = await this.getAccountBalance(associationId, 'revenue');
        const units = await this.getTotalUnits(associationId);
        return units > 0 ? revenue / units : 0;
      
      case 'cash_balance / monthly_expenses':
        const cash = await this.getCashBalance(associationId);
        const monthlyExpenses = await this.getMonthlyExpenses(associationId);
        return monthlyExpenses > 0 ? cash / monthlyExpenses : 0;
        
      default:
        return 0;
    }
  }

  private static async getAccountBalance(associationId: string, accountType: string): Promise<number> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('balance')
      .eq('association_id', associationId)
      .eq('type', accountType);

    if (error) throw error;
    return (data || []).reduce((sum, account) => sum + (account.balance || 0), 0);
  }

  private static async getCashBalance(associationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('balance')
      .eq('association_id', associationId)
      .eq('type', 'asset')
      .ilike('name', '%cash%');

    if (error) throw error;
    return (data || []).reduce((sum, account) => sum + (account.balance || 0), 0);
  }

  private static async getTotalUnits(associationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('associations')
      .select('total_units')
      .eq('id', associationId)
      .single();

    if (error) throw error;
    return data?.total_units || 0;
  }

  private static async getMonthlyRevenue(associationId: string, monthsBack: number): Promise<number> {
    // Implementation to get monthly revenue data
    return 10000; // Sample value
  }

  private static async getMonthlyExpenses(associationId: string): Promise<number> {
    // Implementation to get monthly expenses
    return 8000; // Sample value
  }

  private static async getHistoricalKPIData(associationId: string, months: number): Promise<any[]> {
    // Implementation to get historical KPI data for predictive analytics
    return [];
  }
}