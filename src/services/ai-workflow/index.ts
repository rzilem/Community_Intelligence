
// AI Workflow Services barrel file
export * from './intelligent-workflow-engine';
export * from './smart-document-processor';
export * from './predictive-analytics-engine';
export * from './communication-intelligence-hub';
export * from './automation-rules-engine';

// Initialize all AI workflow services
import { automationRulesEngine } from './automation-rules-engine';
import { devLog } from '@/utils/dev-logger';

export const initializeAIWorkflowServices = async () => {
  try {
    devLog.info('Initializing AI Workflow Services...');
    
    // Initialize automation rules engine
    await automationRulesEngine.initialize();
    
    devLog.info('AI Workflow Services initialized successfully');
  } catch (error) {
    devLog.error('Failed to initialize AI Workflow Services', error);
  }
};

// Auto-initialize services when module is imported
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  initializeAIWorkflowServices();
}
