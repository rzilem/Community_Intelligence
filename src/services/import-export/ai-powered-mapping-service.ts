
import { supabase } from '@/integrations/supabase/client';
import { MappingOption } from '@/components/data-import/types/mapping-types';
import { devLog } from '@/utils/dev-logger';

export interface AIAnalysisResult {
  mappings: Record<string, {
    systemField: string;
    confidence: number;
    reasoning: string;
    dataQuality: 'good' | 'warning' | 'error';
    suggestions: string[];
  }>;
  overallAnalysis: {
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
  };
}

export interface AIMappingSuggestion {
  fieldValue: string;
  confidence: number;
  reasoning: string;
  dataQuality: 'good' | 'warning' | 'error';
  suggestions: string[];
}

export const aiPoweredMappingService = {
  async generateIntelligentMappings(
    fileColumns: string[],
    systemFields: MappingOption[],
    sampleData: any[],
    dataType: string,
    associationId?: string
  ): Promise<Record<string, AIMappingSuggestion>> {
    try {
      devLog.info('Starting AI-powered mapping analysis...', {
        fileColumns: fileColumns.length,
        systemFields: systemFields.length,
        sampleData: sampleData.length,
        dataType
      });

      // Call our AI analysis edge function
      const { data, error } = await supabase.functions.invoke('ai-data-analyzer', {
        body: {
          columns: fileColumns,
          sampleData: sampleData,
          dataType: dataType,
          associationId: associationId,
          systemFields: systemFields
        }
      });

      if (error) {
        devLog.error('AI analysis edge function error:', error);
        throw error;
      }

      if (!data?.success || !data?.analysis) {
        throw new Error('AI analysis failed: ' + (data?.error || 'Unknown error'));
      }

      const analysis: AIAnalysisResult = data.analysis;
      
      // Convert AI analysis to mapping suggestions format
      const suggestions: Record<string, AIMappingSuggestion> = {};
      
      Object.entries(analysis.mappings).forEach(([column, mapping]) => {
        suggestions[column] = {
          fieldValue: mapping.systemField,
          confidence: mapping.confidence,
          reasoning: mapping.reasoning,
          dataQuality: mapping.dataQuality,
          suggestions: mapping.suggestions
        };
      });

      devLog.info('AI mapping analysis completed:', {
        mappingsGenerated: Object.keys(suggestions).length,
        overallQuality: analysis.overallAnalysis.dataQuality,
        issues: analysis.overallAnalysis.issues.length
      });

      // Store analysis results for learning
      await this.storeAnalysisResults(associationId, dataType, analysis);

      return suggestions;

    } catch (error) {
      devLog.error('AI mapping generation failed:', error);
      
      // Fallback to pattern matching if AI fails
      devLog.info('Falling back to pattern matching...');
      return this.fallbackToPatternMatching(fileColumns, systemFields);
    }
  },

  async storeAnalysisResults(
    associationId: string | undefined,
    dataType: string,
    analysis: AIAnalysisResult
  ): Promise<void> {
    try {
      if (!associationId) return;

      // Store for future learning - this will help improve suggestions over time
      const { error } = await supabase
        .from('ai_learning_corrections')
        .insert({
          correction_type: 'mapping_analysis',
          original_suggestion: {
            dataType,
            analysis: analysis.overallAnalysis,
            mappingCount: Object.keys(analysis.mappings).length
          },
          corrected_value: analysis.mappings,
          confidence_before: this.calculateAverageConfidence(analysis.mappings),
          confidence_after: null // Will be updated when user makes corrections
        });

      if (error) {
        devLog.error('Failed to store AI analysis for learning:', error);
      }
    } catch (error) {
      devLog.error('Error storing analysis results:', error);
    }
  },

  calculateAverageConfidence(mappings: Record<string, any>): number {
    const confidences = Object.values(mappings).map((m: any) => m.confidence || 0);
    return confidences.length > 0 
      ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length 
      : 0;
  },

  // Fallback pattern matching (simplified version of existing logic)
  fallbackToPatternMatching(
    fileColumns: string[],
    systemFields: MappingOption[]
  ): Record<string, AIMappingSuggestion> {
    const suggestions: Record<string, AIMappingSuggestion> = {};
    
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
          confidence: 0.6, // Lower confidence for pattern matching
          reasoning: 'Fallback pattern matching (AI analysis unavailable)',
          dataQuality: 'warning' as const,
          suggestions: ['AI analysis recommended for better accuracy']
        };
      }
    });
    
    return suggestions;
  }
};
