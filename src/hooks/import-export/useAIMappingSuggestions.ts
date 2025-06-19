
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
  const [overallRecommendations, setOverallRecommendations] = useState<string[]>([]);

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
      const qualityInfo = extractQualityInfo(newSuggestions);
      setAnalysisQuality(qualityInfo.quality);
      setAnalysisIssues(qualityInfo.issues);
      setOverallRecommendations(qualityInfo.recommendations);

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
    const allSuggestions = Object.values(suggestions).flatMap(s => s.suggestions);
    
    const hasErrors = qualities.includes('error');
    const hasWarnings = qualities.includes('warning');
    
    let overallQuality = 'excellent';
    if (hasErrors) overallQuality = 'poor';
    else if (hasWarnings) overallQuality = 'good';
    
    // Extract unique recommendations
    const recommendations = [...new Set(allSuggestions)];
    
    return { 
      quality: overallQuality, 
      issues: allSuggestions.filter(s => s.includes('issue') || s.includes('problem')),
      recommendations 
    };
  };

  const applyBulkSuggestions = useCallback((onMappingChange: (column: string, field: string) => void) => {
    const usedFields = new Set<string>();
    let appliedCount = 0;
    
    // Sort suggestions by confidence (highest first)
    const sortedSuggestions = Object.entries(suggestions).sort((a, b) => 
      b[1].confidence - a[1].confidence
    );
    
    sortedSuggestions.forEach(([column, suggestion]) => {
      if (suggestion.confidence >= 0.7 && !usedFields.has(suggestion.fieldValue)) {
        onMappingChange(column, suggestion.fieldValue);
        usedFields.add(suggestion.fieldValue);
        appliedCount++;
      }
    });
    
    if (appliedCount > 0) {
      toast.success(`Applied ${appliedCount} AI suggestions with high confidence`);
    } else {
      toast.info('No high-confidence suggestions available for bulk application');
    }
    
    return appliedCount;
  }, [suggestions]);

  return {
    suggestions,
    isGenerating,
    analysisQuality,
    analysisIssues,
    overallRecommendations,
    generateSuggestions,
    applyBulkSuggestions
  };
}
