
import { useState, useCallback } from 'react';
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { aiMappingService } from '@/services/import-export/ai-mapping-service';

interface MappingSuggestion {
  fieldValue: string;
  confidence: number;
}

export function useAIMappingSuggestions(
  fileColumns: string[],
  systemFields: MappingOption[],
  sampleData: any[]
) {
  const [suggestions, setSuggestions] = useState<Record<string, MappingSuggestion>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = useCallback((): Record<string, MappingSuggestion> => {
    if (!fileColumns.length || !systemFields.length) {
      console.log('Cannot generate suggestions: missing data');
      return {};
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating AI mapping suggestions for:', fileColumns);
      const newSuggestions = aiMappingService.generateMappingSuggestions(
        fileColumns,
        systemFields,
        sampleData
      );
      
      console.log('Generated suggestions:', newSuggestions);
      setSuggestions(newSuggestions);
      return newSuggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return {};
    } finally {
      setIsGenerating(false);
    }
  }, [fileColumns, systemFields, sampleData]);

  return {
    suggestions,
    isGenerating,
    generateSuggestions
  };
}
