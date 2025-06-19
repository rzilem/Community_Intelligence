
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  workflow_type: string;
  template_data: Record<string, any>;
  ai_optimization_score: number;
  usage_count: number;
  is_ai_recommended: boolean;
  created_by?: string;
  association_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_template_id: string;
  association_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  execution_data: Record<string, any>;
  performance_metrics: Record<string, number>;
  ai_insights: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentProcessingItem {
  id: string;
  document_id: string;
  processing_type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  ai_classification: Record<string, any>;
  confidence_score: number;
  extracted_data: Record<string, any>;
  processing_results: Record<string, any>;
  workflow_triggers: any[];
  created_at: string;
  updated_at: string;
}

export interface AIPrediction {
  id: string;
  association_id: string;
  prediction_type: string;
  prediction_data: Record<string, any>;
  confidence_level: number;
  actual_outcome?: Record<string, any>;
  accuracy_score?: number;
  model_version: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationIntelligence {
  id: string;
  communication_id?: string;
  association_id: string;
  message_content: string;
  ai_category?: string;
  sentiment_score: number;
  urgency_level: 'low' | 'normal' | 'high' | 'urgent';
  suggested_responses: any[];
  auto_routing_rules: Record<string, any>;
  confidence_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AutomationRule {
  id: string;
  association_id: string;
  rule_name: string;
  rule_type: string;
  trigger_conditions: Record<string, any>;
  action_sequence: any[];
  is_active: boolean;
  learning_enabled: boolean;
  performance_stats: Record<string, any>;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAnalytic {
  id: string;
  workflow_execution_id: string;
  association_id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  measurement_date: string;
  created_at: string;
}

export interface AIModelPerformance {
  id: string;
  model_name: string;
  model_version: string;
  performance_metrics: Record<string, any>;
  training_data_size: number;
  accuracy_score: number;
  last_trained?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  event_data: Record<string, any>;
  user_id?: string;
  association_id?: string;
  timestamp: string;
  correlation_id: string;
}
