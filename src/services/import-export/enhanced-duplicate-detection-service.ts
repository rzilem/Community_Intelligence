
import { devLog } from '@/utils/dev-logger';
import { duplicateDetectionService, DuplicateMatch } from './duplicate-detection-service';

export interface EnhancedDuplicateMatch extends DuplicateMatch {
  semanticSimilarity?: number;
  contextualRelevance?: number;
  fieldWeights?: Record<string, number>;
}

export interface DuplicateCluster {
  id: string;
  records: Array<{
    fileIndex: number;
    recordIndex: number;
    data: any;
  }>;
  confidence: number;
  commonFields: string[];
  clusterType: 'exact' | 'fuzzy' | 'semantic';
}

export interface EnhancedDuplicateDetectionResult {
  enhancedMatches: EnhancedDuplicateMatch[];
  clusters: DuplicateCluster[];
  totalDuplicates: number;
  highConfidenceMatches: number;
  processingStats: {
    totalComparisons: number;
    processingTime: number;
  };
  qualityScore: number;
  recommendations: {
    suggestions: string[];
    autoActions: string[];
  };
}

export const enhancedDuplicateDetectionService = {
  async detectDuplicatesAdvanced(
    files: Array<{ filename: string; data: any[] }>,
    options: {
      strictMode?: boolean;
      fuzzyMatching?: boolean;
      confidenceThreshold?: number;
      semanticAnalysis?: boolean;
      keyFields?: string[];
    } = {}
  ): Promise<EnhancedDuplicateDetectionResult> {
    const startTime = Date.now();
    devLog.info('Starting advanced duplicate detection...', { fileCount: files.length });

    try {
      // Use the existing duplicate detection service as base
      const baseResult = await duplicateDetectionService.detectDuplicatesAcrossFiles(files);
      
      // Enhance matches with semantic analysis
      const enhancedMatches: EnhancedDuplicateMatch[] = baseResult.duplicates.map(match => ({
        ...match,
        semanticSimilarity: this.calculateSemanticSimilarity(match),
        contextualRelevance: this.calculateContextualRelevance(match),
        fieldWeights: this.calculateFieldWeights(match)
      }));

      // Generate clusters
      const clusters = this.generateClusters(enhancedMatches, files);
      
      // Calculate processing stats
      const processingStats = {
        totalComparisons: this.calculateTotalComparisons(files),
        processingTime: Date.now() - startTime
      };

      const qualityScore = this.calculateQualityScore(enhancedMatches, clusters);
      
      const recommendations = this.generateRecommendations(enhancedMatches, clusters);

      const result: EnhancedDuplicateDetectionResult = {
        enhancedMatches,
        clusters,
        totalDuplicates: enhancedMatches.length,
        highConfidenceMatches: enhancedMatches.filter(m => m.confidence > 0.9).length,
        processingStats,
        qualityScore,
        recommendations
      };

      devLog.info('Advanced duplicate detection completed', {
        totalDuplicates: result.totalDuplicates,
        highConfidenceMatches: result.highConfidenceMatches,
        qualityScore: result.qualityScore
      });

      return result;
    } catch (error) {
      devLog.error('Advanced duplicate detection failed:', error);
      throw error;
    }
  },

  calculateSemanticSimilarity(match: DuplicateMatch): number {
    // Enhanced semantic similarity calculation
    const baseScore = match.confidence;
    const fieldBonus = match.matchingFields.length * 0.1;
    return Math.min(baseScore + fieldBonus, 1.0);
  },

  calculateContextualRelevance(match: DuplicateMatch): number {
    // Calculate contextual relevance based on field types and importance
    const importantFields = ['email', 'phone', 'address', 'name', 'id'];
    const relevantFields = match.matchingFields.filter(field => 
      importantFields.some(important => field.toLowerCase().includes(important))
    );
    
    return relevantFields.length / Math.max(match.matchingFields.length, 1);
  },

  calculateFieldWeights(match: DuplicateMatch): Record<string, number> {
    const weights: Record<string, number> = {};
    const fieldImportance = {
      id: 1.0,
      email: 0.9,
      phone: 0.8,
      address: 0.8,
      name: 0.7,
      first_name: 0.6,
      last_name: 0.6
    };

    match.matchingFields.forEach(field => {
      const normalizedField = field.toLowerCase().replace(/[^a-z]/g, '');
      let weight = 0.5; // default weight
      
      for (const [key, value] of Object.entries(fieldImportance)) {
        if (normalizedField.includes(key)) {
          weight = value;
          break;
        }
      }
      
      weights[field] = weight;
    });

    return weights;
  },

  generateClusters(matches: EnhancedDuplicateMatch[], files: Array<{ filename: string; data: any[] }>): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processedMatches = new Set<string>();

    matches.forEach((match, index) => {
      const matchId = `${match.sourceFile}-${match.sourceIndex}-${match.targetFile}-${match.targetIndex}`;
      
      if (processedMatches.has(matchId)) return;
      
      // Find related matches for clustering
      const relatedMatches = matches.filter((otherMatch, otherIndex) => {
        if (index === otherIndex) return false;
        
        return (
          (match.sourceFile === otherMatch.sourceFile && match.sourceIndex === otherMatch.sourceIndex) ||
          (match.targetFile === otherMatch.targetFile && match.targetIndex === otherMatch.targetIndex) ||
          (match.sourceFile === otherMatch.targetFile && match.sourceIndex === otherMatch.targetIndex) ||
          (match.targetFile === otherMatch.sourceFile && match.targetIndex === otherMatch.sourceIndex)
        );
      });

      if (relatedMatches.length > 0) {
        let matchingFields: string[] = [...match.matchingFields];
        
        // Find common fields across all related matches
        relatedMatches.forEach(relatedMatch => {
          matchingFields = matchingFields.filter(field => 
            relatedMatch.matchingFields.includes(field)
          );
        });

        const cluster: DuplicateCluster = {
          id: `cluster-${clusters.length + 1}`,
          records: [
            {
              fileIndex: files.findIndex(f => f.filename === match.sourceFile),
              recordIndex: match.sourceIndex,
              data: this.getRecordData(files, match.sourceFile, match.sourceIndex)
            },
            {
              fileIndex: files.findIndex(f => f.filename === match.targetFile),
              recordIndex: match.targetIndex,
              data: this.getRecordData(files, match.targetFile, match.targetIndex)
            },
            ...relatedMatches.map(rm => ({
              fileIndex: files.findIndex(f => f.filename === rm.targetFile),
              recordIndex: rm.targetIndex,
              data: this.getRecordData(files, rm.targetFile, rm.targetIndex)
            }))
          ],
          confidence: (match.confidence + relatedMatches.reduce((sum, rm) => sum + rm.confidence, 0)) / (relatedMatches.length + 1),
          commonFields: matchingFields,
          clusterType: match.confidence > 0.95 ? 'exact' : match.semanticSimilarity && match.semanticSimilarity > 0.8 ? 'semantic' : 'fuzzy'
        };

        clusters.push(cluster);
        
        // Mark all related matches as processed
        processedMatches.add(matchId);
        relatedMatches.forEach(rm => {
          const rmId = `${rm.sourceFile}-${rm.sourceIndex}-${rm.targetFile}-${rm.targetIndex}`;
          processedMatches.add(rmId);
        });
      }
    });

    return clusters;
  },

  getRecordData(files: Array<{ filename: string; data: any[] }>, filename: string, index: number): any {
    const file = files.find(f => f.filename === filename);
    return file?.data[index] || {};
  },

  calculateTotalComparisons(files: Array<{ filename: string; data: any[] }>): number {
    let totalComparisons = 0;
    
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        totalComparisons += files[i].data.length * files[j].data.length;
      }
    }
    
    return totalComparisons;
  },

  calculateQualityScore(matches: EnhancedDuplicateMatch[], clusters: DuplicateCluster[]): number {
    if (matches.length === 0) return 100;
    
    const avgConfidence = matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length;
    const highConfidenceRatio = matches.filter(m => m.confidence > 0.8).length / matches.length;
    const clusterEfficiency = clusters.length > 0 ? 
      clusters.reduce((sum, cluster) => sum + cluster.confidence, 0) / clusters.length : 1;
    
    return Math.round((avgConfidence * 0.4 + highConfidenceRatio * 0.3 + clusterEfficiency * 0.3) * 100);
  },

  generateRecommendations(matches: EnhancedDuplicateMatch[], clusters: DuplicateCluster[]): {
    suggestions: string[];
    autoActions: string[];
  } {
    const suggestions: string[] = [];
    const autoActions: string[] = [];

    const highConfidenceMatches = matches.filter(m => m.confidence > 0.95);
    const mediumConfidenceMatches = matches.filter(m => m.confidence > 0.7 && m.confidence <= 0.95);
    const lowConfidenceMatches = matches.filter(m => m.confidence <= 0.7);

    if (highConfidenceMatches.length > 0) {
      suggestions.push(`${highConfidenceMatches.length} high-confidence duplicates can be automatically merged`);
      autoActions.push(`auto_merge_${highConfidenceMatches.length}_records`);
    }

    if (mediumConfidenceMatches.length > 0) {
      suggestions.push(`${mediumConfidenceMatches.length} potential duplicates require manual review`);
    }

    if (lowConfidenceMatches.length > 0) {
      suggestions.push(`${lowConfidenceMatches.length} low-confidence matches may be false positives`);
    }

    if (clusters.length > 0) {
      const exactClusters = clusters.filter(c => c.clusterType === 'exact').length;
      if (exactClusters > 0) {
        suggestions.push(`${exactClusters} exact duplicate clusters found`);
        autoActions.push(`resolve_${exactClusters}_exact_clusters`);
      }
    }

    return { suggestions, autoActions };
  },

  // Additional utility methods
  async compareRecords(record1: any, record2: any, options: {
    fieldWeights?: Record<string, number>;
    enableSemanticAnalysis?: boolean;
  } = {}): Promise<EnhancedDuplicateMatch | null> {
    // Enhanced record comparison with semantic analysis
    const baseMatch = duplicateDetectionService.compareRecords(record1, record2, 0, 0);
    
    if (!baseMatch) return null;

    return {
      ...baseMatch,
      semanticSimilarity: this.calculateSemanticSimilarity(baseMatch),
      contextualRelevance: this.calculateContextualRelevance(baseMatch),
      fieldWeights: options.fieldWeights || this.calculateFieldWeights(baseMatch)
    };
  }
};
