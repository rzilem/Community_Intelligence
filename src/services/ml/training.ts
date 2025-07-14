import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface MLTrainingJob {
  id: string;
  association_id: string;
  model_type: string;
  training_data_size: number;
  job_status: 'pending' | 'running' | 'completed' | 'failed';
  accuracy_improvement?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface MLModelPerformance {
  id: string;
  model_name: string;
  model_version: string;
  performance_metrics: Record<string, any>;
  accuracy_score: number;
  training_data_size: number;
  last_trained?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingDataset {
  name: string;
  type: 'invoice_processing' | 'maintenance_prediction' | 'resident_insights' | 'financial_forecasting';
  size: number;
  quality_score: number;
  last_updated: string;
}

export class MLTrainingEngine {
  async createTrainingJob(params: {
    association_id: string;
    model_type: string;
    training_data_size: number;
  }): Promise<MLTrainingJob> {
    try {
      const { data, error } = await supabase
        .from('ai_model_training_jobs')
        .insert({
          association_id: params.association_id,
          model_type: params.model_type,
          training_data_size: params.training_data_size,
          job_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Created ML training job', data);
      return data as MLTrainingJob;
    } catch (error) {
      devLog.error('Failed to create ML training job', error);
      throw new Error(`Failed to create training job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrainingJobs(associationId: string): Promise<MLTrainingJob[]> {
    try {
      const { data, error } = await supabase
        .from('ai_model_training_jobs')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as MLTrainingJob[]) || [];
    } catch (error) {
      devLog.error('Failed to fetch training jobs', error);
      throw new Error(`Failed to fetch training jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateTrainingJob(jobId: string, updates: Partial<MLTrainingJob>): Promise<MLTrainingJob> {
    try {
      const { data, error } = await supabase
        .from('ai_model_training_jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Updated ML training job', data);
      return data as MLTrainingJob;
    } catch (error) {
      devLog.error('Failed to update training job', error);
      throw new Error(`Failed to update training job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getModelPerformance(): Promise<MLModelPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('ai_model_performance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as MLModelPerformance[]) || [];
    } catch (error) {
      devLog.error('Failed to fetch model performance', error);
      throw new Error(`Failed to fetch model performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrainingDatasets(associationId: string): Promise<TrainingDataset[]> {
    // Mock datasets based on association data
    const datasets: TrainingDataset[] = [
      {
        name: 'Invoice Processing Dataset',
        type: 'invoice_processing',
        size: 1250,
        quality_score: 0.92,
        last_updated: new Date().toISOString()
      },
      {
        name: 'Maintenance Prediction Dataset',
        type: 'maintenance_prediction',
        size: 890,
        quality_score: 0.87,
        last_updated: new Date().toISOString()
      },
      {
        name: 'Resident Insights Dataset',
        type: 'resident_insights',
        size: 2100,
        quality_score: 0.94,
        last_updated: new Date().toISOString()
      },
      {
        name: 'Financial Forecasting Dataset',
        type: 'financial_forecasting',
        size: 650,
        quality_score: 0.89,
        last_updated: new Date().toISOString()
      }
    ];

    return datasets;
  }

  async optimizeModel(modelId: string, optimizationParams: Record<string, any>): Promise<void> {
    try {
      // Create a new training job for optimization
      const { error } = await supabase
        .from('ai_model_training_jobs')
        .insert({
          association_id: optimizationParams.association_id,
          model_type: `${optimizationParams.model_type}_optimized`,
          training_data_size: optimizationParams.training_data_size || 1000,
          job_status: 'pending'
        });

      if (error) throw error;
      
      devLog.info('Started model optimization', { modelId, optimizationParams });
    } catch (error) {
      devLog.error('Failed to optimize model', error);
      throw new Error(`Failed to optimize model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrainingMetrics(jobId: string): Promise<Record<string, any>> {
    // Mock training metrics
    return {
      accuracy: 0.94,
      precision: 0.91,
      recall: 0.88,
      f1_score: 0.89,
      training_time: '00:45:32',
      epochs_completed: 150,
      validation_loss: 0.0234,
      learning_rate: 0.001
    };
  }
}

export const mlTrainingEngine = new MLTrainingEngine();