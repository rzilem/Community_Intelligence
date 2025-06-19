import { devLog } from '@/utils/dev-logger';

export interface EnhancedDuplicateMatch {
  id: string;
  sourceRecord: any;
  targetRecord: any;
  sourceIndex: number;
  targetIndex: number;
  sourceFile: string;
  targetFile: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'phonetic';
  matchingFields: Array<{
    field: string;
    sourceValue: any;
    targetValue: any;
    similarity: number;
    matchType: string;
  }>;
  suggestedAction: 'merge' | 'skip' | 'keep_both' | 'manual_review';
  riskLevel: 'low' | 'medium' | 'high';
  mergeStrategy?: 'prefer_source' | 'prefer_target' | 'combine' | 'manual';
  qualityScore: number;
}

export interface DuplicateCluster {
  id: string;
  records: any[];
  masterRecord: any;
  confidence: number;
  clusterSize: number;
  suggestedAction: string;
}

export interface EnhancedDuplicateDetectionResult {
  duplicates: EnhancedDuplicateMatch[];
  clusters: DuplicateCluster[];
  totalDuplicates: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  suggestions: string[];
  performanceMetrics: {
    processingTime: number;
    recordsProcessed: number;
    comparisons: number;
    algorithmsUsed: string[];
  };
}

export const enhancedDuplicateDetectionService = {
  async detectDuplicatesAdvanced(files: Array<{ filename: string; data: any[] }>): Promise<EnhancedDuplicateDetectionResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced duplicate detection...');
    
    const duplicates: EnhancedDuplicateMatch[] = [];
    const allRecords = this.prepareRecordsForComparison(files);
    let comparisons = 0;
    
    // Use multiple detection algorithms
    const algorithms = ['exact', 'fuzzy', 'semantic', 'phonetic'];
    
    for (let i = 0; i < allRecords.length; i++) {
      for (let j = i + 1; j < allRecords.length; j++) {
        comparisons++;
        
        const matches = await this.runMultipleAlgorithms(
          allRecords[i], 
          allRecords[j],
          i,
          j,
          algorithms
        );
        
        const bestMatch = this.selectBestMatch(matches);
        if (bestMatch && bestMatch.confidence > 0.5) {
          duplicates.push(bestMatch);
        }
      }
    }
    
    // Create clusters
    const clusters = this.createDuplicateClusters(duplicates, allRecords);
    
    const processingTime = Date.now() - startTime;
    const result = this.buildDetectionResult(duplicates, clusters, processingTime, comparisons, allRecords.length, algorithms);
    
    devLog.info('Enhanced duplicate detection complete:', {
      duplicates: duplicates.length,
      clusters: clusters.length,
      processingTime,
      comparisons
    });
    
    return result;
  },

  async runMultipleAlgorithms(
    record1: any, 
    record2: any, 
    index1: number, 
    index2: number,
    algorithms: string[]
  ): Promise<EnhancedDuplicateMatch[]> {
    const matches: EnhancedDuplicateMatch[] = [];
    
    for (const algorithm of algorithms) {
      const match = await this.runSingleAlgorithm(record1, record2, index1, index2, algorithm);
      if (match) {
        matches.push(match);
      }
    }
    
    return matches;
  },

  async runSingleAlgorithm(
    record1: any,
    record2: any,
    index1: number,
    index2: number,
    algorithm: string
  ): Promise<EnhancedDuplicateMatch | null> {
    if (record1._source_file === record2._source_file) {
      return null;
    }
    
    let confidence = 0;
    const matchingFields: EnhancedDuplicateMatch['matchingFields'] = [];
    
    switch (algorithm) {
      case 'exact':
        ({ confidence, matchingFields: matchingFields } = this.exactMatch(record1, record2));
        break;
      case 'fuzzy':
        ({ confidence, matchingFields: matchingFields } = this.fuzzyMatch(record1, record2));
        break;
      case 'semantic':
        ({ confidence, matchingFields: matchingFields } = await this.semanticMatch(record1, record2));
        break;
      case 'phonetic':
        ({ confidence, matchingFields: matchingFields } = this.phoneticMatch(record1, record2));
        break;
    }
    
    if (confidence < 0.3) return null;
    
    return {
      id: `${index1}-${index2}-${algorithm}`,
      sourceRecord: record1,
      targetRecord: record2,
      sourceIndex: index1,
      targetIndex: index2,
      sourceFile: record1._source_file,
      targetFile: record2._source_file,
      confidence,
      matchType: algorithm as any,
      matchingFields,
      suggestedAction: this.determineSuggestedAction(confidence, matchingFields),
      riskLevel: this.determineRiskLevel(confidence, matchingFields),
      qualityScore: this.calculateQualityScore(record1, record2, matchingFields)
    };
  },

  exactMatch(record1: any, record2: any) {
    const matchingFields: EnhancedDuplicateMatch['matchingFields'] = [];
    let exactMatches = 0;
    let totalFields = 0;
    
    const allFields = new Set([...Object.keys(record1), ...Object.keys(record2)]);
    allFields.delete('_source_file');
    allFields.delete('_source_index');
    
    for (const field of allFields) {
      if (!record1[field] && !record2[field]) continue;
      
      totalFields++;
      const value1 = this.normalizeValue(record1[field]);
      const value2 = this.normalizeValue(record2[field]);
      
      if (value1 === value2 && value1 !== '') {
        exactMatches++;
        matchingFields.push({
          field,
          sourceValue: record1[field],
          targetValue: record2[field],
          similarity: 1.0,
          matchType: 'exact'
        });
      }
    }
    
    const confidence = totalFields > 0 ? exactMatches / totalFields : 0;
    return { confidence, matchingFields };
  },

  fuzzyMatch(record1: any, record2: any) {
    const matchingFields: EnhancedDuplicateMatch['matchingFields'] = [];
    let fuzzyScore = 0;
    let totalFields = 0;
    
    const allFields = new Set([...Object.keys(record1), ...Object.keys(record2)]);
    allFields.delete('_source_file');
    allFields.delete('_source_index');
    
    for (const field of allFields) {
      if (!record1[field] && !record2[field]) continue;
      
      totalFields++;
      const value1 = this.normalizeValue(record1[field]);
      const value2 = this.normalizeValue(record2[field]);
      
      const similarity = this.calculateStringSimilarity(value1, value2);
      if (similarity > 0.7) {
        fuzzyScore += similarity;
        matchingFields.push({
          field,
          sourceValue: record1[field],
          targetValue: record2[field],
          similarity,
          matchType: 'fuzzy'
        });
      }
    }
    
    const confidence = totalFields > 0 ? fuzzyScore / totalFields : 0;
    return { confidence, matchingFields };
  },

  async semanticMatch(record1: any, record2: any) {
    // Placeholder for semantic matching using AI/ML
    // In a real implementation, this would use embeddings or NLP
    const matchingFields: EnhancedDuplicateMatch['matchingFields'] = [];
    
    // Simple semantic rules for now
    const textFields = ['description', 'notes', 'comments', 'address'];
    let semanticScore = 0;
    let textFieldsCount = 0;
    
    for (const field of textFields) {
      if (record1[field] && record2[field]) {
        textFieldsCount++;
        const similarity = this.calculateSemanticSimilarity(record1[field], record2[field]);
        if (similarity > 0.6) {
          semanticScore += similarity;
          matchingFields.push({
            field,
            sourceValue: record1[field],
            targetValue: record2[field],
            similarity,
            matchType: 'semantic'
          });
        }
      }
    }
    
    const confidence = textFieldsCount > 0 ? semanticScore / textFieldsCount : 0;
    return { confidence, matchingFields };
  },

  phoneticMatch(record1: any, record2: any) {
    const matchingFields: EnhancedDuplicateMatch['matchingFields'] = [];
    const nameFields = ['name', 'first_name', 'last_name', 'company_name'];
    let phoneticScore = 0;
    let nameFieldsCount = 0;
    
    for (const field of nameFields) {
      if (record1[field] && record2[field]) {
        nameFieldsCount++;
        const similarity = this.calculatePhoneticSimilarity(record1[field], record2[field]);
        if (similarity > 0.8) {
          phoneticScore += similarity;
          matchingFields.push({
            field,
            sourceValue: record1[field],
            targetValue: record2[field],
            similarity,
            matchType: 'phonetic'
          });
        }
      }
    }
    
    const confidence = nameFieldsCount > 0 ? phoneticScore / nameFieldsCount : 0;
    return { confidence, matchingFields };
  },

  calculateSemanticSimilarity(text1: string, text2: string): number {
    // Simple keyword-based semantic similarity
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  },

  calculatePhoneticSimilarity(name1: string, name2: string): number {
    // Simple phonetic similarity using soundex-like approach
    const soundex1 = this.simpleSoundex(name1);
    const soundex2 = this.simpleSoundex(name2);
    
    return soundex1 === soundex2 ? 1.0 : 0.0;
  },

  simpleSoundex(str: string): string {
    // Very basic soundex implementation
    return str.toLowerCase()
      .replace(/[aeiouyhw]/g, '')
      .replace(/(.)\1+/g, '$1')
      .substring(0, 4)
      .padEnd(4, '0');
  },

  selectBestMatch(matches: EnhancedDuplicateMatch[]): EnhancedDuplicateMatch | null {
    if (matches.length === 0) return null;
    
    // Return the match with highest confidence
    return matches.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  },

  createDuplicateClusters(duplicates: EnhancedDuplicateMatch[], allRecords: any[]): DuplicateCluster[] {
    const clusters: DuplicateCluster[] = [];
    const processed = new Set<number>();
    
    for (const duplicate of duplicates) {
      if (processed.has(duplicate.sourceIndex) || processed.has(duplicate.targetIndex)) {
        continue;
      }
      
      const clusterRecords = [
        allRecords[duplicate.sourceIndex],
        allRecords[duplicate.targetIndex]
      ];
      
      // Find master record (highest quality)
      const masterRecord = clusterRecords.reduce((best, current) => 
        this.calculateRecordQuality(current) > this.calculateRecordQuality(best) ? current : best
      );
      
      clusters.push({
        id: `cluster-${clusters.length}`,
        records: clusterRecords,
        masterRecord,
        confidence: duplicate.confidence,
        clusterSize: clusterRecords.length,
        suggestedAction: duplicate.suggestedAction
      });
      
      processed.add(duplicate.sourceIndex);
      processed.add(duplicate.targetIndex);
    }
    
    return clusters;
  },

  calculateRecordQuality(record: any): number {
    let quality = 0;
    let fieldsCount = 0;
    
    for (const [key, value] of Object.entries(record)) {
      if (key.startsWith('_')) continue;
      
      fieldsCount++;
      if (value && value !== '' && value !== null && value !== undefined) {
        quality++;
      }
    }
    
    return fieldsCount > 0 ? quality / fieldsCount : 0;
  },

  prepareRecordsForComparison(files: Array<{ filename: string; data: any[] }>) {
    const allRecords = [];
    
    for (const file of files) {
      for (let i = 0; i < file.data.length; i++) {
        allRecords.push({
          ...file.data[i],
          _source_file: file.filename,
          _source_index: i
        });
      }
    }
    
    return allRecords;
  },

  normalizeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  },

  calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;
    
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1.0 : (maxLen - matrix[len2][len1]) / maxLen;
  },

  determineSuggestedAction(confidence: number, matchingFields: any[]): 'merge' | 'skip' | 'keep_both' | 'manual_review' {
    if (confidence > 0.95) return 'skip';
    if (confidence > 0.85) return 'merge';
    if (confidence > 0.7) return 'manual_review';
    return 'keep_both';
  },

  determineRiskLevel(confidence: number, matchingFields: any[]): 'low' | 'medium' | 'high' {
    if (confidence > 0.9) return 'low';
    if (confidence > 0.7) return 'medium';
    return 'high';
  },

  calculateQualityScore(record1: any, record2: any, matchingFields: any[]): number {
    const quality1 = this.calculateRecordQuality(record1);
    const quality2 = this.calculateRecordQuality(record2);
    const matchQuality = matchingFields.length > 0 ? 
      matchingFields.reduce((sum, field) => sum + field.similarity, 0) / matchingFields.length : 0;
    
    return (quality1 + quality2 + matchQuality) / 3;
  },

  buildDetectionResult(
    duplicates: EnhancedDuplicateMatch[],
    clusters: DuplicateCluster[],
    processingTime: number,
    comparisons: number,
    recordsProcessed: number,
    algorithms: string[]
  ): EnhancedDuplicateDetectionResult {
    const highConfidenceMatches = duplicates.filter(d => d.confidence > 0.9).length;
    const mediumConfidenceMatches = duplicates.filter(d => d.confidence > 0.7 && d.confidence <= 0.9).length;
    const lowConfidenceMatches = duplicates.filter(d => d.confidence <= 0.7).length;
    
    const suggestions = this.generateAdvancedSuggestions(duplicates, clusters);
    
    return {
      duplicates,
      clusters,
      totalDuplicates: duplicates.length,
      highConfidenceMatches,
      mediumConfidenceMatches,
      lowConfidenceMatches,
      suggestions,
      performanceMetrics: {
        processingTime,
        recordsProcessed,
        comparisons,
        algorithmsUsed: algorithms
      }
    };
  },

  generateAdvancedSuggestions(duplicates: EnhancedDuplicateMatch[], clusters: DuplicateCluster[]): string[] {
    const suggestions: string[] = [];
    
    if (duplicates.length === 0) {
      suggestions.push('No duplicates detected - data appears to be clean');
      return suggestions;
    }
    
    const autoSkipCount = duplicates.filter(d => d.suggestedAction === 'skip').length;
    const autoMergeCount = duplicates.filter(d => d.suggestedAction === 'merge').length;
    const manualReviewCount = duplicates.filter(d => d.suggestedAction === 'manual_review').length;
    
    if (autoSkipCount > 0) {
      suggestions.push(`${autoSkipCount} high-confidence duplicates can be automatically skipped`);
    }
    
    if (autoMergeCount > 0) {
      suggestions.push(`${autoMergeCount} duplicates can be automatically merged`);
    }
    
    if (manualReviewCount > 0) {
      suggestions.push(`${manualReviewCount} potential duplicates require manual review`);
    }
    
    if (clusters.length > 0) {
      suggestions.push(`${clusters.length} duplicate clusters identified for batch processing`);
    }
    
    return suggestions;
  }
};
