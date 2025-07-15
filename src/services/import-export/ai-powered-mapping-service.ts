
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

      // Prepare enhanced data for AI analysis
      const enhancedSampleData = this.enhanceDataForAI(sampleData, fileColumns, dataType);
      
      // Call our AI import processor edge function with retry logic
      let result;
      let lastError;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          devLog.info(`AI analysis attempt ${attempt}/3...`);
          
          const { data, error } = await supabase.functions.invoke('ai-import-processor', {
            body: {
              fileContent: enhancedSampleData,
              fileName: `${dataType}_data_sample.json`,
              fileType: 'application/json',
              associationId: associationId,
              userDescription: `Data type: ${dataType}. Attempt ${attempt}/3.`
            }
          });

          if (error) {
            lastError = error;
            devLog.warn(`AI analysis attempt ${attempt} failed:`, error);
            continue;
          }

          if (!data?.success) {
            lastError = new Error(data?.error || 'Unknown error');
            devLog.warn(`AI analysis attempt ${attempt} unsuccessful:`, data);
            continue;
          }

          result = data;
          break;
        } catch (error) {
          lastError = error;
          devLog.warn(`AI analysis attempt ${attempt} threw error:`, error);
          continue;
        }
      }

      if (!result) {
        devLog.error('All AI analysis attempts failed:', lastError);
        throw lastError || new Error('AI analysis failed after 3 attempts');
      }

      const analysisResult = result.analysisResult;
      
      // Enhanced validation with specific error messages
      const validationErrors = this.validateAnalysisResult(analysisResult);
      if (validationErrors.length > 0) {
        devLog.error('Analysis result validation failed:', validationErrors);
        // Don't throw immediately - let the system use fallback patterns
        analysisResult.dataQuality = analysisResult.dataQuality || { issues: [], warnings: [], suggestions: [] };
        analysisResult.dataQuality.issues.push(...validationErrors);
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
  enhanceDataForAI(sampleData: any[], fileColumns: string[], dataType: string): any[] {
    // Enhance sample data with metadata for better AI analysis
    const enhancedData = sampleData.slice(0, 5).map(row => {
      const enhancedRow = { ...row };
      
      // Add metadata hints based on data type
      if (dataType === 'properties') {
        enhancedRow['__metadata'] = 'This is property data including addresses, units, and financial info';
      } else if (dataType === 'residents') {
        enhancedRow['__metadata'] = 'This is resident data including contact info and property assignments';
      } else if (dataType === 'financial') {
        enhancedRow['__metadata'] = 'This is financial data including assessments, payments, and balances';
      }
      
      return enhancedRow;
    });
    
    return enhancedData;
  },

  validateAnalysisResult(analysisResult: any): string[] {
    const errors: string[] = [];
    
    if (!analysisResult) {
      errors.push('Analysis result is null or undefined');
      return errors;
    }
    
    if (!analysisResult.targetTables || !Array.isArray(analysisResult.targetTables)) {
      errors.push('Missing or invalid targetTables array');
    } else if (analysisResult.targetTables.length === 0) {
      errors.push('No target tables specified - expected at least one table');
    }
    
    if (!analysisResult.fieldMappings || typeof analysisResult.fieldMappings !== 'object') {
      errors.push('Missing or invalid fieldMappings object');
    } else if (Object.keys(analysisResult.fieldMappings).length === 0) {
      errors.push('No field mappings specified - expected at least one mapping');
    }
    
    if (typeof analysisResult.confidence !== 'number' || analysisResult.confidence < 0 || analysisResult.confidence > 100) {
      errors.push('Invalid confidence score - expected number between 0 and 100');
    }
    
    // Validate target tables are supported
    const validTables = ['properties', 'homeowners', 'residents', 'assessments'];
    const invalidTables = analysisResult.targetTables?.filter((table: string) => !validTables.includes(table)) || [];
    if (invalidTables.length > 0) {
      errors.push(`Invalid target tables: ${invalidTables.join(', ')}. Supported: ${validTables.join(', ')}`);
    }
    
    return errors;
  },

  fallbackToPatternMatching(
    fileColumns: string[],
    systemFields: MappingOption[]
  ): Record<string, AIMappingSuggestion> {
    devLog.info('Using enhanced fallback pattern matching...', { fileColumns: fileColumns.length, systemFields: systemFields.length });
    
    const suggestions: Record<string, AIMappingSuggestion> = {};
    
    // Enhanced pattern matching with better scoring
    fileColumns.forEach(column => {
      const normalizedColumn = column.toLowerCase().trim().replace(/[_\s]+/g, '_');
      let bestMatch = null;
      let bestScore = 0;
      
      systemFields.forEach(field => {
        const fieldValue = field.value.toLowerCase();
        const fieldLabel = field.label.toLowerCase();
        let score = 0;
        
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
          confidence: bestScore,
          reasoning: `Enhanced pattern matching (${Math.round(bestScore * 100)}% match)`,
          dataQuality: bestScore > 0.8 ? 'good' : 'warning' as const,
          suggestions: bestScore < 0.8 ? ['Consider manual verification', 'AI analysis recommended for better accuracy'] : []
        };
      } else {
        // Add unmapped column with suggestions
        suggestions[column] = {
          fieldValue: '',
          confidence: 0,
          reasoning: 'No suitable mapping found',
          dataQuality: 'error' as const,
          suggestions: ['Manual mapping required', 'Check column name spelling', 'Consider data transformation']
        };
      }
    });
    
    devLog.info('Enhanced fallback completed:', { mappingsFound: Object.keys(suggestions).filter(k => suggestions[k].confidence > 0).length });
    return suggestions;
  }
};
