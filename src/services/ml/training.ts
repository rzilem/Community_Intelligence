// Use mock implementation
export * from './training-mock';

// Additional exports for compatibility
export const mlTrainingEngine = {
  ...trainingService,
  
  startTraining: async (config: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { jobId: 'training-' + Math.random().toString(36).substr(2, 9) };
  },

  getTrainingStatus: async (jobId: string) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { status: 'completed', progress: 100 };
  }
};

// Import trainingService for the mlTrainingEngine reference
import { trainingService } from './training-mock';