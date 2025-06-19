
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

// Helper function to estimate cost from request data
function estimateCostFromRequest(request: any): number {
  // Base cost by priority
  const baseCosts: Record<string, number> = {
    high: 500,
    urgent: 750,
    medium: 250,
    low: 100
  };
  
  let cost = baseCosts[request.priority] || 150;
  
  // Adjust by category
  const categoryMultipliers: Record<string, number> = {
    plumbing: 1.5,
    electrical: 1.3,
    hvac: 2.0,
    roofing: 2.5,
    landscaping: 0.8,
    maintenance: 1.0
  };
  
  const multiplier = categoryMultipliers[request.category] || 1.0;
  
  return Math.round(cost * multiplier);
}

export class PredictiveAnalyticsEngine {
  async generateMaintenanceCostPrediction(associationId: string, options: {
    timeframe?: string;
    propertyTypes?: string[];
    includeInflation?: boolean;
  } = {}): Promise<AIPrediction> {
    try {
      // First, get properties for the association
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('association_id', associationId);

      if (propError || !properties) {
        throw new Error('Failed to fetch properties');
      }

      const propertyIds = properties.map(p => p.id);

      // Then get maintenance requests for those properties
      // @ts-ignore - Avoiding deep type inference
      const { data: maintenanceHistory, error } = await supabase
        .from('homeowner_requests')
        .select('*')
        .in('property_id', propertyIds)
        .eq('category', 'maintenance')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        devLog.error('Failed to fetch maintenance history', error);
        throw new Error(`Failed to fetch maintenance history: ${error.message}`);
      }

      // Calculate estimated costs from existing data
      const maintenanceCosts = (maintenanceHistory || []).map((request: any) => ({
        date: request.created_at,
        cost: estimateCostFromRequest(request),
        category: request.subcategory || request.category || 'general',
        propertyId: request.property_id
      }));

      // Simple prediction logic - in production this would use ML models
      const totalCost = maintenanceCosts.reduce((sum, item) => sum + item.cost, 0);
      const avgCost = totalCost / Math.max(maintenanceCosts.length, 1);
      const projectedCost = avgCost * (options.includeInflation ? 1.15 : 1.0);

      // Step 1: Prepare prediction data with explicit typing
      const predictionInsert = {
        prediction_type: 'maintenance_cost' as const,
        association_id: associationId,
        prediction_data: {
          projected_annual_cost: projectedCost,
          confidence_factors: {
            historical_data_points: maintenanceCosts.length,
            seasonal_adjustment: 1.1,
            inflation_factor: options.includeInflation ? 1.15 : 1.0
          },
          timeframe: options.timeframe || '12_months'
        },
        confidence_level: 0.75,
        model_version: 'maintenance_predictor_v1.0',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Step 2: Insert without complex chaining
      // @ts-ignore - Avoiding deep type inference
      const { data, error: insertError } = await supabase
        .from('ai_predictions')
        .insert(predictionInsert)
        .select('*')
        .single();

      if (insertError || !data) {
        throw new Error(`Failed to save prediction: ${insertError?.message}`);
      }

      return convertToAIPrediction(data);
    } catch (error) {
      devLog.error('Maintenance cost prediction failed', error);
      throw error;
    }
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
    const predictionInsert = {
      prediction_type: 'vendor_performance' as const,
      association_id: associationId,
      prediction_data: {
        vendor_scores: {},
        recommendations: []
      },
      confidence_level: 0.65,
      model_version: 'vendor_predictor_v1.0',
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    };

    // @ts-ignore - Avoiding deep type inference
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionInsert)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save vendor prediction: ${error?.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateCommunityHealthScore(associationId: string): Promise<AIPrediction> {
    const predictionInsert = {
      prediction_type: 'community_health' as const,
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

    // @ts-ignore - Avoiding deep type inference
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionInsert)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save health score: ${error?.message}`);
    }

    return convertToAIPrediction(data);
  }

  async generateBudgetVariancePrediction(associationId: string): Promise<AIPrediction> {
    const predictionInsert = {
      prediction_type: 'budget_variance' as const,
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

    // @ts-ignore - Avoiding deep type inference
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionInsert)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save budget prediction: ${error?.message}`);
    }

    return convertToAIPrediction(data);
  }

  async updatePredictionAccuracy(predictionId: string, actualOutcome: Record<string, any>): Promise<AIPrediction> {
    // Step 1: Update without selecting
    const updateData = {
      actual_outcome: actualOutcome,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('ai_predictions')
      .update(updateData)
      .eq('id', predictionId);

    if (updateError) {
      throw new Error(`Failed to update prediction accuracy: ${updateError.message}`);
    }

    // Step 2: Fetch updated record
    // @ts-ignore - Avoiding deep type inference
    const { data, error: fetchError } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (fetchError || !data) {
      throw new Error(`Failed to fetch updated prediction: ${fetchError?.message}`);
    }

    return convertToAIPrediction(data);
  }
}

export const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();
