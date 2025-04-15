
import { useState, useEffect, useCallback } from 'react';
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { aiMappingService } from '@/services/import-export/ai-mapping-service';

export const useAIMappingSuggestions = (
  fileColumns: string[],
  systemFields: MappingOption[],
  sampleData: any[]
) => {
  const [suggestions, setSuggestions] = useState<Record<string, { fieldValue: string; confidence: number }>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate suggestions function
  const generateSuggestions = useCallback(() => {
    console.log("Generating suggestions with:", fileColumns.length, "columns and", systemFields.length, "system fields");
    
    if (fileColumns.length === 0 || systemFields.length === 0) {
      console.log("Missing required data for generating suggestions");
      return {};
    }
    
    setIsGenerating(true);
    try {
      // Use the AI mapping service to generate suggestions
      const results = aiMappingService.generateMappingSuggestions(
        fileColumns,
        systemFields,
        sampleData
      );
      
      console.log("Generated suggestions:", results);
      setSuggestions(results);
      return results;
    } catch (error) {
      console.error('Error generating mapping suggestions:', error);
      return {};
    } finally {
      setIsGenerating(false);
    }
  }, [fileColumns, systemFields, sampleData]);

  // Generate suggestions when component mounts or when data changes
  useEffect(() => {
    if (fileColumns.length > 0 && systemFields.length > 0 && sampleData.length > 0) {
      console.log("Auto-generating suggestions based on updated data");
      generateSuggestions();
    }
  }, [fileColumns, systemFields, sampleData, generateSuggestions]);

  return {
    suggestions,
    isGenerating,
    generateSuggestions
  };
};
