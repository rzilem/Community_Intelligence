import { supabase } from '@/integrations/supabase/client';

export interface PredictiveInsight {
  id: string;
  type: 'financial' | 'maintenance' | 'operational' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  recommendations: string[];
  data: any;
  createdAt: string;
}

export interface FinancialForecast {
  period: string;
  predictedRevenue: number;
  predictedExpenses: number;
  cashFlow: number;
  confidence: number;
  factors: string[];
}

export interface MaintenancePrediction {
  propertyId: string;
  assetType: string;
  predictedFailureDate: string;
  confidence: number;
  estimatedCost: number;
  preventiveMeasures: string[];
}

export class PredictiveAnalyticsService {
  static async generateFinancialForecast(
    associationId: string,
    months: number = 12
  ): Promise<FinancialForecast[]> {
    try {
      // Get historical financial data
      const { data: transactions } = await supabase
        .from('payment_transactions_enhanced')
        .select('*')
        .eq('association_id', associationId)
        .gte('payment_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('payment_date', { ascending: true });

      const { data: assessments } = await supabase
        .from('assessments')
        .select('*, properties!inner(*)')
        .eq('properties.association_id', associationId)
        .gte('due_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Analyze trends and patterns
      const forecasts: FinancialForecast[] = [];
      const currentDate = new Date();

      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date(currentDate);
        forecastDate.setMonth(forecastDate.getMonth() + i);

        // Calculate seasonal adjustments
        const seasonalFactor = this.getSeasonalFactor(forecastDate.getMonth());
        
        // Historical average with trend analysis
        const avgRevenue = this.calculateAverage(
          transactions?.filter(t => t.transaction_type === 'payment') || [],
          'net_amount'
        );
        
        const avgExpenses = this.calculateAverage(
          transactions?.filter(t => t.transaction_type === 'expense') || [],
          'net_amount'
        );

        const predictedRevenue = avgRevenue * seasonalFactor * (1 + this.getTrendFactor(transactions || [], 'revenue'));
        const predictedExpenses = avgExpenses * seasonalFactor * (1 + this.getTrendFactor(transactions || [], 'expense'));

        forecasts.push({
          period: forecastDate.toISOString().slice(0, 7),
          predictedRevenue,
          predictedExpenses,
          cashFlow: predictedRevenue - predictedExpenses,
          confidence: Math.max(0.6, 0.9 - (i * 0.05)), // Confidence decreases over time
          factors: [
            'Historical trends',
            'Seasonal patterns',
            'Market conditions',
            'Assessment schedules'
          ]
        });
      }

      return forecasts;
    } catch (error) {
      console.error('Error generating financial forecast:', error);
      return [];
    }
  }

  static async predictMaintenanceNeeds(
    associationId: string
  ): Promise<MaintenancePrediction[]> {
    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, unit_number, address')
        .eq('association_id', associationId);

      const { data: requests } = await supabase
        .from('homeowner_requests')
        .select('id, property_id, description, created_at, type')
        .eq('association_id', associationId);

      if (!properties || !requests) {
        return [];
      }

      const predictions: MaintenancePrediction[] = [];

      properties.forEach(property => {
        // Get maintenance requests for this property
        const maintenanceHistory = requests.filter(req => req.property_id === property.id);
        const assetTypes = ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Flooring'];

        assetTypes.forEach(assetType => {
          const assetRequests = maintenanceHistory.filter(req => 
            req.description?.toLowerCase().includes(assetType.toLowerCase())
          );

          if (assetRequests.length > 0) {
            // Calculate failure probability based on frequency and recency
            const avgTimeBetweenIssues = this.calculateMaintenanceInterval(assetRequests);
            const lastIssueDate = new Date(Math.max(...assetRequests.map(r => new Date(r.created_at).getTime())));
            const daysSinceLastIssue = (Date.now() - lastIssueDate.getTime()) / (1000 * 60 * 60 * 24);

            if (avgTimeBetweenIssues > 0 && daysSinceLastIssue > avgTimeBetweenIssues * 0.7) {
              const predictedFailureDate = new Date();
              predictedFailureDate.setDate(predictedFailureDate.getDate() + (avgTimeBetweenIssues - daysSinceLastIssue));

              predictions.push({
                propertyId: property.id,
                assetType,
                predictedFailureDate: predictedFailureDate.toISOString(),
                confidence: Math.min(0.9, assetRequests.length * 0.2),
                estimatedCost: this.estimateMaintenanceCost(assetType, assetRequests),
                preventiveMeasures: this.getPreventiveMeasures(assetType)
              });
            }
          }
        });
      });

      return predictions.sort((a, b) => 
        new Date(a.predictedFailureDate).getTime() - new Date(b.predictedFailureDate).getTime()
      );
    } catch (error) {
      console.error('Error predicting maintenance needs:', error);
      return [];
    }
  }

  static async generateRiskAssessment(associationId: string): Promise<PredictiveInsight[]> {
    try {
      const insights: PredictiveInsight[] = [];

      // Financial risk analysis
      const { data: financialData } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('association_id', associationId)
        .eq('status', 'open');

      if (financialData && financialData.length > 0) {
        const totalDelinquent = financialData.reduce((sum, ar) => sum + ar.current_balance, 0);
        const avgDelinquency = totalDelinquent / financialData.length;

        if (avgDelinquency > 500) {
          insights.push({
            id: `risk-financial-${Date.now()}`,
            type: 'financial',
            title: 'High Delinquency Risk',
            description: `Average delinquency of $${avgDelinquency.toFixed(2)} indicates potential cash flow issues`,
            confidence: 0.85,
            impact: 'high',
            timeframe: '3 months',
            recommendations: [
              'Implement payment plan options',
              'Increase collection efforts',
              'Review assessment amounts',
              'Consider legal action for chronic delinquents'
            ],
            data: { totalDelinquent, avgDelinquency, accountsCount: financialData.length },
            createdAt: new Date().toISOString()
          });
        }
      }

      // Operational risk analysis
      const { data: maintenanceData } = await supabase
        .from('homeowner_requests')
        .select('*')
        .eq('association_id', associationId)
        .eq('status', 'open')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (maintenanceData && maintenanceData.length > 10) {
        insights.push({
          id: `risk-operational-${Date.now()}`,
          type: 'operational',
          title: 'High Maintenance Backlog',
          description: `${maintenanceData.length} open maintenance requests may impact resident satisfaction`,
          confidence: 0.9,
          impact: 'medium',
          timeframe: '1 month',
          recommendations: [
            'Hire additional maintenance staff',
            'Implement preventive maintenance program',
            'Prioritize critical repairs',
            'Improve vendor response times'
          ],
          data: { openRequests: maintenanceData.length },
          createdAt: new Date().toISOString()
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating risk assessment:', error);
      return [];
    }
  }

  private static getSeasonalFactor(month: number): number {
    // Seasonal adjustment factors (0-11 for months)
    const factors = [1.1, 1.0, 0.9, 0.95, 1.05, 1.15, 1.2, 1.15, 1.0, 0.95, 0.9, 1.05];
    return factors[month] || 1.0;
  }

  private static getTrendFactor(data: any[], type: string): number {
    if (data.length < 6) return 0;
    
    // Simple linear trend calculation
    const recent = data.slice(-6);
    const older = data.slice(-12, -6);
    
    if (older.length === 0) return 0;
    
    const recentAvg = this.calculateAverage(recent, 'net_amount');
    const olderAvg = this.calculateAverage(older, 'net_amount');
    
    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  private static calculateAverage(data: any[], field: string): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((total, item) => total + (item[field] || 0), 0);
    return sum / data.length;
  }

  private static calculateMaintenanceInterval(requests: any[]): number {
    if (requests.length < 2) return 0;
    
    const dates = requests.map(r => new Date(r.created_at).getTime()).sort();
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private static estimateMaintenanceCost(assetType: string, history: any[]): number {
    const baseCosts: Record<string, number> = {
      'HVAC': 800,
      'Plumbing': 400,
      'Electrical': 600,
      'Roofing': 1500,
      'Flooring': 1000
    };

    const baseCase = baseCosts[assetType] || 500;
    const complexityFactor = Math.min(2, 1 + (history.length * 0.1));
    
    return Math.round(baseCase * complexityFactor);
  }

  private static getPreventiveMeasures(assetType: string): string[] {
    const measures: Record<string, string[]> = {
      'HVAC': [
        'Replace air filters monthly',
        'Schedule annual professional inspection',
        'Clean vents and ducts quarterly',
        'Check thermostat calibration'
      ],
      'Plumbing': [
        'Inspect for leaks monthly',
        'Test water pressure quarterly',
        'Clean drains regularly',
        'Check water heater annually'
      ],
      'Electrical': [
        'Test GFCI outlets monthly',
        'Inspect electrical panels annually',
        'Check for loose connections',
        'Update old wiring as needed'
      ],
      'Roofing': [
        'Inspect roof bi-annually',
        'Clean gutters quarterly',
        'Check for loose shingles',
        'Trim overhanging branches'
      ],
      'Flooring': [
        'Regular cleaning and maintenance',
        'Address spills immediately',
        'Use protective pads under furniture',
        'Professional deep cleaning annually'
      ]
    };

    return measures[assetType] || ['Regular inspection and maintenance'];
  }
}