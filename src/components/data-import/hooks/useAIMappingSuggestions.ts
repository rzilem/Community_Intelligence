
import { useState } from 'react';
import { MappingOption } from '../types/mapping-types';
import { aiMappingService } from '@/services/import-export/ai-mapping-service';

export const useAIMappingSuggestions = (
  fileColumns: string[],
  systemFields: MappingOption[],
  sampleData: any[]
) => {
  const [suggestions, setSuggestions] = useState<Record<string, { fieldValue: string; confidence: number }>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = () => {
    setIsGenerating(true);
    try {
      // Use the AI mapping service to generate suggestions
      const results = aiMappingService.generateMappingSuggestions(
        fileColumns,
        systemFields,
        sampleData
      );
      
      setSuggestions(results);
      return results;
    } catch (error) {
      console.error('Error generating mapping suggestions:', error);
      return {};
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    suggestions,
    isGenerating,
    generateSuggestions
  };
};
