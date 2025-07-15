
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { aiPoweredMappingService } from './ai-powered-mapping-service';
import { devLog } from '@/utils/dev-logger';

interface MappingSuggestion {
  fieldValue: string;
  confidence: number;
}

export const aiMappingService = {
  generateMappingSuggestions: async (
    fileColumns: string[],
    systemFields: MappingOption[],
    sampleData: any[],
    dataType?: string,
    associationId?: string
  ): Promise<Record<string, MappingSuggestion>> => {
    devLog.info('Generating AI mapping suggestions with enhanced analysis...', {
      fileColumns: fileColumns.length,
      systemFields: systemFields.length,
      sampleData: sampleData.length,
      dataType,
      associationId
    });
    
    try {
      // Use the enhanced AI-powered mapping service with retry logic
      const aiSuggestions = await aiPoweredMappingService.generateIntelligentMappings(
        fileColumns,
        systemFields,
        sampleData,
        dataType || 'unknown',
        associationId
      );
      
      // Convert to the expected format for backward compatibility
      const suggestions: Record<string, MappingSuggestion> = {};
      
      Object.entries(aiSuggestions).forEach(([column, suggestion]) => {
        suggestions[column] = {
          fieldValue: suggestion.fieldValue,
          confidence: suggestion.confidence
        };
      });
      
      devLog.info('Generated AI mapping suggestions:', {
        totalSuggestions: Object.keys(suggestions).length,
        highConfidenceSuggestions: Object.values(suggestions).filter(s => s.confidence > 0.8).length,
        mediumConfidenceSuggestions: Object.values(suggestions).filter(s => s.confidence > 0.5 && s.confidence <= 0.8).length,
        lowConfidenceSuggestions: Object.values(suggestions).filter(s => s.confidence <= 0.5).length
      });
      
      return suggestions;
    } catch (error) {
      devLog.error('AI mapping failed, using enhanced fallback:', error);
      
      // Enhanced fallback to pattern matching if AI fails
      return generateEnhancedPatternMappings(fileColumns, systemFields);
    }
  }
};

// Enhanced fallback pattern matching function
function generateEnhancedPatternMappings(
  fileColumns: string[],
  systemFields: MappingOption[]
): Record<string, MappingSuggestion> {
  devLog.info('Using enhanced pattern matching fallback...', {
    fileColumns: fileColumns.length,
    systemFields: systemFields.length
  });
  
  const suggestions: Record<string, MappingSuggestion> = {};
  
  fileColumns.forEach(column => {
    const normalizedColumn = column.toLowerCase().trim().replace(/[_\s]+/g, '_');
    let bestMatch = null;
    let bestScore = 0;
    
    systemFields.forEach(field => {
      const fieldValue = field.value.toLowerCase();
      const fieldLabel = field.label.toLowerCase();
      let score = 0;
      
      // Multi-level matching with scoring
      // Exact match (highest priority)
      if (fieldValue === normalizedColumn || fieldLabel === normalizedColumn) {
        score = 1.0;
      }
      // Contains match
      else if (fieldValue.includes(normalizedColumn) || normalizedColumn.includes(fieldValue)) {
        score = 0.8;
      }
      // Label match
      else if (fieldLabel.includes(normalizedColumn) || normalizedColumn.includes(fieldLabel)) {
        score = 0.7;
      }
      // Word similarity
      else {
        const columnWords = normalizedColumn.split('_');
        const fieldWords = fieldValue.split('_');
        const commonWords = columnWords.filter(word => fieldWords.includes(word));
        if (commonWords.length > 0) {
          score = 0.6 * (commonWords.length / Math.max(columnWords.length, fieldWords.length));
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = field;
      }
    });
    
    if (bestMatch && bestScore > 0.5) {
      suggestions[column] = {
        fieldValue: bestMatch.value,
        confidence: bestScore
      };
    }
  });
  
  devLog.info('Enhanced pattern matching completed:', {
    totalMappings: Object.keys(suggestions).length,
    highConfidence: Object.values(suggestions).filter(s => s.confidence > 0.8).length,
    mediumConfidence: Object.values(suggestions).filter(s => s.confidence > 0.5 && s.confidence <= 0.8).length
  });
  
  return suggestions;
}
