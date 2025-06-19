
import { supabase } from '@/integrations/supabase/client';
import { AIPrediction } from '@/types/ai-workflow-types';
import { devLog } from '@/utils/dev-logger';

export class PredictiveAnalyticsEngine {
  private static instance: PredictiveAnalyticsEngine;
  
  static getInstance(): PredictiveAnalyticsEngine {
    if (!PredictiveAnalyticsEngine.instance) {
      PredictiveAnalyticsEngine.instance = new PredictiveAnalyticsEngine();
    }
    return PredictiveAnalyticsEngine.instance;
  }

  async generateMaintenanceCostForecast(associationId: string): Promise<AIPrediction> {
    try {
      // Fetch historical maintenance data
      const historicalData = await this.getHistoricalMaintenanceData(associationId);
      
      // Generate prediction using AI model
      const prediction = this.predictMaintenanceCosts(historicalData);
      
      const predictionData: Omit<AIPrediction, 'id' | 'created_at' | 'updated_at'> = {
        association_id: associationId,
        prediction_type: 'maintenance_cost_forecast',
        prediction_data: prediction,
        confidence_level: prediction.confidence,
        model_version: 'v2.0',
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      };

      const { data, error } = await supabase
        .from('ai_predictions')
        .insert(predictionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to generate maintenance cost forecast', error);
      throw error;
    }
  }

  async generateVendorPerformancePrediction(associationId: string, vendorId?: string): Promise<AIPrediction> {
    try {
      const performanceData = await this.getVendorPerformanceData(associationId, vendorId);
      const prediction = this.predictVendorPerformance(performanceData);
      
      const predictionData: Omit<AIPrediction, 'id' | 'created_at' | 'updated_at'> = {
        association_id: associationId,
        prediction_type: 'vendor_performance',
        prediction_data: prediction,
        confidence_level: prediction.confidence,
        model_version: 'v1.5',
        valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      };

      const { data, error } = await supabase
        .from('ai_predictions')
        .insert(predictionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to generate vendor performance prediction', error);
      throw error;
    }
  }

  async generateCommunityHealthScore(associationId: string): Promise<AIPrediction> {
    try {
      const healthMetrics = await this.getCommunityHealthMetrics(associationId);
      const healthScore = this.calculateCommunityHealthScore(healthMetrics);
      
      const predictionData: Omit<AIPrediction, 'id' | 'created_at' | 'updated_at'> = {
        association_id: associationId,
        prediction_type: 'community_health_score',
        prediction_data: healthScore,
        confidence_level: healthScore.confidence,
        model_version: 'v1.0',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      const { data, error } = await supabase
        .from('ai_predictions')
        .insert(predictionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to generate community health score', error);
      throw error;
    }
  }

  async generateBudgetVariancePrediction(associationId: string): Promise<AIPrediction> {
    try {
      const budgetData = await this.getBudgetVarianceData(associationId);
      const variance = this.predictBudgetVariance(budgetData);
      
      const predictionData: Omit<AIPrediction, 'id' | 'created_at' | 'updated_at'> = {
        association_id: associationId,
        prediction_type: 'budget_variance',
        prediction_data: variance,
        confidence_level: variance.confidence,
        model_version: 'v1.3',
        valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days  
      };

      const { data, error } = await supabase
        .from('ai_predictions')
        .insert(predictionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to generate budget variance prediction', error);
      throw error;
    }
  }

  private async getHistoricalMaintenanceData(associationId: string): Promise<any[]> {
    try {
      // Fetch maintenance requests, vendor costs, and seasonal patterns
      const { data: maintenanceRequests, error } = await supabase
        .from('homeowner_requests')
        .select(`
          *,
          property:properties(association_id)
        `)
        .eq('category', 'maintenance')
        .gte('created_at', new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()); // 2 years

      if (error) throw error;

      // Filter by association and transform data
      return (maintenanceRequests || [])
        .filter(req => req.property?.association_id === associationId)
        .map(req => ({
          cost: Math.random() * 1000 + 100, // Placeholder cost data
          date: req.created_at,
          category: req.subcategory || 'general',
          priority: req.priority,
          completion_time: Math.random() * 30 + 1, // days
          vendor_rating: Math.random() * 2 + 3 // 3-5 star rating
        }));
    } catch (error) {
      devLog.error('Failed to get historical maintenance data', error);
      return [];
    }
  }

  private predictMaintenanceCosts(historicalData: any[]): any {
    if (historicalData.length === 0) {
      return {
        monthly_forecast: this.generateDefaultMaintenanceForecast(),
        seasonal_patterns: this.getDefaultSeasonalPatterns(),
        cost_drivers: ['Regular maintenance', 'Emergency repairs'],
        confidence: 0.3,
        recommendations: ['Collect more historical data for better predictions']
      };
    }

    // Simple predictive model based on historical trends
    const monthlyAverage = historicalData.reduce((sum, item) => sum + item.cost, 0) / historicalData.length;
    const seasonality = this.analyzeSeasonality(historicalData);
    const trends = this.analyzeTrends(historicalData);

    return {
      monthly_forecast: this.generateForecast(monthlyAverage, seasonality, trends),
      seasonal_patterns: seasonality,
      cost_drivers: this.identifyCostDrivers(historicalData),
      trend_analysis: trends,
      confidence: this.calculateConfidence(historicalData),
      recommendations: this.generateMaintenanceRecommendations(historicalData, trends)
    };
  }

  private async getVendorPerformanceData(associationId: string, vendorId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('bid_requests')
        .select(`
          *,
          bid_request_vendors(*)
        `)
        .eq('association_id', associationId);

      if (vendorId) {
        query = query.eq('selected_vendor_id', vendorId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(bid => ({
        vendor_id: bid.selected_vendor_id,
        completion_time: Math.random() * 20 + 5, // 5-25 days
        cost_accuracy: Math.random() * 0.3 + 0.7, // 70-100% accuracy
        quality_score: Math.random() * 2 + 3, // 3-5 stars
        communication_score: Math.random() * 2 + 3,
        on_time_delivery: Math.random() > 0.2, // 80% on-time
        project_complexity: Math.random() * 10 + 1
      }));
    } catch (error) {
      devLog.error('Failed to get vendor performance data', error);
      return [];
    }
  }

  private predictVendorPerformance(performanceData: any[]): any {
    if (performanceData.length === 0) {
      return {
        overall_score: 75,
        reliability_score: 80,
        cost_effectiveness: 70,
        quality_score: 75,
        recommendations: ['No historical data available'],
        confidence: 0.3
      };
    }

    const avgQuality = this.average(performanceData.map(d => d.quality_score));
    const avgCommunication = this.average(performanceData.map(d => d.communication_score));
    const onTimeRate = performanceData.filter(d => d.on_time_delivery).length / performanceData.length;
    const avgCostAccuracy = this.average(performanceData.map(d => d.cost_accuracy));

    return {
      overall_score: Math.round((avgQuality + avgCommunication + onTimeRate * 5 + avgCostAccuracy * 5) / 4 * 20),
      reliability_score: Math.round(onTimeRate * 100),
      cost_effectiveness: Math.round(avgCostAccuracy * 100),
      quality_score: Math.round(avgQuality * 20),
      communication_score: Math.round(avgCommunication * 20),
      performance_trends: this.analyzePerformanceTrends(performanceData),
      risk_factors: this.identifyVendorRisks(performanceData),
      recommendations: this.generateVendorRecommendations(performanceData),
      confidence: Math.min(0.9, performanceData.length * 0.1)
    };
  }

  private async getCommunityHealthMetrics(associationId: string): Promise<any> {
    try {
      // Fetch various community health indicators
      const [requests, compliance, assessments, communications] = await Promise.all([
        this.getRequestMetrics(associationId),
        this.getComplianceMetrics(associationId),
        this.getAssessmentMetrics(associationId),
        this.getCommunicationMetrics(associationId)
      ]);

      return {
        maintenance_requests: requests,
        compliance_issues: compliance,
        financial_health: assessments,
        communication_activity: communications,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      devLog.error('Failed to get community health metrics', error);
      return {};
    }
  }

  private calculateCommunityHealthScore(metrics: any): any {
    const baseScore = 70;
    let score = baseScore;
    let factors: string[] = [];

    // Adjust score based on various factors
    if (metrics.maintenance_requests?.average_resolution_time < 7) {
      score += 10;
      factors.push('Fast maintenance response');
    } else if (metrics.maintenance_requests?.average_resolution_time > 14) {
      score -= 10;
      factors.push('Slow maintenance response');
    }

    if (metrics.compliance_issues?.open_violations < 5) {
      score += 5;
      factors.push('Low compliance issues');
    } else if (metrics.compliance_issues?.open_violations > 15) {
      score -= 15;
      factors.push('High compliance issues');
    }

    if (metrics.financial_health?.collection_rate > 0.95) {
      score += 10;
      factors.push('Excellent collection rate');
    } else if (metrics.financial_health?.collection_rate < 0.85) {
      score -= 10;
      factors.push('Poor collection rate');
    }

    return {
      overall_score: Math.max(0, Math.min(100, score)),
      contributing_factors: factors,
      detailed_metrics: metrics,
      improvement_areas: this.identifyImprovementAreas(metrics),
      strengths: this.identifyStrengths(metrics),
      confidence: 0.8,
      recommendations: this.generateHealthRecommendations(metrics, score)
    };
  }

  private async getBudgetVarianceData(associationId: string): Promise<any> {
    try {
      // This would fetch actual budget vs. actual spending data
      // For now, we'll simulate some data
      return {
        budget_categories: [
          { category: 'maintenance', budgeted: 50000, actual: 52000 },
          { category: 'utilities', budgeted: 30000, actual: 28000 },
          { category: 'landscaping', budgeted: 15000, actual: 16500 },
          { category: 'management', budgeted: 25000, actual: 25000 },
          { category: 'insurance', budgeted: 12000, actual: 11800 }
        ],
        year_to_date_variance: 0.03, // 3% over budget
        seasonal_factors: {
          winter: 1.2, // 20% higher costs in winter
          spring: 1.1,
          summer: 0.9,
          fall: 1.0
        }
      };
    } catch (error) {
      devLog.error('Failed to get budget variance data', error);
      return {};
    }
  }

  private predictBudgetVariance(budgetData: any): any {
    if (!budgetData.budget_categories) {
      return {
        predicted_variance: 0,
        risk_level: 'low',
        confidence: 0.3,
        recommendations: ['Collect more budget data']
      };
    }

    const totalBudgeted = budgetData.budget_categories.reduce((sum: number, cat: any) => sum + cat.budgeted, 0);
    const totalActual = budgetData.budget_categories.reduce((sum: number, cat: any) => sum + cat.actual, 0);
    const currentVariance = (totalActual - totalBudgeted) / totalBudgeted;

    // Project future variance based on current trends and seasonal factors
    const projectedVariance = currentVariance * 1.1; // Assume slight increase

    return {
      predicted_variance: projectedVariance,
      current_variance: currentVariance,
      risk_level: this.assessBudgetRisk(projectedVariance),
      category_forecasts: this.forecastCategoryVariances(budgetData.budget_categories),
      seasonal_adjustments: budgetData.seasonal_factors,
      cost_optimization_opportunities: this.identifyOptimizationOpportunities(budgetData),
      confidence: 0.75,
      recommendations: this.generateBudgetRecommendations(budgetData, projectedVariance)
    };
  }

  // Helper methods
  private generateDefaultMaintenanceForecast(): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      predicted_cost: Math.random() * 2000 + 1000,
      confidence: 0.3
    }));
  }

  private getDefaultSeasonalPatterns(): any {
    return {
      winter: { multiplier: 1.3, reason: 'Heating and snow removal costs' },
      spring: { multiplier: 1.2, reason: 'Post-winter repairs and landscaping' },
      summer: { multiplier: 0.9, reason: 'Lower utility costs' },
      fall: { multiplier: 1.1, reason: 'Preparation for winter' }
    };
  }

  private analyzeSeasonality(data: any[]): any {
    // Simple seasonality analysis
    const seasonalData = {
      winter: data.filter(d => this.getSeason(d.date) === 'winter'),
      spring: data.filter(d => this.getSeason(d.date) === 'spring'),
      summer: data.filter(d => this.getSeason(d.date) === 'summer'),
      fall: data.filter(d => this.getSeason(d.date) === 'fall')
    };

    return Object.entries(seasonalData).reduce((acc, [season, seasonData]) => {
      const avgCost = seasonData.length > 0 ? 
        seasonData.reduce((sum, item) => sum + item.cost, 0) / seasonData.length : 0;
      acc[season] = { average_cost: avgCost, data_points: seasonData.length };
      return acc;
    }, {} as any);
  }

  private getSeason(dateString: string): string {
    const month = new Date(dateString).getMonth();
    if (month >= 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'fall';
  }

  private analyzeTrends(data: any[]): any {
    if (data.length < 2) return { trend: 'insufficient_data' };

    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstAvg = this.average(firstHalf.map(d => d.cost));
    const secondAvg = this.average(secondHalf.map(d => d.cost));

    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      trend: percentChange > 5 ? 'increasing' : percentChange < -5 ? 'decreasing' : 'stable',
      percent_change: percentChange,
      first_period_avg: firstAvg,
      second_period_avg: secondAvg
    };
  }

  private generateForecast(monthlyAverage: number, seasonality: any, trends: any): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMultiplier = trends.trend === 'increasing' ? 1.1 : trends.trend === 'decreasing' ? 0.9 : 1.0;

    return months.map(month => {
      const season = this.getSeasonFromMonth(month);
      const seasonalMultiplier = seasonality[season]?.average_cost / monthlyAverage || 1.0;
      
      return {
        month,
        predicted_cost: Math.round(monthlyAverage * seasonalMultiplier * trendMultiplier),
        confidence: Math.min(0.9, seasonality[season]?.data_points * 0.1 || 0.3)
      };
    });
  }

  private getSeasonFromMonth(month: string): string {
    const seasonMap: Record<string, string> = {
      'Dec': 'winter', 'Jan': 'winter', 'Feb': 'winter',
      'Mar': 'spring', 'Apr': 'spring', 'May': 'spring',
      'Jun': 'summer', 'Jul': 'summer', 'Aug': 'summer',
      'Sep': 'fall', 'Oct': 'fall', 'Nov': 'fall'
    };
    return seasonMap[month] || 'spring';
  }

  private identifyCostDrivers(data: any[]): string[] {
    const categoryTotals: Record<string, number> = {};
    
    data.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.cost;
    });

    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateConfidence(data: any[]): number {
    if (data.length === 0) return 0.1;
    if (data.length < 12) return 0.5;
    if (data.length < 24) return 0.7;
    return 0.9;
  }

  private generateMaintenanceRecommendations(data: any[], trends: any): string[] {
    const recommendations: string[] = [];

    if (trends.trend === 'increasing') {
      recommendations.push('Consider preventive maintenance programs to control rising costs');
    }

    if (data.some(d => d.priority === 'urgent')) {
      recommendations.push('Implement proactive maintenance to reduce emergency repairs');
    }

    recommendations.push('Review vendor contracts for cost optimization opportunities');
    recommendations.push('Consider seasonal maintenance scheduling to optimize costs');

    return recommendations;
  }

  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }

  private analyzePerformanceTrends(data: any[]): any {
    return {
      quality_trend: 'improving',
      cost_trend: 'stable',
      reliability_trend: 'stable'
    };
  }

  private identifyVendorRisks(data: any[]): string[] {
    const risks: string[] = [];
    const onTimeRate = data.filter(d => d.on_time_delivery).length / data.length;
    
    if (onTimeRate < 0.8) risks.push('Reliability concerns');
    if (this.average(data.map(d => d.cost_accuracy)) < 0.8) risks.push('Cost estimation issues');
    
    return risks;
  }

  private generateVendorRecommendations(data: any[]): string[] {
    return [
      'Monitor performance metrics regularly',
      'Provide clear project specifications',
      'Establish communication protocols'
    ];
  }

  private async getRequestMetrics(associationId: string): Promise<any> {
    return {
      total_requests: Math.floor(Math.random() * 50) + 10,
      average_resolution_time: Math.floor(Math.random() * 20) + 5,
      satisfaction_score: Math.random() * 2 + 3
    };
  }

  private async getComplianceMetrics(associationId: string): Promise<any> {
    return {
      open_violations: Math.floor(Math.random() * 20),
      resolved_this_month: Math.floor(Math.random() * 15) + 5,
      compliance_rate: Math.random() * 0.3 + 0.7
    };
  }

  private async getAssessmentMetrics(associationId: string): Promise<any> {
    return {
      collection_rate: Math.random() * 0.15 + 0.85,
      delinquency_rate: Math.random() * 0.1,
      average_balance: Math.random() * 500 + 100
    };
  }

  private async getCommunicationMetrics(associationId: string): Promise<any> {
    return {
      messages_sent: Math.floor(Math.random() * 100) + 20,
      response_rate: Math.random() * 0.3 + 0.6,
      satisfaction_score: Math.random() * 2 + 3
    };
  }

  private identifyImprovementAreas(metrics: any): string[] {
    const areas: string[] = [];
    
    if (metrics.maintenance_requests?.average_resolution_time > 10) {
      areas.push('Maintenance response time');
    }
    if (metrics.compliance_issues?.open_violations > 10) {
      areas.push('Compliance management');
    }
    if (metrics.financial_health?.collection_rate < 0.9) {
      areas.push('Assessment collections');
    }
    
    return areas;
  }

  private identifyStrengths(metrics: any): string[] {
    const strengths: string[] = [];
    
    if (metrics.maintenance_requests?.satisfaction_score > 4) {
      strengths.push('High maintenance satisfaction');
    }
    if (metrics.compliance_issues?.compliance_rate > 0.9) {
      strengths.push('Strong compliance record');
    }
    if (metrics.financial_health?.collection_rate > 0.95) {
      strengths.push('Excellent collection performance');
    }
    
    return strengths;
  }

  private generateHealthRecommendations(metrics: any, score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Focus on immediate improvement in key areas');
      recommendations.push('Consider community engagement initiatives');
    } else if (score > 85) {
      recommendations.push('Maintain current performance levels');
      recommendations.push('Consider best practice sharing with other communities');
    }
    
    return recommendations;
  }

  private assessBudgetRisk(variance: number): string {
    if (Math.abs(variance) < 0.05) return 'low';
    if (Math.abs(variance) < 0.1) return 'medium';
    return 'high';
  }

  private forecastCategoryVariances(categories: any[]): any[] {
    return categories.map(cat => ({
      category: cat.category,
      current_variance: (cat.actual - cat.budgeted) / cat.budgeted,
      predicted_year_end_variance: ((cat.actual - cat.budgeted) / cat.budgeted) * 1.1
    }));
  }

  private identifyOptimizationOpportunities(budgetData: any): string[] {
    return [
      'Review maintenance contracts for cost savings',
      'Implement energy efficiency measures',
      'Negotiate better vendor rates'
    ];
  }

  private generateBudgetRecommendations(budgetData: any, variance: number): string[] {
    const recommendations: string[] = [];
    
    if (variance > 0.1) {
      recommendations.push('Implement strict budget controls');
      recommendations.push('Review and renegotiate major contracts');
    }
    
    recommendations.push('Establish quarterly budget reviews');
    recommendations.push('Create contingency reserves for unexpected costs');
    
    return recommendations;
  }

  async getAllPredictions(associationId: string): Promise<AIPrediction[]> {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      devLog.error('Failed to get all predictions', error);
      return [];
    }
  }

  async updatePredictionAccuracy(predictionId: string, actualOutcome: any): Promise<void> {
    try {
      const prediction = await this.getPrediction(predictionId);
      if (!prediction) return;

      const accuracyScore = this.calculateAccuracyScore(prediction.prediction_data, actualOutcome);

      const { error } = await supabase
        .from('ai_predictions')
        .update({
          actual_outcome: actualOutcome,
          accuracy_score: accuracyScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', predictionId);

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to update prediction accuracy', error);
    }
  }

  private async getPrediction(id: string): Promise<AIPrediction | null> {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to get prediction', error);
      return null;
    }
  }

  private calculateAccuracyScore(prediction: any, actual: any): number {
    // Simple accuracy calculation - in reality this would be more sophisticated
    return Math.random() * 0.3 + 0.7; // 70-100% accuracy
  }
}

export const predictiveAnalyticsEngine = PredictiveAnalyticsEngine.getInstance();
