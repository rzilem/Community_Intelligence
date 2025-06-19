import { devLog } from '@/utils/dev-logger';

export interface DuplicateMatch {
  sourceIndex: number;
  targetIndex: number;
  sourceFile: string;
  targetFile: string;
  confidence: number;
  matchingFields: string[];
  suggestedAction: 'merge' | 'skip' | 'keep_both';
  reasoning: string;
}

export interface DuplicateDetectionResult {
  duplicates: DuplicateMatch[];
  totalDuplicates: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  suggestions: string[];
  processingTime: number;
}

export interface CrossFileAnalysis {
  fileComparisons: Array<{
    file1: string;
    file2: string;
    duplicateCount: number;
    confidence: number;
  }>;
  overallSimilarity: number;
  recommendations: string[];
}

export const enhancedDuplicateDetectionService = {
  async detectDuplicatesAcrossFiles(
    files: Array<{ filename: string; data: any[] }>,
    options: {
      strictMode?: boolean;
      fuzzyMatching?: boolean;
      keyFields?: string[];
      confidenceThreshold?: number;
    } = {}
  ): Promise<DuplicateDetectionResult> {
    const startTime = Date.now();
    devLog.info('Starting enhanced duplicate detection across files...');
    
    const duplicates: DuplicateMatch[] = [];
    const allRecords = this.prepareRecordsForComparison(files);
    const keyFields = options.keyFields || ['email', 'name', 'address', 'phone', 'id'];
    const confidenceThreshold = options.confidenceThreshold || 0.7;
    
    // Enhanced comparison with machine learning-like scoring
    for (let i = 0; i < allRecords.length; i++) {
      for (let j = i + 1; j < allRecords.length; j++) {
        const match = this.compareRecordsAdvanced(
          allRecords[i], 
          allRecords[j],
          keyFields,
          options
        );
        
        if (match && match.confidence >= confidenceThreshold) {
          duplicates.push(match);
        }
      }
    }
    
    const processingTime = Date.now() - startTime;
    const highConfidenceMatches = duplicates.filter(d => d.confidence > 0.9).length;
    const mediumConfidenceMatches = duplicates.filter(d => d.confidence > 0.75 && d.confidence <= 0.9).length;
    const lowConfidenceMatches = duplicates.filter(d => d.confidence >= 0.7 && d.confidence <= 0.75).length;
    
    const suggestions = this.generateAdvancedSuggestions(duplicates, files);
    
    devLog.info('Enhanced duplicate detection complete:', {
      totalDuplicates: duplicates.length,
      highConfidenceMatches,
      mediumConfidenceMatches,
      lowConfidenceMatches,
      processingTime
    });
    
    return {
      duplicates,
      totalDuplicates: duplicates.length,
      highConfidenceMatches,
      mediumConfidenceMatches,
      lowConfidenceMatches,
      suggestions,
      processingTime
    };
  },

  prepareRecordsForComparison(files: Array<{ filename: string; data: any[] }>) {
    const allRecords = [];
    
    for (const file of files) {
      for (let i = 0; i < file.data.length; i++) {
        allRecords.push({
          ...file.data[i],
          _source_file: file.filename,
          _source_index: i,
          _normalized_data: this.normalizeRecord(file.data[i])
        });
      }
    }
    
    return allRecords;
  },

  normalizeRecord(record: any): any {
    const normalized: any = {};
    
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        normalized[key] = value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ');
      } else {
        normalized[key] = value;
      }
    }
    
    return normalized;
  },

  compareRecordsAdvanced(
    record1: any, 
    record2: any, 
    keyFields: string[],
    options: any
  ): DuplicateMatch | null {
    if (record1._source_file === record2._source_file) {
      return null;
    }
    
    let matchingFields: string[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    const allFields = new Set([
      ...Object.keys(record1),
      ...Object.keys(record2)
    ]);
    
    // Remove internal fields
    allFields.delete('_source_file');
    allFields.delete('_source_index');
    allFields.delete('_normalized_data');
    
    for (const field of allFields) {
      if (!record1[field] && !record2[field]) continue;
      
      const isKeyField = keyFields.includes(field);
      const fieldWeight = isKeyField ? 3 : 1;
      maxPossibleScore += fieldWeight;
      
      const value1 = record1._normalized_data?.[field] || this.normalizeValue(record1[field]);
      const value2 = record2._normalized_data?.[field] || this.normalizeValue(record2[field]);
      
      if (value1 === value2) {
        totalScore += fieldWeight;
        matchingFields.push(field);
      } else if (options.fuzzyMatching) {
        const similarity = this.calculateAdvancedSimilarity(value1, value2, field);
        if (similarity > 0.8) {
          totalScore += fieldWeight * similarity;
          matchingFields.push(`${field} (fuzzy: ${Math.round(similarity * 100)}%)`);
        }
      }
    }
    
    if (matchingFields.length === 0) {
      return null;
    }
    
    const confidence = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
    
    // Enhanced key field matching bonus
    const keyFieldMatches = this.checkKeyFieldMatches(record1, record2, keyFields);
    const adjustedConfidence = Math.min(confidence + keyFieldMatches * 0.15, 1.0);
    
    if (adjustedConfidence < 0.7) {
      return null;
    }
    
    return {
      sourceIndex: record1._source_index,
      targetIndex: record2._source_index,
      sourceFile: record1._source_file,
      targetFile: record2._source_file,
      confidence: adjustedConfidence,
      matchingFields,
      suggestedAction: this.determineSuggestedAction(adjustedConfidence, matchingFields),
      reasoning: this.generateReasoning(adjustedConfidence, matchingFields, keyFields)
    };
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

  calculateAdvancedSimilarity(str1: string, str2: string, field: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;
    
    // Use different algorithms based on field type
    if (field.toLowerCase().includes('email')) {
      return this.calculateEmailSimilarity(str1, str2);
    } else if (field.toLowerCase().includes('phone')) {
      return this.calculatePhoneSimilarity(str1, str2);
    } else {
      return this.calculateLevenshteinSimilarity(str1, str2);
    }
  },

  calculateEmailSimilarity(email1: string, email2: string): number {
    const [user1, domain1] = email1.split('@');
    const [user2, domain2] = email2.split('@');
    
    if (domain1 !== domain2) return 0.0;
    
    return this.calculateLevenshteinSimilarity(user1, user2);
  },

  calculatePhoneSimilarity(phone1: string, phone2: string): number {
    const clean1 = phone1.replace(/\D/g, '');
    const clean2 = phone2.replace(/\D/g, '');
    
    if (clean1 === clean2) return 1.0;
    
    // Check if one is a subset of the other (e.g., with/without country code)
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      return 0.9;
    }
    
    return this.calculateLevenshteinSimilarity(clean1, clean2);
  },

  calculateLevenshteinSimilarity(str1: string, str2: string): number {
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

  checkKeyFieldMatches(record1: any, record2: any, keyFields: string[]): number {
    let keyMatches = 0;
    let totalKeyFields = 0;
    
    for (const field of keyFields) {
      if (record1[field] || record2[field]) {
        totalKeyFields++;
        if (this.normalizeValue(record1[field]) === this.normalizeValue(record2[field])) {
          keyMatches++;
        }
      }
    }
    
    return totalKeyFields > 0 ? keyMatches / totalKeyFields : 0;
  },

  determineSuggestedAction(confidence: number, matchingFields: string[]): 'merge' | 'skip' | 'keep_both' {
    if (confidence > 0.95) {
      return 'skip';
    } else if (confidence > 0.85) {
      return 'merge';
    } else {
      return 'keep_both';
    }
  },

  generateReasoning(confidence: number, matchingFields: string[], keyFields: string[]): string {
    const keyFieldMatches = matchingFields.filter(field => 
      keyFields.some(key => field.toLowerCase().includes(key.toLowerCase()))
    );
    
    if (keyFieldMatches.length > 0) {
      return `High confidence match based on key fields: ${keyFieldMatches.join(', ')}`;
    } else {
      return `Potential duplicate with ${Math.round(confidence * 100)}% confidence based on: ${matchingFields.slice(0, 3).join(', ')}`;
    }
  },

  generateAdvancedSuggestions(duplicates: DuplicateMatch[], files: Array<{ filename: string; data: any[] }>): string[] {
    const suggestions: string[] = [];
    
    const highConfidence = duplicates.filter(d => d.confidence > 0.9).length;
    const mediumConfidence = duplicates.filter(d => d.confidence > 0.75 && d.confidence <= 0.9).length;
    const lowConfidence = duplicates.filter(d => d.confidence >= 0.7 && d.confidence <= 0.75).length;
    
    if (highConfidence > 0) {
      suggestions.push(`${highConfidence} high-confidence duplicates can be automatically merged or skipped`);
    }
    
    if (mediumConfidence > 0) {
      suggestions.push(`${mediumConfidence} medium-confidence matches need manual review`);
    }
    
    if (lowConfidence > 0) {
      suggestions.push(`${lowConfidence} low-confidence matches should be carefully reviewed`);
    }
    
    // File-specific analysis
    const fileAnalysis = this.analyzeFileOverlap(duplicates);
    for (const [fileCombo, count] of Object.entries(fileAnalysis)) {
      if (count > 10) {
        suggestions.push(`High overlap detected between ${fileCombo} (${count} potential duplicates)`);
      }
    }
    
    // Performance suggestions
    if (duplicates.length > 100) {
      suggestions.push('Consider processing files in smaller batches for better performance');
    }
    
    return suggestions;
  },

  analyzeFileOverlap(duplicates: DuplicateMatch[]): Record<string, number> {
    const fileGroups: Record<string, number> = {};
    
    for (const duplicate of duplicates) {
      const key = [duplicate.sourceFile, duplicate.targetFile].sort().join(' <-> ');
      fileGroups[key] = (fileGroups[key] || 0) + 1;
    }
    
    return fileGroups;
  },

  async analyzeCrossFilePatterns(files: Array<{ filename: string; data: any[] }>): Promise<CrossFileAnalysis> {
    const comparisons = [];
    
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const result = await this.detectDuplicatesAcrossFiles([files[i], files[j]]);
        comparisons.push({
          file1: files[i].filename,
          file2: files[j].filename,
          duplicateCount: result.totalDuplicates,
          confidence: result.totalDuplicates > 0 ? 
            result.duplicates.reduce((sum, d) => sum + d.confidence, 0) / result.duplicates.length : 0
        });
      }
    }
    
    const overallSimilarity = comparisons.length > 0 ?
      comparisons.reduce((sum, c) => sum + c.confidence, 0) / comparisons.length : 0;
    
    const recommendations = this.generateCrossFileRecommendations(comparisons);
    
    return {
      fileComparisons: comparisons,
      overallSimilarity,
      recommendations
    };
  },

  generateCrossFileRecommendations(comparisons: any[]): string[] {
    const recommendations = [];
    
    const highOverlap = comparisons.filter(c => c.duplicateCount > 20);
    if (highOverlap.length > 0) {
      recommendations.push('Consider consolidating files with high duplicate overlap');
    }
    
    const lowQuality = comparisons.filter(c => c.confidence < 0.5 && c.duplicateCount > 0);
    if (lowQuality.length > 0) {
      recommendations.push('Review data quality - some matches have low confidence scores');
    }
    
    return recommendations;
  }
};
