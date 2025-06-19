
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
    devLog.info('Generating AI mapping suggestions with OpenAI...');
    
    try {
      // Use the enhanced AI-powered mapping service
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
      
      devLog.info('Generated AI mapping suggestions:', suggestions);
      return suggestions;
    } catch (error) {
      devLog.error('AI mapping failed, using fallback:', error);
      
      // Fallback to pattern matching if AI fails
      return generatePatternMappings(fileColumns, systemFields);
    }
  }
};

// Fallback pattern matching function
function generatePatternMappings(
  fileColumns: string[],
  systemFields: MappingOption[]
): Record<string, MappingSuggestion> {
  const suggestions: Record<string, MappingSuggestion> = {};
  
  fileColumns.forEach(column => {
    const normalizedColumn = column.toLowerCase().trim();
    
    // Simple pattern matching as fallback
    const matchedField = systemFields.find(field => 
      field.value.toLowerCase().includes(normalizedColumn) ||
      normalizedColumn.includes(field.value.toLowerCase()) ||
      field.label.toLowerCase().includes(normalizedColumn)
    );
    
    if (matchedField) {
      suggestions[column] = {
        fieldValue: matchedField.value,
        confidence: 0.6 // Lower confidence for pattern matching
      };
    }
  });
  
  return suggestions;
}
