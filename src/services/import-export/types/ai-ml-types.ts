
// AI and ML specific types
export interface MLFeedback {
  documentId: string;
  originalClassification: string;
  correctedClassification: string;
  userConfidence: number;
  feedbackType: 'correction' | 'confirmation';
  timestamp: string;
}

export interface MLTemplatePattern {
  id: string;
  documentType: string;
  pattern: any;
  confidence: number;
  learnedFrom: string[];
  lastUpdated: string;
}

export interface PredictiveInsight {
  type: 'error_prevention' | 'optimization' | 'quality_improvement';
  description: string;
  confidence: number;
  suggestedAction: string;
  impact: 'low' | 'medium' | 'high';
}
