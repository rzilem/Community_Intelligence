
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { smartMappingService } from './smart-mapping-service';
import { devLog } from '@/utils/dev-logger';

interface MappingSuggestion {
  fieldValue: string;
  confidence: number;
}

export const aiMappingService = {
  generateMappingSuggestions: (
    fileColumns: string[],
    systemFields: MappingOption[],
    sampleData: any[]
  ): Record<string, MappingSuggestion> => {
    devLog.info('Generating AI mapping suggestions with smart mapping...');
    
    // Use the smart mapping service for better suggestions
    const smartSuggestions = smartMappingService.generateSmartMappings(
      fileColumns,
      systemFields,
      sampleData
    );
    
    // Convert to the expected format
    const suggestions: Record<string, MappingSuggestion> = {};
    
    Object.entries(smartSuggestions).forEach(([column, suggestion]) => {
      suggestions[column] = {
        fieldValue: suggestion.fieldValue,
        confidence: suggestion.confidence
      };
    });
    
    devLog.info('Generated smart mapping suggestions:', suggestions);
    return suggestions;
  }
};
