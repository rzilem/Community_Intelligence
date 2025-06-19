
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

  async generateMaintenanceCostPrediction(associationId: string): Promise<AIPrediction> {
    // Fetch maintenance history
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

    // Simple prediction logic (in production, this would use ML models)
    const avgCost = 500; // Default average cost
    const prediction = {
      estimatedCost: avgCost,
      confidence: 0.75,
      factors: ['historical_data', 'seasonal_trends'],
      timeframe: '30_days'
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'maintenance_cost',
      prediction_data: prediction,
      confidence_level: 0.75,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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

  // Alias for backwards compatibility
  async generateMaintenanceCostForecast(associationId: string): Promise<AIPrediction> {
    return this.generateMaintenanceCostPrediction(associationId);
  }

  async generateVendorPerformancePrediction(associationId: string): Promise<AIPrediction> {
    const prediction = {
      topPerformers: ['Vendor A', 'Vendor B'],
      averageRating: 4.2,
      recommendedVendors: ['Vendor C'],
      confidence: 0.82
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'vendor_performance',
      prediction_data: prediction,
      confidence_level: 0.82,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save vendor performance prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateCommunityHealthScore(associationId: string): Promise<AIPrediction> {
    const prediction = {
      overallScore: 85,
      factors: {
        maintenance: 0.8,
        financials: 0.9,
        compliance: 0.85,
        resident_satisfaction: 0.82
      },
      recommendations: ['Improve maintenance response time', 'Increase community events'],
      confidence: 0.78
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'community_health',
      prediction_data: prediction,
      confidence_level: 0.78,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save community health prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateBudgetVariancePrediction(associationId: string): Promise<AIPrediction> {
    const prediction = {
      expectedVariance: 5.2,
      budgetHealth: 'good',
      riskFactors: ['seasonal maintenance', 'utility costs'],
      projectedOverrun: 2.3,
      confidence: 0.85
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'budget_variance',
      prediction_data: prediction,
      confidence_level: 0.85,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save budget variance prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateComplianceRiskPrediction(associationId: string): Promise<AIPrediction> {
    const prediction = {
      riskLevel: 'medium',
      riskFactors: ['payment_delays', 'maintenance_backlog'],
      recommendedActions: ['increase_follow_ups', 'schedule_inspections'],
      confidence: 0.68
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'compliance_risk',
      prediction_data: prediction,
      confidence_level: 0.68,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save compliance prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateCashFlowPrediction(associationId: string): Promise<AIPrediction> {
    const prediction = {
      projectedIncome: 15000,
      projectedExpenses: 12000,
      netCashFlow: 3000,
      confidence: 0.82,
      timeframe: '90_days'
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'cash_flow',
      prediction_data: prediction,
      confidence_level: 0.82,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save cash flow prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateSeasonalTrendsPrediction(associationId: string): Promise<AIPrediction> {
    const prediction = {
      seasonalPatterns: {
        spring: { maintenanceIncrease: 0.3, costIncrease: 0.25 },
        summer: { maintenanceIncrease: 0.4, costIncrease: 0.35 },
        fall: { maintenanceIncrease: 0.2, costIncrease: 0.15 },
        winter: { maintenanceIncrease: 0.1, costIncrease: 0.1 }
      },
      confidence: 0.71
    };

    const predictionData = {
      association_id: associationId,
      prediction_type: 'seasonal_trends',
      prediction_data: prediction,
      confidence_level: 0.71,
      model_version: 'v1.0',
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save seasonal trends prediction: ${error.message}`);
    }

    return convertToAIPrediction(data);
  }

  async getPredictionsByType(associationId: string, predictionType: string): Promise<AIPrediction[]> {
    const { data, error } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('association_id', associationId)
      .eq('prediction_type', predictionType)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch predictions: ${error.message}`);
    }

    return data ? data.map(convertToAIPrediction) : [];
  }

  async updatePredictionAccuracy(predictionId: string, actualOutcome: Record<string, any>): Promise<AIPrediction> {
    // Get the original prediction
    const { data: original, error: fetchError } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch original prediction: ${fetchError.message}`);
    }

    // Calculate accuracy score (simplified)
    const accuracyScore = 0.85; // In production, this would be calculated based on actual vs predicted

    const { data, error } = await supabase
      .from('ai_predictions')
      .update({
        actual_outcome: actualOutcome,
        accuracy_score: accuracyScore,
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
