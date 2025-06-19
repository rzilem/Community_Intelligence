
import { devLog } from '@/utils/dev-logger';

export interface DuplicateDetectionOptions {
  strictMode?: boolean;
  fuzzyMatching?: boolean;
  confidenceThreshold?: number;
  fieldWeights?: Record<string, number>;
  semanticAnalysis?: boolean;
}

export interface DuplicateResult {
  totalDuplicates: number;
  duplicateGroups: Array<{
    masterRecord: any;
    duplicates: any[];
    confidence: number;
    matchingFields: string[];
  }>;
  suggestions: string[];
}

export interface EnhancedDuplicateDetectionResult {
  totalDuplicates: number;
  duplicateClusters: DuplicateCluster[];
  enhancedMatches: EnhancedDuplicateMatch[];
  clusters: DuplicateCluster[];
  qualityScore: number;
  recommendations: {
    suggestions: string[];
  };
  processingStats: {
    totalComparisons: number;
    processingTime: number;
  };
}

export interface EnhancedDuplicateMatch {
  sourceFile: string;
  targetFile: string;
  sourceIndex: number;
  targetIndex: number;
  confidence: number;
  matchingFields: string[];
}

export interface DuplicateCluster {
  clusterId: string;
  records: any[];
  confidence: number;
  commonFields: string[];
}

export const enhancedDuplicateDetectionService = {
  async detectDuplicatesAdvanced(
    fileData: Array<{ filename: string; data: any[] }>,
    options: DuplicateDetectionOptions = {}
  ): Promise<EnhancedDuplicateDetectionResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced duplicate detection', { 
      fileCount: fileData.length,
      options 
    });

    const allRecords = fileData.flatMap((file, fileIndex) => 
      file.data.map((record, recordIndex) => ({ 
        ...record, 
        _source: file.filename,
        _fileIndex: fileIndex,
        _recordIndex: recordIndex
      }))
    );

    const duplicateGroups = this.findDuplicateGroups(allRecords, options);
    const enhancedMatches = this.generateEnhancedMatches(duplicateGroups, fileData);
    const clusters = this.generateClusters(duplicateGroups);
    
    const processingTime = Date.now() - startTime;
    
    return {
      totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.duplicates.length, 0),
      duplicateClusters: clusters,
      enhancedMatches,
      clusters,
      qualityScore: this.calculateQualityScore(duplicateGroups),
      recommendations: {
        suggestions: this.generateSuggestions(duplicateGroups)
      },
      processingStats: {
        totalComparisons: this.calculateTotalComparisons(allRecords.length),
        processingTime
      }
    };
  },

  private findDuplicateGroups(records: any[], options: DuplicateDetectionOptions): any[] {
    const groups: any[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < records.length; i++) {
      if (processed.has(i)) continue;

      const duplicates: any[] = [];
      
      for (let j = i + 1; j < records.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculateSimilarity(records[i], records[j], options);
        
        if (similarity.confidence >= (options.confidenceThreshold || 0.8)) {
          duplicates.push({
            record: records[j],
            confidence: similarity.confidence,
            matchingFields: similarity.matchingFields
          });
          processed.add(j);
        }
      }

      if (duplicates.length > 0) {
        groups.push({
          masterRecord: records[i],
          duplicates: duplicates.map(d => d.record),
          confidence: duplicates.reduce((sum, d) => sum + d.confidence, 0) / duplicates.length,
          matchingFields: this.getMostCommonFields(duplicates.map(d => d.matchingFields))
        });
        processed.add(i);
      }
    }

    return groups;
  },

  private generateEnhancedMatches(duplicateGroups: any[], fileData: Array<{ filename: string; data: any[] }>): EnhancedDuplicateMatch[] {
    const matches: EnhancedDuplicateMatch[] = [];
    
    duplicateGroups.forEach(group => {
      group.duplicates.forEach((duplicate: any) => {
        matches.push({
          sourceFile: group.masterRecord._source,
          targetFile: duplicate._source,
          sourceIndex: group.masterRecord._recordIndex,
          targetIndex: duplicate._recordIndex,
          confidence: group.confidence,
          matchingFields: group.matchingFields
        });
      });
    });

    return matches;
  },

  private generateClusters(duplicateGroups: any[]): DuplicateCluster[] {
    return duplicateGroups.map((group, index) => ({
      clusterId: `cluster_${index}`,
      records: [group.masterRecord, ...group.duplicates],
      confidence: group.confidence,
      commonFields: group.matchingFields
    }));
  },

  private calculateSimilarity(record1: any, record2: any, options: DuplicateDetectionOptions): any {
    const matchingFields: string[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    const fieldWeights = options.fieldWeights || {};
    const defaultWeight = 1;

    Object.keys(record1).forEach(field => {
      if (field.startsWith('_')) return; // Skip internal fields

      const weight = fieldWeights[field] || defaultWeight;
      totalWeight += weight;

      if (this.fieldsMatch(record1[field], record2[field], options)) {
        matchingFields.push(field);
        matchedWeight += weight;
      }
    });

    return {
      confidence: totalWeight > 0 ? matchedWeight / totalWeight : 0,
      matchingFields
    };
  },

  private fieldsMatch(value1: any, value2: any, options: DuplicateDetectionOptions): boolean {
    if (value1 === value2) return true;
    if (!value1 || !value2) return false;

    const str1 = String(value1).toLowerCase().trim();
    const str2 = String(value2).toLowerCase().trim();

    if (str1 === str2) return true;

    if (options.fuzzyMatching) {
      return this.fuzzyMatch(str1, str2);
    }

    return false;
  },

  private fuzzyMatch(str1: string, str2: string): boolean {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity > 0.8;
  },

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    return matrix[str2.length][str1.length];
  },

  private getMostCommonFields(fieldArrays: string[][]): string[] {
    const fieldCounts: Record<string, number> = {};
    
    fieldArrays.forEach(fields => {
      fields.forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    });

    return Object.entries(fieldCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([field]) => field);
  },

  private calculateQualityScore(duplicateGroups: any[]): number {
    if (duplicateGroups.length === 0) return 100;
    
    const avgConfidence = duplicateGroups.reduce((sum, group) => sum + group.confidence, 0) / duplicateGroups.length;
    return Math.round(avgConfidence * 100);
  },

  private calculateTotalComparisons(recordCount: number): number {
    return (recordCount * (recordCount - 1)) / 2;
  },

  private generateSuggestions(duplicateGroups: any[]): string[] {
    const suggestions: string[] = [];

    if (duplicateGroups.length > 0) {
      suggestions.push(`Found ${duplicateGroups.length} groups of potential duplicates.`);
      suggestions.push('Review each group carefully before taking action.');
      
      const highConfidenceGroups = duplicateGroups.filter(g => g.confidence > 0.9);
      if (highConfidenceGroups.length > 0) {
        suggestions.push(`${highConfidenceGroups.length} groups have high confidence matches (>90%).`);
      }
    }

    return suggestions;
  }
};
