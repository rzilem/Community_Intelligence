
import { useState, useCallback } from 'react';
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { aiPoweredMappingService, AIMappingSuggestion } from '@/services/import-export/ai-powered-mapping-service';
import { toast } from 'sonner';

export function useAIMappingSuggestions(
  fileColumns: string[],
  systemFields: MappingOption[],
  sampleData: any[],
  dataType?: string,
  associationId?: string
) {
  const [suggestions, setSuggestions] = useState<Record<string, AIMappingSuggestion>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisQuality, setAnalysisQuality] = useState<string>('');
  const [analysisIssues, setAnalysisIssues] = useState<string[]>([]);

  const generateSuggestions = useCallback(async (): Promise<Record<string, AIMappingSuggestion>> => {
    if (!fileColumns.length || !systemFields.length) {
      console.log('Cannot generate suggestions: missing data');
      return {};
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating AI-powered mapping suggestions...', {
        fileColumns: fileColumns.length,
        systemFields: systemFields.length,
        dataType,
        associationId
      });

      toast.info('Analyzing your data with AI...', {
        description: 'This may take a moment while we intelligently map your columns'
      });

      const newSuggestions = await aiPoweredMappingService.generateIntelligentMappings(
        fileColumns,
        systemFields,
        sampleData,
        dataType || 'unknown',
        associationId
      );
      
      console.log('Generated AI suggestions:', newSuggestions);
      setSuggestions(newSuggestions);

      // Extract analysis quality information
      const qualityInfo = this.extractQualityInfo(newSuggestions);
      setAnalysisQuality(qualityInfo.quality);
      setAnalysisIssues(qualityInfo.issues);

      const mappedCount = Object.keys(newSuggestions).length;
      if (mappedCount > 0) {
        toast.success(`AI analysis complete!`, {
          description: `Intelligently mapped ${mappedCount} columns with reasoning`
        });
      } else {
        toast.warning('No automatic mappings found', {
          description: 'Please map columns manually or check your data format'
        });
      }

      return newSuggestions;
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast.error('AI analysis failed', {
        description: 'Falling back to basic pattern matching'
      });
      return {};
    } finally {
      setIsGenerating(false);
    }
  }, [fileColumns, systemFields, sampleData, dataType, associationId]);

  const extractQualityInfo = (suggestions: Record<string, AIMappingSuggestion>) => {
    const qualities = Object.values(suggestions).map(s => s.dataQuality);
    const issues = Object.values(suggestions).flatMap(s => s.suggestions);
    
    const hasErrors = qualities.includes('error');
    const hasWarnings = qualities.includes('warning');
    
    let overallQuality = 'excellent';
    if (hasErrors) overallQuality = 'poor';
    else if (hasWarnings) overallQuality = 'good';
    
    return { quality: overallQuality, issues };
  };

  return {
    suggestions,
    isGenerating,
    analysisQuality,
    analysisIssues,
    generateSuggestions
  };
}
