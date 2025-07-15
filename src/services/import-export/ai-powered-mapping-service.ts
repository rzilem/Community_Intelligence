
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
    table?: string;
  }>;
  overallAnalysis: {
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
  };
  tableAssignments?: Record<string, string[]>;
  validation?: {
    validMappings: Record<string, { targetField: string; table: string }>;
    invalidMappings: Record<string, { targetField: string; reason: string; assignedTable?: string }>;
    suggestions: Array<{ sourceField: string; invalidField: string; suggestedField: string; table: string }>;
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

      // Call our AI import processor edge function
      const { data, error } = await supabase.functions.invoke('ai-import-processor', {
        body: {
          fileContent: sampleData,
          fileName: 'sample_data.json',
          fileType: 'application/json',
          associationId: associationId,
          userDescription: `Data type: ${dataType}`
        }
      });

      if (error) {
        devLog.error('AI analysis edge function error:', error);
        throw error;
      }

      if (!data?.success || !data?.analysisResult) {
        const errorMessage = data?.error || 'Unknown error';
        devLog.error('AI analysis failed:', { error: errorMessage, data });
        throw new Error(`AI analysis failed: ${errorMessage}`);
      }

      const analysisResult = data.analysisResult;
      
      // Validate the analysis result structure
      if (!analysisResult.targetTables || !Array.isArray(analysisResult.targetTables)) {
        throw new Error('Invalid analysis result: missing or invalid targetTables');
      }
      
      if (!analysisResult.fieldMappings || typeof analysisResult.fieldMappings !== 'object') {
        throw new Error('Invalid analysis result: missing or invalid fieldMappings');
      }
      
      // Convert the AI processor result to our expected format
      const analysis: AIAnalysisResult = {
        mappings: {},
        overallAnalysis: {
          dataQuality: analysisResult.confidence > 90 ? 'excellent' : 
                      analysisResult.confidence > 70 ? 'good' : 
                      analysisResult.confidence > 50 ? 'fair' : 'poor',
          issues: analysisResult.dataQuality?.issues || [],
          recommendations: analysisResult.dataQuality?.suggestions || []
        },
        tableAssignments: analysisResult.tableAssignments,
        validation: analysisResult.validation
      };
      
      // Convert field mappings to our format
      Object.entries(analysisResult.fieldMappings || {}).forEach(([sourceField, targetField]) => {
        const assignedTable = analysisResult.validation?.validMappings?.[sourceField]?.table;
        analysis.mappings[sourceField] = {
          systemField: targetField as string,
          confidence: analysisResult.confidence / 100,
          reasoning: assignedTable ? `Mapped to ${assignedTable}.${targetField}` : `Mapped to ${targetField}`,
          dataQuality: analysisResult.confidence > 80 ? 'good' : 
                      analysisResult.confidence > 60 ? 'warning' : 'error',
          suggestions: [],
          table: assignedTable
        };
      });
      
      // Convert AI analysis to mapping suggestions format with table assignments
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
            mappingCount: Object.keys(analysis.mappings).length,
            validation: analysis.validation
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
