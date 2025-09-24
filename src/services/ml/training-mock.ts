// Mock implementation for ML training service

export interface MLTrainingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  job_status: 'pending' | 'running' | 'completed' | 'failed';
  type: string;
  model_type: string;
  training_data_size: number;
  started_at?: string;
  completed_at?: string;
  accuracy_improvement?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface MLModelPerformance {
  id: string;
  model_name: string;
  model_version: string;
  performance_metrics: Record<string, number>;
  accuracy_score: number;
  is_active: boolean;
  training_data_size: number;
  last_trained: string;
  created_at: string;
}

export interface TrainingDataset {
  id: string;
  name: string;
  type: string;
  size: number;
  quality_score: number;
  last_updated: string;
  created_at: string;
}

export const trainingService = {
  createTrainingJob: async (params: any): Promise<MLTrainingJob> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: 'training-' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      job_status: 'pending',
      type: params.type || 'general',
      model_type: params.model_type || 'classification',
      training_data_size: params.training_data_size || 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  getTrainingJobs: async (associationId?: string): Promise<MLTrainingJob[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [];
  },

  updateTrainingJob: async (id: string, updates: Partial<MLTrainingJob>): Promise<MLTrainingJob> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      id,
      status: updates.status || 'pending',
      job_status: updates.job_status || updates.status || 'pending',
      type: updates.type || 'general',
      model_type: updates.model_type || 'classification',
      training_data_size: updates.training_data_size || 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  getModelPerformance: async (associationId?: string): Promise<MLModelPerformance[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [];
  },

  getTrainingDatasets: async (associationId?: string): Promise<TrainingDataset[]> => {
    await new Promise(resolve => setTimeout(resolve, 180));
    return [];
  }
};