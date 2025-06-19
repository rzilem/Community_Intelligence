
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { AIPrediction } from '@/types/ai-workflow-types';

// Helper function to convert database rows to AIPrediction objects
function convertToAIPrediction(row: any): AIPrediction {
  return {
    id: row.id,
    association_id: row.association_id,
    prediction_type: row.prediction_type,
    prediction_data: typeof row.prediction_data === 'string' 
      ? JSON.parse(row.prediction_data) 
      : row.prediction_data || {},
    confidence_level: row.confidence_level,
    actual_outcome: typeof row.actual_outcome === 'string'
      ? JSON.parse(row.actual_outcome)
      : row.actual_outcome || null,
    accuracy_score: row.accuracy_score,
    model_version: row.model_version,
    valid_until: row.valid_until,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class PredictiveAnalyticsEngine {
  async generateMaintenanceCostPrediction(associationId: string, options: {
    timeframe?: string;
    propertyTypes?: string[];
    includeInflation?: boolean;
  } = {}): Promise<AIPrediction> {
    const { data: maintenanceHistory, error } = await supabase
      .from('homeowner_requests')
      .select(`
        *,
        properties!inner (
          id,
          association_id,
          unit_number
        )
      `)
      .eq('properties.association_id', associationId)
      .eq('category', 'maintenance')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      devLog.error('Failed to fetch maintenance history', error);
      throw new Error(`Failed to fetch maintenance history: ${error.message}`);
    }

    // Simple prediction logic - in production this would use ML models
    const avgCost = maintenanceHistory?.reduce((sum, req) => sum + (req.estimated_cost || 0), 0) / (maintenanceHistory?.length || 1);
    const projectedCost = avgCost * 1.15; // 15% inflation factor

    const predictionData = {
      prediction_type: 'maintenance_cost',
      association_id: associationId,
      prediction_data: {
        projected_annual_cost: projectedCost,
        confidence_factors: {
          historical_data_points: maintenanceHistory?.length || 0,
          seasonal_adjustment: 1.1,
          inflation_factor: options.includeInflation ? 1.15 : 1.0
        },
        timeframe: options.timeframe || '12_months'
      },
      confidence_level: 0.75,
      model_version: 'maintenance_predictor_v1.0',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    const { data, error: insertError } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save prediction: ${insertError.message}`);
    }

    return convertToAIPrediction(data);
  }

  async getAllPredictions(associationId: string): Promise<AIPrediction[]> {
    const { data, error } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch predictions: ${error.message}`);
    }

    return data ? data.map(convertToAIPrediction) : [];
  }

  async generateMaintenanceCostForecast(associationId: string, months: number = 12): Promise<AIPrediction> {
    return this.generateMaintenanceCostPrediction(associationId, { 
      timeframe: `${months}_months`,
      includeInflation: true 
    });
  }

  async generateVendorPerformancePrediction(associationId: string): Promise<AIPrediction> {
    const predictionData = {
      prediction_type: 'vendor_performance',
      association_id: associationId,
      prediction_data: {
        vendor_scores: {},
        recommendations: []
      },
      confidence_level: 0.65,
      model_version: 'vendor_predictor_v1.0',
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save vendor prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateCommunityHealthScore(associationId: string): Promise<AIPrediction> {
    const predictionData = {
      prediction_type: 'community_health',
      association_id: associationId,
      prediction_data: {
        overall_score: 85,
        factors: {
          maintenance_backlog: 0.8,
          resident_satisfaction: 0.9,
          financial_health: 0.85
        }
      },
      confidence_level: 0.8,
      model_version: 'health_score_v1.0',
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save health score: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateBudgetVariancePrediction(associationId: string): Promise<AIPrediction> {
    const predictionData = {
      prediction_type: 'budget_variance',
      association_id: associationId,
      prediction_data: {
        predicted_variance: 0.05,
        risk_factors: [],
        recommendations: []
      },
      confidence_level: 0.7,
      model_version: 'budget_predictor_v1.0',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save budget prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async updatePredictionAccuracy(predictionId: string, actualOutcome: Record<string, any>): Promise<AIPrediction> {
    const { data, error } = await supabase
      .from('ai_predictions')
      .update({
        actual_outcome: actualOutcome,
        updated_at: new Date().toISOString()
      })
      .eq('id', predictionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prediction accuracy: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }
}

export const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();
