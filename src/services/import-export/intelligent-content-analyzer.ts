
import { openaiContentAnalyzer } from './openai-content-analyzer';
import { multiFormatProcessor, type MultiFormatResult } from './multi-format-processor';
import { devLog } from '@/utils/dev-logger';

export interface IntelligentAnalysisResult {
  dataType: string;
  confidence: number;
  fieldMappings: Record<string, string>;
  qualityAssessment: QualityAssessment;
  structuralAnalysis: StructuralAnalysis;
  recommendations: string[];
  processingStrategy: ProcessingStrategy;
  metadata: AnalysisMetadata;
}

export interface QualityAssessment {
  overallScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'missing_data' | 'inconsistent_format' | 'duplicate_records' | 'invalid_values' | 'low_confidence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFields?: string[];
  recordCount?: number;
}

export interface StructuralAnalysis {
  recordCount: number;
  fieldCount: number;
  fieldTypes: Record<string, string>;
  relationshipPotential: RelationshipScore[];
  dataPatterns: DataPattern[];
}

export interface RelationshipScore {
  field1: string;
  field2: string;
  score: number;
  type: 'parent_child' | 'one_to_many' | 'many_to_many' | 'reference';
}

export interface DataPattern {
  pattern: string;
  description: string;
  examples: string[];
  confidence: number;
}

export interface ProcessingStrategy {
  recommendedApproach: 'direct_import' | 'staged_import' | 'manual_review' | 'preprocessing_required';
  preprocessingSteps: string[];
  importOrder: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface AnalysisMetadata {
  analysisTime: number;
  documentFormat: string;
  ocrQuality?: number;
  hasStructuredData: boolean;
  requiresManualReview: boolean;
}

export const intelligentContentAnalyzer = {
  async analyzeDocument(file: File): Promise<IntelligentAnalysisResult> {
    const startTime = Date.now();
    devLog.info('Starting intelligent content analysis for:', file.name);
    
    try {
      // Step 1: Multi-format processing
      const formatResult = await multiFormatProcessor.processDocument(file);
      
      // Step 2: Enhanced AI analysis
      const aiAnalysis = await this.performEnhancedAIAnalysis(formatResult);
      
      // Step 3: Quality assessment
      const qualityAssessment = await this.assessDataQuality(formatResult);
      
      // Step 4: Structural analysis
      const structuralAnalysis = await this.performStructuralAnalysis(formatResult);
      
      // Step 5: Generate recommendations
      const recommendations = await this.generateRecommendations(formatResult, qualityAssessment, structuralAnalysis);
      
      // Step 6: Determine processing strategy
      const processingStrategy = await this.determineProcessingStrategy(formatResult, qualityAssessment);
      
      const analysisTime = Date.now() - startTime;
      
      const result: IntelligentAnalysisResult = {
        dataType: aiAnalysis.dataType,
        confidence: Math.min(formatResult.confidence, aiAnalysis.confidence),
        fieldMappings: aiAnalysis.fieldMappings,
        qualityAssessment,
        structuralAnalysis,
        recommendations,
        processingStrategy,
        metadata: {
          analysisTime,
          documentFormat: formatResult.format,
          ocrQuality: formatResult.structuredContent?.qualityScore,
          hasStructuredData: formatResult.extractedData.length > 0,
          requiresManualReview: qualityAssessment.overallScore < 70
        }
      };
      
      devLog.info('Intelligent content analysis complete:', {
        filename: file.name,
        dataType: result.dataType,
        confidence: result.confidence,
        qualityScore: result.qualityAssessment.overallScore,
        analysisTime
      });
      
      return result;
      
    } catch (error) {
      devLog.error('Intelligent content analysis failed:', error);
      throw new Error(`Analysis failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async performEnhancedAIAnalysis(formatResult: MultiFormatResult): Promise<{ dataType: string; confidence: number; fieldMappings: Record<string, string> }> {
    try {
      // Prepare enhanced context for AI analysis
      const context = {
        filename: formatResult.filename,
        format: formatResult.format,
        recordCount: formatResult.extractedData.length,
        hasTableData: formatResult.metadata.hasTableData,
        hasFormFields: formatResult.metadata.hasFormFields,
        qualityScore: formatResult.metadata.qualityScore,
        sampleData: formatResult.extractedData.slice(0, 5),
        structuredContent: formatResult.structuredContent ? {
          tableCount: formatResult.structuredContent.tableData?.length || 0,
          formFieldCount: formatResult.structuredContent.formFields?.length || 0,
          regionCount: formatResult.structuredContent.structuredRegions?.length || 0
        } : null
      };
      
      // Use existing AI analyzer with enhanced context
      const aiResult = await openaiContentAnalyzer.analyzeContent({
        filename: formatResult.filename,
        headers: formatResult.extractedData.length > 0 ? Object.keys(formatResult.extractedData[0]) : [],
        sampleData: formatResult.extractedData.slice(0, 5),
        metadata: context
      });
      
      return {
        dataType: aiResult.dataType,
        confidence: aiResult.confidence,
        fieldMappings: aiResult.fieldMappings
      };
      
    } catch (error) {
      devLog.error('Enhanced AI analysis failed:', error);
      
      // Fallback to basic analysis
      return {
        dataType: 'unknown',
        confidence: 0.3,
        fieldMappings: {}
      };
    }
  },

  async assessDataQuality(formatResult: MultiFormatResult): Promise<QualityAssessment> {
    try {
      const data = formatResult.extractedData;
      const issues: QualityIssue[] = [];
      
      // Completeness assessment
      const completeness = this.assessCompleteness(data, issues);
      
      // Consistency assessment
      const consistency = this.assessConsistency(data, issues);
      
      // Accuracy assessment (based on format confidence and OCR quality)
      const accuracy = this.assessAccuracy(formatResult, issues);
      
      // Calculate overall score
      const overallScore = Math.round((completeness + consistency + accuracy) / 3);
      
      return {
        overallScore,
        completeness,
        consistency,
        accuracy,
        issues
      };
      
    } catch (error) {
      devLog.error('Quality assessment failed:', error);
      return {
        overallScore: 50,
        completeness: 50,
        consistency: 50,
        accuracy: 50,
        issues: [{
          type: 'low_confidence',
          severity: 'medium',
          description: 'Quality assessment failed, manual review recommended'
        }]
      };
    }
  },

  async performStructuralAnalysis(formatResult: MultiFormatResult): Promise<StructuralAnalysis> {
    try {
      const data = formatResult.extractedData;
      
      if (data.length === 0) {
        return {
          recordCount: 0,
          fieldCount: 0,
          fieldTypes: {},
          relationshipPotential: [],
          dataPatterns: []
        };
      }
      
      const firstRecord = data[0];
      const fields = Object.keys(firstRecord);
      
      // Analyze field types
      const fieldTypes = this.analyzeFieldTypes(data, fields);
      
      // Detect relationships
      const relationshipPotential = this.detectRelationships(data, fields);
      
      // Identify data patterns
      const dataPatterns = this.identifyDataPatterns(data, fields);
      
      return {
        recordCount: data.length,
        fieldCount: fields.length,
        fieldTypes,
        relationshipPotential,
        dataPatterns
      };
      
    } catch (error) {
      devLog.error('Structural analysis failed:', error);
      return {
        recordCount: 0,
        fieldCount: 0,
        fieldTypes: {},
        relationshipPotential: [],
        dataPatterns: []
      };
    }
  },

  async generateRecommendations(
    formatResult: MultiFormatResult, 
    qualityAssessment: QualityAssessment, 
    structuralAnalysis: StructuralAnalysis
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    try {
      // Quality-based recommendations
      if (qualityAssessment.overallScore < 70) {
        recommendations.push('Manual review recommended due to low quality score');
      }
      
      if (qualityAssessment.completeness < 80) {
        recommendations.push('Consider filling missing data before import');
      }
      
      if (qualityAssessment.consistency < 70) {
        recommendations.push('Data standardization needed for consistent formatting');
      }
      
      // Format-specific recommendations
      if (formatResult.format === 'pdf_image' || formatResult.format === 'image') {
        if ((formatResult.metadata.qualityScore || 0) < 70) {
          recommendations.push('Consider rescanning document for better OCR quality');
        }
      }
      
      // Structure-based recommendations
      if (structuralAnalysis.relationshipPotential.length > 0) {
        recommendations.push('Multiple data relationships detected - consider staged import');
      }
      
      if (structuralAnalysis.recordCount > 1000) {
        recommendations.push('Large dataset detected - use batch processing for import');
      }
      
      // Critical issues
      const criticalIssues = qualityAssessment.issues.filter(issue => issue.severity === 'critical');
      if (criticalIssues.length > 0) {
        recommendations.push('Critical data issues found - resolve before proceeding');
      }
      
      return recommendations;
      
    } catch (error) {
      devLog.error('Recommendation generation failed:', error);
      return ['Unable to generate recommendations - manual review required'];
    }
  },

  async determineProcessingStrategy(
    formatResult: MultiFormatResult, 
    qualityAssessment: QualityAssessment
  ): Promise<ProcessingStrategy> {
    try {
      let recommendedApproach: ProcessingStrategy['recommendedApproach'] = 'direct_import';
      const preprocessingSteps: string[] = [];
      const validationRules: ValidationRule[] = [];
      
      // Determine approach based on quality
      if (qualityAssessment.overallScore < 50) {
        recommendedApproach = 'manual_review';
      } else if (qualityAssessment.overallScore < 80) {
        recommendedApproach = 'preprocessing_required';
      } else if (formatResult.extractedData.length > 500) {
        recommendedApproach = 'staged_import';
      }
      
      // Add preprocessing steps based on issues
      qualityAssessment.issues.forEach(issue => {
        switch (issue.type) {
          case 'missing_data':
            preprocessingSteps.push('Fill or flag missing required fields');
            break;
          case 'inconsistent_format':
            preprocessingSteps.push('Standardize data formats');
            break;
          case 'duplicate_records':
            preprocessingSteps.push('Remove or merge duplicate records');
            break;
          case 'invalid_values':
            preprocessingSteps.push('Validate and correct invalid values');
            break;
        }
      });
      
      // Create validation rules
      if (formatResult.extractedData.length > 0) {
        const firstRecord = formatResult.extractedData[0];
        Object.keys(firstRecord).forEach(field => {
          if (field.toLowerCase().includes('email')) {
            validationRules.push({
              field,
              rule: 'email_format',
              message: 'Must be a valid email address',
              severity: 'error'
            });
          }
          
          if (field.toLowerCase().includes('phone')) {
            validationRules.push({
              field,
              rule: 'phone_format',
              message: 'Must be a valid phone number',
              severity: 'warning'
            });
          }
        });
      }
      
      return {
        recommendedApproach,
        preprocessingSteps,
        importOrder: ['associations', 'properties', 'residents', 'assessments'], // Default order
        validationRules
      };
      
    } catch (error) {
      devLog.error('Processing strategy determination failed:', error);
      return {
        recommendedApproach: 'manual_review',
        preprocessingSteps: ['Manual review required due to analysis failure'],
        importOrder: [],
        validationRules: []
      };
    }
  },

  // Helper methods for quality assessment
  private assessCompleteness(data: any[], issues: QualityIssue[]): number {
    if (data.length === 0) return 0;
    
    const firstRecord = data[0];
    const fields = Object.keys(firstRecord);
    let totalValues = 0;
    let filledValues = 0;
    
    data.forEach(record => {
      fields.forEach(field => {
        totalValues++;
        const value = record[field];
        if (value !== null && value !== undefined && value !== '') {
          filledValues++;
        }
      });
    });
    
    const completeness = Math.round((filledValues / totalValues) * 100);
    
    if (completeness < 80) {
      issues.push({
        type: 'missing_data',
        severity: completeness < 50 ? 'critical' : 'medium',
        description: `${100 - completeness}% of data fields are empty`,
        recordCount: Math.round((totalValues - filledValues) / fields.length)
      });
    }
    
    return completeness;
  },

  private assessConsistency(data: any[], issues: QualityIssue[]): number {
    if (data.length === 0) return 100;
    
    const firstRecord = data[0];
    const fields = Object.keys(firstRecord);
    let consistencyScore = 100;
    
    fields.forEach(field => {
      const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined && v !== '');
      
      if (values.length === 0) return;
      
      // Check for format consistency
      const formats = new Set();
      values.forEach(value => {
        const type = typeof value;
        if (type === 'string') {
          // Detect specific formats
          if (/^\d{4}-\d{2}-\d{2}/.test(value)) formats.add('date_iso');
          else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) formats.add('date_us');
          else if (/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) formats.add('email');
          else if (/^\(\d{3}\)\s?\d{3}-\d{4}$/.test(value)) formats.add('phone_us');
          else formats.add('text');
        } else {
          formats.add(type);
        }
      });
      
      if (formats.size > 1) {
        consistencyScore -= 10;
        issues.push({
          type: 'inconsistent_format',
          severity: 'medium',
          description: `Field '${field}' has inconsistent formats`,
          affectedFields: [field]
        });
      }
    });
    
    return Math.max(0, consistencyScore);
  },

  private assessAccuracy(formatResult: MultiFormatResult, issues: QualityIssue[]): number {
    let accuracy = formatResult.confidence * 100;
    
    // Adjust based on OCR quality if available
    if (formatResult.metadata.qualityScore) {
      accuracy = Math.min(accuracy, formatResult.metadata.qualityScore);
    }
    
    // Penalize for format issues
    if (formatResult.format === 'unknown') {
      accuracy *= 0.5;
      issues.push({
        type: 'low_confidence',
        severity: 'high',
        description: 'Unknown document format detected'
      });
    }
    
    if (accuracy < 70) {
      issues.push({
        type: 'low_confidence',
        severity: accuracy < 50 ? 'critical' : 'medium',
        description: `Low extraction confidence: ${accuracy.toFixed(1)}%`
      });
    }
    
    return Math.round(accuracy);
  },

  private analyzeFieldTypes(data: any[], fields: string[]): Record<string, string> {
    const fieldTypes: Record<string, string> = {};
    
    fields.forEach(field => {
      const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined && v !== '');
      
      if (values.length === 0) {
        fieldTypes[field] = 'unknown';
        return;
      }
      
      // Analyze sample values to determine type
      const sample = values.slice(0, 10);
      let type = 'text';
      
      if (sample.every(v => !isNaN(Number(v)))) {
        type = 'number';
      } else if (sample.every(v => /^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v))) {
        type = 'date';
      } else if (sample.every(v => /^[\w.-]+@[\w.-]+\.\w+$/.test(v))) {
        type = 'email';
      } else if (sample.every(v => /^\(\d{3}\)\s?\d{3}-\d{4}$/.test(v) || /^\d{3}-\d{3}-\d{4}$/.test(v))) {
        type = 'phone';
      } else if (sample.every(v => typeof v === 'boolean' || ['true', 'false', 'yes', 'no'].includes(v.toLowerCase()))) {
        type = 'boolean';
      }
      
      fieldTypes[field] = type;
    });
    
    return fieldTypes;
  },

  private detectRelationships(data: any[], fields: string[]): RelationshipScore[] {
    const relationships: RelationshipScore[] = [];
    
    // Simple relationship detection based on field names and value patterns
    fields.forEach((field1, i) => {
      fields.slice(i + 1).forEach(field2 => {
        let score = 0;
        let type: RelationshipScore['type'] = 'reference';
        
        // Check for naming patterns
        if (field1.toLowerCase().includes('id') && field2.toLowerCase().includes(field1.replace(/id$/i, '').toLowerCase())) {
          score = 80;
          type = 'parent_child';
        } else if (field1.toLowerCase().includes('property') && field2.toLowerCase().includes('owner')) {
          score = 70;
          type = 'one_to_many';
        } else if (field1.toLowerCase().includes('email') && field2.toLowerCase().includes('name')) {
          score = 60;
          type = 'reference';
        }
        
        if (score > 50) {
          relationships.push({ field1, field2, score, type });
        }
      });
    });
    
    return relationships;
  },

  private identifyDataPatterns(data: any[], fields: string[]): DataPattern[] {
    const patterns: DataPattern[] = [];
    
    fields.forEach(field => {
      const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined && v !== '');
      
      if (values.length < 3) return;
      
      // Check for common patterns
      const sample = values.slice(0, 20);
      
      // Sequential numbers
      if (sample.every(v => !isNaN(Number(v)))) {
        const numbers = sample.map(Number).sort((a, b) => a - b);
        const isSequential = numbers.every((num, i) => i === 0 || num === numbers[i - 1] + 1);
        
        if (isSequential) {
          patterns.push({
            pattern: 'sequential_numbers',
            description: `Sequential numbering pattern in ${field}`,
            examples: sample.slice(0, 3),
            confidence: 0.9
          });
        }
      }
      
      // Address patterns
      if (sample.some(v => /\d+\s+\w+\s+(st|street|ave|avenue|rd|road|dr|drive)/i.test(v))) {
        patterns.push({
          pattern: 'address_format',
          description: `Address format detected in ${field}`,
          examples: sample.filter(v => /\d+\s+\w+\s+(st|street|ave|avenue|rd|road|dr|drive)/i.test(v)).slice(0, 3),
          confidence: 0.8
        });
      }
      
      // Code patterns (like property codes)
      if (sample.every(v => /^[A-Z0-9]+$/.test(v) && v.length >= 3 && v.length <= 10)) {
        patterns.push({
          pattern: 'alphanumeric_codes',
          description: `Alphanumeric code pattern in ${field}`,
          examples: sample.slice(0, 3),
          confidence: 0.7
        });
      }
    });
    
    return patterns;
  }
};
