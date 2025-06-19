
import { devLog } from '@/utils/dev-logger';
import { MLTemplatePattern, MLFeedback, PredictiveInsight } from './types';

export class MLTemplateLearningService {
  private patterns: Map<string, MLTemplatePattern> = new Map();
  private feedbackHistory: MLFeedback[] = [];

  async collectUserFeedback(feedback: MLFeedback): Promise<void> {
    devLog.info('Collecting user feedback for ML learning:', feedback);
    
    this.feedbackHistory.push(feedback);
    
    // Update pattern confidence based on feedback
    await this.updatePatternConfidence(feedback);
    
    // Learn new patterns if needed
    if (feedback.feedbackType === 'correction') {
      await this.learnFromCorrection(feedback);
    }
  }

  async classifyDocumentWithLearning(content: string, filename: string): Promise<{
    classification: string;
    confidence: number;
    learningOpportunities: string[];
  }> {
    devLog.info('Classifying document with ML learning:', filename);
    
    const patterns = this.getRelevantPatterns(content);
    let bestMatch = this.findBestMatch(content, patterns);
    
    const learningOpportunities: string[] = [];
    
    if (!bestMatch || bestMatch.confidence < 0.7) {
      learningOpportunities.push('Document classification uncertain - user feedback would improve accuracy');
    }
    
    if (this.isNovelPattern(content)) {
      learningOpportunities.push('Potentially new document type detected - consider creating new classification');
    }
    
    return {
      classification: bestMatch?.documentType || 'unknown',
      confidence: bestMatch?.confidence || 0.5,
      learningOpportunities
    };
  }

  async generatePredictiveInsights(documentHistory: any[]): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    // Analyze common error patterns
    const errorPatterns = this.analyzeErrorPatterns();
    if (errorPatterns.length > 0) {
      insights.push({
        type: 'error_prevention',
        description: `Detected recurring issues with ${errorPatterns[0].type} documents`,
        confidence: 0.8,
        suggestedAction: `Consider pre-processing ${errorPatterns[0].type} documents to improve accuracy`,
        impact: 'medium'
      });
    }
    
    // Suggest processing optimizations
    const optimizations = this.suggestOptimizations(documentHistory);
    insights.push(...optimizations);
    
    // Quality improvement suggestions
    const qualityImprovements = this.suggestQualityImprovements();
    insights.push(...qualityImprovements);
    
    devLog.info('Generated predictive insights:', insights);
    return insights;
  }

  async updateTemplateLearning(documentType: string, patterns: any): Promise<void> {
    const patternId = `${documentType}_${Date.now()}`;
    
    const templatePattern: MLTemplatePattern = {
      id: patternId,
      documentType,
      pattern: patterns,
      confidence: 0.7,
      learnedFrom: [patternId],
      lastUpdated: new Date().toISOString()
    };
    
    this.patterns.set(patternId, templatePattern);
    devLog.info('Updated template learning:', templatePattern);
  }

  private async updatePatternConfidence(feedback: MLFeedback): Promise<void> {
    for (const [id, pattern] of this.patterns) {
      if (pattern.documentType === feedback.originalClassification) {
        if (feedback.feedbackType === 'confirmation') {
          pattern.confidence = Math.min(pattern.confidence + 0.1, 1.0);
        } else if (feedback.feedbackType === 'correction') {
          pattern.confidence = Math.max(pattern.confidence - 0.1, 0.1);
        }
        pattern.lastUpdated = new Date().toISOString();
      }
    }
  }

  private async learnFromCorrection(feedback: MLFeedback): Promise<void> {
    // Create or update pattern for corrected classification
    const correctedPatternId = `corrected_${feedback.correctedClassification}_${Date.now()}`;
    
    const newPattern: MLTemplatePattern = {
      id: correctedPatternId,
      documentType: feedback.correctedClassification,
      pattern: { learnedFromCorrection: true },
      confidence: feedback.userConfidence,
      learnedFrom: [feedback.documentId],
      lastUpdated: new Date().toISOString()
    };
    
    this.patterns.set(correctedPatternId, newPattern);
  }

  private getRelevantPatterns(content: string): MLTemplatePattern[] {
    return Array.from(this.patterns.values()).filter(pattern => 
      pattern.confidence > 0.5
    );
  }

  private findBestMatch(content: string, patterns: MLTemplatePattern[]): MLTemplatePattern | null {
    // Simple content-based matching - in real implementation, this would use ML
    const contentLower = content.toLowerCase();
    
    for (const pattern of patterns) {
      if (contentLower.includes(pattern.documentType.toLowerCase())) {
        return pattern;
      }
    }
    
    return patterns.length > 0 ? patterns[0] : null;
  }

  private isNovelPattern(content: string): boolean {
    // Detect if this might be a new type of document
    const existingTypes = new Set(Array.from(this.patterns.values()).map(p => p.documentType));
    return existingTypes.size < 5; // Simple heuristic
  }

  private analyzeErrorPatterns(): Array<{ type: string; frequency: number }> {
    const errorCounts = new Map<string, number>();
    
    this.feedbackHistory
      .filter(f => f.feedbackType === 'correction')
      .forEach(f => {
        const current = errorCounts.get(f.originalClassification) || 0;
        errorCounts.set(f.originalClassification, current + 1);
      });
    
    return Array.from(errorCounts.entries())
      .map(([type, frequency]) => ({ type, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private suggestOptimizations(documentHistory: any[]): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    if (documentHistory.length > 100) {
      insights.push({
        type: 'optimization',
        description: 'Large document volume detected - batch processing recommended',
        confidence: 0.9,
        suggestedAction: 'Enable batch processing for documents over 100 files',
        impact: 'high'
      });
    }
    
    return insights;
  }

  private suggestQualityImprovements(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    const lowConfidenceCount = this.feedbackHistory.filter(f => f.userConfidence < 0.7).length;
    
    if (lowConfidenceCount > 5) {
      insights.push({
        type: 'quality_improvement',
        description: 'Multiple low-confidence classifications detected',
        confidence: 0.8,
        suggestedAction: 'Consider improving document preprocessing or adding more training data',
        impact: 'medium'
      });
    }
    
    return insights;
  }

  // Export learning data for analysis
  exportLearningData(): { patterns: MLTemplatePattern[]; feedback: MLFeedback[] } {
    return {
      patterns: Array.from(this.patterns.values()),
      feedback: this.feedbackHistory
    };
  }

  // Import learning data from previous sessions
  importLearningData(data: { patterns: MLTemplatePattern[]; feedback: MLFeedback[] }): void {
    this.patterns.clear();
    data.patterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
    this.feedbackHistory = data.feedback;
  }
}

export const mlTemplateLearningService = new MLTemplateLearningService();
