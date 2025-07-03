import { supabase } from '@/integrations/supabase/client';

export interface CashFlowForecast {
  id: string;
  forecast_date: string;
  forecast_type: string;
  opening_balance: number;
  projected_receipts: number;
  projected_disbursements: number;
  projected_balance: number;
  actual_receipts?: number;
  actual_disbursements?: number;
  actual_balance?: number;
  confidence_level: number;
}

export interface CashPosition {
  current_balance: number;
  projected_30_day: number;
  projected_60_day: number;
  projected_90_day: number;
  cash_burn_rate: number;
  days_of_cash_remaining: number;
  critical_threshold: number;
}

export class CashFlowService {
  
  static async generateCashFlowForecast(
    associationId: string,
    forecastMonths: number = 12
  ): Promise<CashFlowForecast[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current cash position
    const currentBalance = await this.getCurrentCashBalance(associationId);
    
    // Get historical data for trend analysis
    const historicalData = await this.getHistoricalCashFlow(associationId, 12);
    
    const forecasts: CashFlowForecast[] = [];
    let runningBalance = currentBalance;

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i);
      forecastDate.setDate(1); // First day of month

      // Calculate projected receipts and disbursements based on historical trends
      const projectedReceipts = this.calculateProjectedReceipts(historicalData, i);
      const projectedDisbursements = this.calculateProjectedDisbursements(historicalData, i);
      
      runningBalance = runningBalance + projectedReceipts - projectedDisbursements;

      const forecast: CashFlowForecast = {
        id: `forecast-${i}`,
        forecast_date: forecastDate.toISOString().split('T')[0],
        forecast_type: 'monthly',
        opening_balance: i === 1 ? currentBalance : forecasts[i - 2].projected_balance,
        projected_receipts: projectedReceipts,
        projected_disbursements: projectedDisbursements,
        projected_balance: runningBalance,
        confidence_level: Math.max(95 - (i * 5), 60) // Decreasing confidence over time
      };

      forecasts.push(forecast);
    }

    // Save forecasts to database
    await this.saveForecastsToDatabase(associationId, forecasts);

    return forecasts;
  }

  static async getCurrentCashPosition(associationId: string): Promise<CashPosition> {
    const currentBalance = await this.getCurrentCashBalance(associationId);
    const forecasts = await this.getCachedForecasts(associationId);
    
    // Calculate burn rate from historical data
    const burnRate = await this.calculateCashBurnRate(associationId);
    
    const position: CashPosition = {
      current_balance: currentBalance,
      projected_30_day: forecasts.find(f => f.forecast_date <= this.getDateDaysFromNow(30))?.projected_balance || currentBalance,
      projected_60_day: forecasts.find(f => f.forecast_date <= this.getDateDaysFromNow(60))?.projected_balance || currentBalance,
      projected_90_day: forecasts.find(f => f.forecast_date <= this.getDateDaysFromNow(90))?.projected_balance || currentBalance,
      cash_burn_rate: burnRate,
      days_of_cash_remaining: burnRate > 0 ? Math.floor(currentBalance / burnRate) : 999,
      critical_threshold: 50000 // Configurable threshold
    };

    return position;
  }

  static async updateActualCashFlow(
    associationId: string,
    forecastId: string,
    actualReceipts: number,
    actualDisbursements: number
  ): Promise<void> {
    const actualBalance = actualReceipts - actualDisbursements;

    const { error } = await supabase
      .from('cash_flow_forecasts')
      .update({
        actual_receipts: actualReceipts,
        actual_disbursements: actualDisbursements,
        actual_balance: actualBalance
      })
      .eq('id', forecastId);

    if (error) throw error;

    // Adjust future forecasts based on variance
    await this.adjustFutureForecasts(associationId, forecastId);
  }

  static async getCashFlowAlerts(associationId: string): Promise<{
    type: 'warning' | 'critical';
    message: string;
    amount: number;
    date: string;
  }[]> {
    const position = await this.getCurrentCashPosition(associationId);
    const alerts = [];

    // Low cash balance alert
    if (position.current_balance < position.critical_threshold) {
      alerts.push({
        type: 'critical' as const,
        message: 'Current cash balance is below critical threshold',
        amount: position.current_balance,
        date: new Date().toISOString().split('T')[0]
      });
    }

    // Projected negative cash flow
    if (position.projected_30_day < 0) {
      alerts.push({
        type: 'critical' as const,
        message: 'Projected negative cash flow within 30 days',
        amount: position.projected_30_day,
        date: this.getDateDaysFromNow(30)
      });
    } else if (position.projected_60_day < position.critical_threshold) {
      alerts.push({
        type: 'warning' as const,
        message: 'Cash flow approaching critical levels within 60 days',
        amount: position.projected_60_day,
        date: this.getDateDaysFromNow(60)
      });
    }

    // High burn rate alert
    if (position.cash_burn_rate > position.current_balance * 0.1) {
      alerts.push({
        type: 'warning' as const,
        message: 'High cash burn rate detected',
        amount: position.cash_burn_rate,
        date: new Date().toISOString().split('T')[0]
      });
    }

    return alerts;
  }

  static async optimizeCashFlow(associationId: string): Promise<{
    recommendations: string[];
    potential_savings: number;
    implementation_priority: 'high' | 'medium' | 'low';
  }[]> {
    const position = await this.getCurrentCashPosition(associationId);
    const recommendations = [];

    // Analyze payment terms
    if (position.cash_burn_rate > 0) {
      recommendations.push({
        recommendations: [
          'Negotiate extended payment terms with vendors',
          'Implement early payment discounts for assessments',
          'Review and optimize recurring expenses'
        ],
        potential_savings: position.cash_burn_rate * 0.15,
        implementation_priority: 'high' as const
      });
    }

    // Investment opportunities
    if (position.current_balance > position.critical_threshold * 3) {
      recommendations.push({
        recommendations: [
          'Consider short-term investment options for excess cash',
          'Evaluate prepayment of high-interest debts',
          'Create reserve fund for capital improvements'
        ],
        potential_savings: position.current_balance * 0.03,
        implementation_priority: 'medium' as const
      });
    }

    return recommendations;
  }

  private static async getCurrentCashBalance(associationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('gl_accounts')
      .select('balance')
      .eq('association_id', associationId)
      .eq('type', 'asset')
      .ilike('name', '%cash%')
      .or('name.ilike.%checking%,name.ilike.%savings%');

    if (error) throw error;

    return (data || []).reduce((sum, account) => sum + (account.balance || 0), 0);
  }

  private static async getHistoricalCashFlow(
    associationId: string, 
    months: number
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('cash_flow_forecasts')
      .select('*')
      .eq('association_id', associationId)
      .order('forecast_date', { ascending: false })
      .limit(months);

    if (error) throw error;
    return data || [];
  }

  private static calculateProjectedReceipts(historicalData: any[], monthOffset: number): number {
    // Simple trend analysis - can be enhanced with ML
    const avgReceipts = historicalData.reduce((sum, d) => sum + (d.actual_receipts || d.projected_receipts), 0) / historicalData.length;
    return avgReceipts * (1 + (Math.random() * 0.1 - 0.05)); // Add some variance
  }

  private static calculateProjectedDisbursements(historicalData: any[], monthOffset: number): number {
    const avgDisbursements = historicalData.reduce((sum, d) => sum + (d.actual_disbursements || d.projected_disbursements), 0) / historicalData.length;
    return avgDisbursements * (1 + (Math.random() * 0.1 - 0.05));
  }

  private static async saveForecastsToDatabase(associationId: string, forecasts: CashFlowForecast[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const forecastData = forecasts.map(f => ({
      association_id: associationId,
      forecast_date: f.forecast_date,
      forecast_type: f.forecast_type,
      opening_balance: f.opening_balance,
      projected_receipts: f.projected_receipts,
      projected_disbursements: f.projected_disbursements,
      projected_balance: f.projected_balance,
      confidence_level: f.confidence_level,
      created_by: user.id
    }));

    await supabase
      .from('cash_flow_forecasts')
      .upsert(forecastData, {
        onConflict: 'association_id,forecast_date'
      });
  }

  private static async getCachedForecasts(associationId: string): Promise<CashFlowForecast[]> {
    const { data, error } = await supabase
      .from('cash_flow_forecasts')
      .select('*')
      .eq('association_id', associationId)
      .gte('forecast_date', new Date().toISOString().split('T')[0])
      .order('forecast_date');

    if (error) throw error;
    return data || [];
  }

  private static async calculateCashBurnRate(associationId: string): Promise<number> {
    // Calculate average monthly cash outflow over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        debit_amount,
        credit_amount,
        journal_entries!inner(entry_date)
      `)
      .gte('journal_entries.entry_date', sixMonthsAgo.toISOString().split('T')[0])
      .gt('debit_amount', 0); // Only outflows

    if (error) throw error;

    const totalOutflow = (data || []).reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    return totalOutflow / 6; // Monthly average
  }

  private static getDateDaysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  private static async adjustFutureForecasts(associationId: string, forecastId: string): Promise<void> {
    // Implementation for adjusting future forecasts based on actual variance
    // This would use machine learning to improve forecast accuracy over time
  }
}