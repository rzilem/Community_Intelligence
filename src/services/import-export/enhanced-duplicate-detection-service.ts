
import { devLog } from '@/utils/dev-logger';
import { duplicateDetectionService, DuplicateMatch, DuplicateDetectionResult } from './duplicate-detection-service';

export interface EnhancedDuplicateMatch extends DuplicateMatch {
  contextualSimilarity: number;
  semanticSimilarity: number;
  fieldWeights: Record<string, number>;
  clusterGroup?: string;
  mergeRecommendation: 'auto' | 'manual' | 'skip';
}

export interface DuplicateCluster {
  id: string;
  records: any[];
  confidence: number;
  mergeAction: 'auto' | 'manual' | 'skip';
  commonFields: string[];
  differences: Record<string, any[]>;
}

export interface EnhancedDuplicateDetectionResult extends DuplicateDetectionResult {
  clusters: DuplicateCluster[];
  enhancedMatches: EnhancedDuplicateMatch[];
  processingStats: {
    totalComparisons: number;
    processingTime: number;
    memoryUsage: number;
  };
  qualityScore: number;
  recommendations: {
    autoMerge: number;
    manualReview: number;
    suggestions: string[];
  };
}

export interface PerformanceOptimization {
  batchSize: number;
  parallelProcessing: boolean;
  cacheResults: boolean;
  indexedSearch: boolean;
}

export interface AdvancedDetectionOptions {
  strictMode?: boolean;
  fuzzyMatching?: boolean;
  keyFields?: string[];
  confidenceThreshold?: number;
  semanticAnalysis?: boolean;
  contextualMatching?: boolean;
  fieldWeighting?: Record<string, number>;
  performanceOptimization?: PerformanceOptimization;
}

export const enhancedDuplicateDetectionService = {
  async detectDuplicatesAdvanced(
    files: Array<{ filename: string; data: any[] }>,
    options: AdvancedDetectionOptions = {}
  ): Promise<EnhancedDuplicateDetectionResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced duplicate detection', { 
      fileCount: files.length,
      options 
    });

    try {
      // Get basic duplicate detection results
      const basicResults = await duplicateDetectionService.detectDuplicatesAcrossFiles(files, options);
      
      // Enhance the matches with additional analysis
      const enhancedMatches = await this.enhanceMatches(basicResults.duplicates, options);
      
      // Create clusters from enhanced matches
      const clusters = this.createDuplicateClusters(enhancedMatches);
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(enhancedMatches, clusters);
      
      // Generate enhanced recommendations
      const recommendations = this.generateEnhancedRecommendations(enhancedMatches, clusters);
      
      const processingTime = Date.now() - startTime;
      
      const result: EnhancedDuplicateDetectionResult = {
        ...basicResults,
        enhancedMatches,
        clusters,
        processingStats: {
          totalComparisons: enhancedMatches.length,
          processingTime,
          memoryUsage: 0 // Would be calculated in real implementation
        },
        qualityScore,
        recommendations: {
          autoMerge: enhancedMatches.filter(m => m.mergeRecommendation === 'auto').length,
          manualReview: enhancedMatches.filter(m => m.mergeRecommendation === 'manual').length,
          suggestions: recommendations
        }
      };

      devLog.info('Enhanced duplicate detection completed', {
        totalMatches: enhancedMatches.length,
        clusters: clusters.length,
        qualityScore,
        processingTime
      });

      return result;
    } catch (error) {
      devLog.error('Enhanced duplicate detection failed', error);
      throw error;
    }
  },

  async enhanceMatches(
    basicMatches: DuplicateMatch[],
    options: AdvancedDetectionOptions
  ): Promise<EnhancedDuplicateMatch[]> {
    const enhanced: EnhancedDuplicateMatch[] = [];
    
    for (const match of basicMatches) {
      const enhancedMatch: EnhancedDuplicateMatch = {
        ...match,
        contextualSimilarity: this.calculateContextualSimilarity(match),
        semanticSimilarity: options.semanticAnalysis ? 
          await this.calculateSemanticSimilarity(match) : 0,
        fieldWeights: options.fieldWeighting || {},
        mergeRecommendation: this.determineMergeRecommendation(match, options)
      };
      
      enhanced.push(enhancedMatch);
    }
    
    return enhanced;
  },

  calculateContextualSimilarity(match: DuplicateMatch): number {
    // Analyze field context and relationships
    let contextScore = 0;
    const contextualFields = ['address', 'name', 'email', 'phone'];
    
    const matchingContextFields = match.matchingFields.filter(field => 
      contextualFields.some(cf => field.toLowerCase().includes(cf))
    );
    
    contextScore = matchingContextFields.length / contextualFields.length;
    return Math.min(contextScore, 1.0);
  },

  async calculateSemanticSimilarity(match: DuplicateMatch): Promise<number> {
    // Placeholder for semantic analysis
    // In real implementation, this would use NLP libraries
    return Math.random() * 0.3 + 0.7; // Mock high similarity
  },

  determineMergeRecommendation(
    match: DuplicateMatch, 
    options: AdvancedDetectionOptions
  ): 'auto' | 'manual' | 'skip' {
    const threshold = options.confidenceThreshold || 0.8;
    
    if (match.confidence > 0.95 && options.strictMode !== true) {
      return 'auto';
    } else if (match.confidence > threshold) {
      return 'manual';
    } else {
      return 'skip';
    }
  },

  createDuplicateClusters(matches: EnhancedDuplicateMatch[]): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processedRecords = new Set<string>();
    
    for (const match of matches) {
      const recordKey = `${match.sourceFile}-${match.sourceIndex}`;
      const targetKey = `${match.targetFile}-${match.targetIndex}`;
      
      if (!processedRecords.has(recordKey) && !processedRecords.has(targetKey)) {
        const cluster: DuplicateCluster = {
          id: `cluster-${clusters.length + 1}`,
          records: [
            { file: match.sourceFile, index: match.sourceIndex },
            { file: match.targetFile, index: match.targetIndex }
          ],
          confidence: match.confidence,
          mergeAction: match.mergeRecommendation,
          commonFields: match.matchingFields,
          differences: {}
        };
        
        clusters.push(cluster);
        processedRecords.add(recordKey);
        processedRecords.add(targetKey);
      }
    }
    
    return clusters;
  },

  calculateQualityScore(
    matches: EnhancedDuplicateMatch[], 
    clusters: DuplicateCluster[]
  ): number {
    if (matches.length === 0) return 100;
    
    const avgConfidence = matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length;
    const avgContextual = matches.reduce((sum, m) => sum + m.contextualSimilarity, 0) / matches.length;
    const avgSemantic = matches.reduce((sum, m) => sum + m.semanticSimilarity, 0) / matches.length;
    
    return Math.round((avgConfidence * 0.5 + avgContextual * 0.3 + avgSemantic * 0.2) * 100);
  },

  generateEnhancedRecommendations(
    matches: EnhancedDuplicateMatch[], 
    clusters: DuplicateCluster[]
  ): string[] {
    const recommendations: string[] = [];
    
    const autoMergeCount = matches.filter(m => m.mergeRecommendation === 'auto').length;
    const manualReviewCount = matches.filter(m => m.mergeRecommendation === 'manual').length;
    
    if (autoMergeCount > 0) {
      recommendations.push(`${autoMergeCount} duplicates can be automatically merged`);
    }
    
    if (manualReviewCount > 0) {
      recommendations.push(`${manualReviewCount} potential duplicates need manual review`);
    }
    
    if (clusters.length > 10) {
      recommendations.push(`High number of duplicate clusters detected (${clusters.length})`);
    }
    
    return recommendations;
  },

  // Performance optimization methods
  async detectWithBatching(
    files: Array<{ filename: string; data: any[] }>,
    batchSize: number = 100
  ): Promise<EnhancedDuplicateDetectionResult> {
    const batches = this.createBatches(files, batchSize);
    const allResults: EnhancedDuplicateDetectionResult[] = [];
    
    for (const batch of batches) {
      const result = await this.detectDuplicatesAdvanced(batch);
      allResults.push(result);
    }
    
    return this.mergeBatchResults(allResults);
  },

  createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  },

  mergeBatchResults(results: EnhancedDuplicateDetectionResult[]): EnhancedDuplicateDetectionResult {
    if (results.length === 0) {
      throw new Error('No batch results to merge');
    }
    
    if (results.length === 1) {
      return results[0];
    }
    
    const merged = results[0];
    
    for (let i = 1; i < results.length; i++) {
      const result = results[i];
      merged.duplicates.push(...result.duplicates);
      merged.enhancedMatches.push(...result.enhancedMatches);
      merged.clusters.push(...result.clusters);
      merged.totalDuplicates += result.totalDuplicates;
      merged.highConfidenceMatches += result.highConfidenceMatches;
      merged.suggestions.push(...result.suggestions);
      merged.processingStats.totalComparisons += result.processingStats.totalComparisons;
      merged.processingStats.processingTime += result.processingStats.processingTime;
    }
    
    // Recalculate quality score for merged results
    merged.qualityScore = this.calculateQualityScore(merged.enhancedMatches, merged.clusters);
    
    return merged;
  },

  // Field analysis methods
  analyzeFieldTypes(records: any[]): Record<string, string> {
    const fieldTypes: Record<string, string> = {};
    
    if (records.length === 0) return fieldTypes;
    
    const sampleRecord = records[0];
    
    for (const [field, value] of Object.entries(sampleRecord)) {
      if (typeof value === 'string') {
        if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
          fieldTypes[field] = 'date';
        } else if (value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
          fieldTypes[field] = 'email';
        } else if (value.match(/^\d{10,}$/)) {
          fieldTypes[field] = 'phone';
        } else {
          fieldTypes[field] = 'text';
        }
      } else if (typeof value === 'number') {
        fieldTypes[field] = 'number';
      } else {
        fieldTypes[field] = 'unknown';
      }
    }
    
    return fieldTypes;
  },

  calculateFieldImportance(
    records: any[], 
    fieldTypes: Record<string, string>
  ): Record<string, number> {
    const importance: Record<string, number> = {};
    
    for (const [field, type] of Object.entries(fieldTypes)) {
      let score = 0.5; // Base score
      
      // Increase importance for key field types
      switch (type) {
        case 'email':
          score = 0.9;
          break;
        case 'phone':
          score = 0.8;
          break;
        case 'date':
          score = 0.7;
          break;
        default:
          // Check if field name suggests importance
          const lowerField = field.toLowerCase();
          if (lowerField.includes('name') || lowerField.includes('id')) {
            score = 0.8;
          } else if (lowerField.includes('address')) {
            score = 0.7;
          }
      }
      
      // Adjust based on data completeness
      const completeness = this.calculateFieldCompleteness(records, field);
      importance[field] = score * completeness;
    }
    
    return importance;
  },

  calculateFieldCompleteness(records: any[], field: string): number {
    const nonEmptyCount = records.filter(record => {
      const value = record[field];
      return value !== null && value !== undefined && value !== '';
    }).length;
    
    return records.length > 0 ? nonEmptyCount / records.length : 0;
  }
};
