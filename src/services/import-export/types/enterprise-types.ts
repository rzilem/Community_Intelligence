
// Enterprise feature types
export interface SandboxResult {
  simulationId: string;
  impactAnalysis: {
    recordsAffected: number;
    changesPreview: any[];
    riskAssessment: string;
    estimatedTime: number;
  };
  rollbackPlan: {
    steps: string[];
    estimatedRestoreTime: number;
    backupLocation: string;
  };
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  operation: string;
  user: string;
  details: any;
  rollbackData: any;
}

export interface BusinessIntelligenceMetrics {
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
  };
  performance: {
    processingSpeed: number;
    errorRate: number;
    userSatisfaction: number;
  };
  predictive: {
    trends: any[];
    forecasts: any[];
    recommendations: string[];
  };
}
