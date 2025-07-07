import { supabase } from '@/integrations/supabase/client';

export interface FinancialForecast {
  id: string;
  associationId: string;
  forecastType: 'cash_flow' | 'budget_variance' | 'delinquency' | 'property_value' | 'assessment_optimization';
  predictions: Array<{
    period: string;
    value: number;
    confidence: number;
    factors: string[];
  }>;
  accuracy: number;
  recommendations: Array<{
    type: 'optimization' | 'risk_mitigation' | 'opportunity';
    description: string;
    impact: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  metadata: {
    modelVersion: string;
    dataPoints: number;
    lastUpdated: string;
  };
}

export interface MaintenancePrediction {
  id: string;
  propertyId: string;
  equipmentType: string;
  predictionType: 'failure' | 'maintenance_due' | 'lifecycle_end' | 'cost_spike';
  probability: number;
  timeframe: {
    earliest: string;
    likely: string;
    latest: string;
  };
  estimatedCost: {
    min: number;
    likely: number;
    max: number;
  };
  preventiveActions: string[];
  riskFactors: string[];
}

export interface ResidentBehaviorInsight {
  id: string;
  associationId: string;
  insightType: 'satisfaction' | 'engagement' | 'payment_behavior' | 'service_usage' | 'communication_preference';
  patterns: Array<{
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    impact: string;
  }>;
  recommendations: string[];
  actionItems: Array<{
    priority: 'low' | 'medium' | 'high';
    action: string;
    expectedOutcome: string;
  }>;
}

export class PredictiveAnalyticsEngine {
  private static readonly MODEL_VERSIONS = {
    financial: 'v2.1',
    maintenance: 'v1.8',
    resident: 'v1.5'
  };

  static async generateFinancialForecast(
    associationId: string,
    forecastType: FinancialForecast['forecastType'],
    timeframe: number = 12 // months
  ): Promise<FinancialForecast> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-financial-forecaster', {
        body: {
          associationId,
          forecastType,
          timeframe,
          modelVersion: this.MODEL_VERSIONS.financial,
          features: ['seasonal_patterns', 'market_trends', 'historical_data', 'external_factors']
        }
      });

      if (error) throw error;

      const forecast: FinancialForecast = {
        id: data.id,
        associationId,
        forecastType,
        predictions: data.predictions || [],
        accuracy: data.accuracy || 0,
        recommendations: data.recommendations || [],
        metadata: {
          modelVersion: this.MODEL_VERSIONS.financial,
          dataPoints: data.dataPoints || 0,
          lastUpdated: new Date().toISOString()
        }
      };

      await this.storeForecast(forecast);
      return forecast;
    } catch (error) {
      console.error('Financial forecast generation failed:', error);
      throw new Error(`Financial forecast failed: ${error.message}`);
    }
  }

  static async predictMaintenanceNeeds(
    propertyId: string,
    equipmentTypes?: string[]
  ): Promise<MaintenancePrediction[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-maintenance-predictor', {
        body: {
          propertyId,
          equipmentTypes,
          modelVersion: this.MODEL_VERSIONS.maintenance,
          features: ['usage_patterns', 'environmental_factors', 'maintenance_history', 'equipment_age']
        }
      });

      if (error) throw error;

      const predictions: MaintenancePrediction[] = data.predictions.map((pred: any) => ({
        id: pred.id,
        propertyId,
        equipmentType: pred.equipmentType,
        predictionType: pred.predictionType,
        probability: pred.probability,
        timeframe: pred.timeframe,
        estimatedCost: pred.estimatedCost,
        preventiveActions: pred.preventiveActions || [],
        riskFactors: pred.riskFactors || []
      }));

      await Promise.all(predictions.map(pred => this.storeMaintenancePrediction(pred)));
      return predictions;
    } catch (error) {
      console.error('Maintenance prediction failed:', error);
      throw new Error(`Maintenance prediction failed: ${error.message}`);
    }
  }

  static async analyzeResidentBehavior(
    associationId: string,
    analysisTypes?: ResidentBehaviorInsight['insightType'][]
  ): Promise<ResidentBehaviorInsight[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-resident-analyzer', {
        body: {
          associationId,
          analysisTypes: analysisTypes || ['satisfaction', 'engagement', 'payment_behavior'],
          modelVersion: this.MODEL_VERSIONS.resident,
          features: ['communication_history', 'payment_patterns', 'service_requests', 'event_participation']
        }
      });

      if (error) throw error;

      const insights: ResidentBehaviorInsight[] = data.insights.map((insight: any) => ({
        id: insight.id,
        associationId,
        insightType: insight.insightType,
        patterns: insight.patterns || [],
        recommendations: insight.recommendations || [],
        actionItems: insight.actionItems || []
      }));

      await Promise.all(insights.map(insight => this.storeResidentInsight(insight)));
      return insights;
    } catch (error) {
      console.error('Resident behavior analysis failed:', error);
      throw new Error(`Resident behavior analysis failed: ${error.message}`);
    }
  }

  static async getModelPerformanceMetrics(
    modelType: 'financial' | 'maintenance' | 'resident',
    associationId: string
  ): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    lastTraining: string;
    dataQuality: number;
    recommendedActions: string[];
  }> {
    try {
      const { data, error } = await supabase
        .from('ai_model_performance')
        .select('*')
        .eq('model_name', modelType)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        accuracy: data.accuracy_score || 0,
        precision: data.performance_metrics?.precision || 0,
        recall: data.performance_metrics?.recall || 0,
        lastTraining: data.last_trained || '',
        dataQuality: data.performance_metrics?.data_quality || 0,
        recommendedActions: data.performance_metrics?.recommended_actions || []
      };
    } catch (error) {
      console.error('Failed to fetch model performance:', error);
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        lastTraining: '',
        dataQuality: 0,
        recommendedActions: []
      };
    }
  }

  static async triggerModelRetraining(
    modelType: 'financial' | 'maintenance' | 'resident',
    associationId: string
  ): Promise<{ success: boolean; jobId: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-model-trainer', {
        body: {
          modelType,
          associationId,
          retrainMode: 'incremental',
          features: ['new_data', 'performance_feedback', 'user_corrections']
        }
      });

      if (error) throw error;

      return {
        success: true,
        jobId: data.jobId
      };
    } catch (error) {
      console.error('Model retraining failed:', error);
      return {
        success: false,
        jobId: ''
      };
    }
  }

  private static async storeForecast(forecast: FinancialForecast): Promise<void> {
    const { error } = await supabase
      .from('ai_financial_forecasts')
      .insert({
        id: forecast.id,
        association_id: forecast.associationId,
        forecast_type: forecast.forecastType,
        predictions: forecast.predictions,
        accuracy: forecast.accuracy,
        recommendations: forecast.recommendations,
        metadata: forecast.metadata
      });

    if (error) {
      console.error('Failed to store forecast:', error);
    }
  }

  private static async storeMaintenancePrediction(prediction: MaintenancePrediction): Promise<void> {
    const { error } = await supabase
      .from('ai_maintenance_predictions')
      .insert({
        id: prediction.id,
        property_id: prediction.propertyId,
        equipment_type: prediction.equipmentType,
        prediction_type: prediction.predictionType,
        probability: prediction.probability,
        timeframe: prediction.timeframe,
        estimated_cost: prediction.estimatedCost,
        preventive_actions: prediction.preventiveActions,
        risk_factors: prediction.riskFactors
      });

    if (error) {
      console.error('Failed to store maintenance prediction:', error);
    }
  }

  private static async storeResidentInsight(insight: ResidentBehaviorInsight): Promise<void> {
    const { error } = await supabase
      .from('ai_resident_insights')
      .insert({
        id: insight.id,
        association_id: insight.associationId,
        insight_type: insight.insightType,
        patterns: insight.patterns,
        recommendations: insight.recommendations,
        action_items: insight.actionItems
      });

    if (error) {
      console.error('Failed to store resident insight:', error);
    }
  }
}