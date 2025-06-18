
import { devLog } from '@/utils/dev-logger';

export interface DuplicateMatch {
  sourceIndex: number;
  targetIndex: number;
  sourceFile: string;
  targetFile: string;
  confidence: number;
  matchingFields: string[];
  suggestedAction: 'merge' | 'skip' | 'keep_both';
}

export interface DuplicateDetectionResult {
  duplicates: DuplicateMatch[];
  totalDuplicates: number;
  highConfidenceMatches: number;
  suggestions: string[];
}

export const duplicateDetectionService = {
  detectDuplicatesAcrossFiles(files: Array<{ filename: string; data: any[] }>): DuplicateDetectionResult {
    devLog.info('Starting cross-file duplicate detection...');
    
    const duplicates: DuplicateMatch[] = [];
    const allRecords = this.prepareRecordsForComparison(files);
    
    // Compare each record against all other records
    for (let i = 0; i < allRecords.length; i++) {
      for (let j = i + 1; j < allRecords.length; j++) {
        const match = this.compareRecords(
          allRecords[i], 
          allRecords[j],
          i,
          j
        );
        
        if (match && match.confidence > 0.7) {
          duplicates.push(match);
        }
      }
    }
    
    const highConfidenceMatches = duplicates.filter(d => d.confidence > 0.9).length;
    const suggestions = this.generateDuplicateSuggestions(duplicates);
    
    devLog.info('Duplicate detection complete:', {
      totalDuplicates: duplicates.length,
      highConfidenceMatches,
      suggestions: suggestions.length
    });
    
    return {
      duplicates,
      totalDuplicates: duplicates.length,
      highConfidenceMatches,
      suggestions
    };
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

  compareRecords(record1: any, record2: any, index1: number, index2: number): DuplicateMatch | null {
    // Skip if from same file
    if (record1._source_file === record2._source_file) {
      return null;
    }
    
    const matchingFields: string[] = [];
    let totalFields = 0;
    let exactMatches = 0;
    let fuzzyMatches = 0;
    
    // Get all fields from both records
    const allFields = new Set([
      ...Object.keys(record1),
      ...Object.keys(record2)
    ]);
    
    // Remove metadata fields
    allFields.delete('_source_file');
    allFields.delete('_source_index');
    
    for (const field of allFields) {
      if (!record1[field] && !record2[field]) continue;
      
      totalFields++;
      
      const value1 = this.normalizeValue(record1[field]);
      const value2 = this.normalizeValue(record2[field]);
      
      if (value1 === value2) {
        exactMatches++;
        matchingFields.push(field);
      } else {
        const similarity = this.calculateStringSimilarity(value1, value2);
        if (similarity > 0.8) {
          fuzzyMatches++;
          matchingFields.push(`${field} (fuzzy)`);
        }
      }
    }
    
    if (exactMatches === 0 && fuzzyMatches === 0) {
      return null;
    }
    
    const confidence = (exactMatches + fuzzyMatches * 0.7) / Math.max(totalFields, 1);
    
    // Special handling for key fields
    const keyFieldMatches = this.checkKeyFieldMatches(record1, record2);
    const adjustedConfidence = Math.min(confidence + keyFieldMatches * 0.2, 1.0);
    
    if (adjustedConfidence < 0.5) {
      return null;
    }
    
    return {
      sourceIndex: record1._source_index,
      targetIndex: record2._source_index,
      sourceFile: record1._source_file,
      targetFile: record2._source_file,
      confidence: adjustedConfidence,
      matchingFields,
      suggestedAction: this.determineSuggestedAction(adjustedConfidence, matchingFields)
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

  calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;
    
    // Simple Levenshtein distance implementation
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

  checkKeyFieldMatches(record1: any, record2: any): number {
    const keyFields = [
      'address', 'unit_number', 'property_address',
      'email', 'phone', 'name', 'first_name', 'last_name',
      'account_number', 'invoice_number', 'id'
    ];
    
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
      return 'skip'; // Very high confidence duplicate - skip the duplicate
    } else if (confidence > 0.85) {
      return 'merge'; // High confidence - merge the records
    } else {
      return 'keep_both'; // Medium confidence - keep both for manual review
    }
  },

  generateDuplicateSuggestions(duplicates: DuplicateMatch[]): string[] {
    const suggestions: string[] = [];
    
    const highConfidence = duplicates.filter(d => d.confidence > 0.9).length;
    const mediumConfidence = duplicates.filter(d => d.confidence > 0.7 && d.confidence <= 0.9).length;
    
    if (highConfidence > 0) {
      suggestions.push(`${highConfidence} high-confidence duplicates can be automatically skipped`);
    }
    
    if (mediumConfidence > 0) {
      suggestions.push(`${mediumConfidence} potential duplicates need manual review`);
    }
    
    const fileGroups = this.groupDuplicatesByFile(duplicates);
    for (const [files, count] of Object.entries(fileGroups)) {
      if (count > 5) {
        suggestions.push(`High overlap detected between ${files} (${count} matches)`);
      }
    }
    
    return suggestions;
  },

  groupDuplicatesByFile(duplicates: DuplicateMatch[]): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const duplicate of duplicates) {
      const key = [duplicate.sourceFile, duplicate.targetFile].sort().join(' <-> ');
      groups[key] = (groups[key] || 0) + 1;
    }
    
    return groups;
  }
};
