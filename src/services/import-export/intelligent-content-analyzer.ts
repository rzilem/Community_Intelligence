
import { openaiContentAnalyzer, OpenAIAnalysisResult } from './openai-content-analyzer';
import { devLog } from '@/utils/dev-logger';

export interface ContentAnalysisResult {
  dataType: string;
  confidence: number;
  fieldMappings: Record<string, string>;
  qualityScore: number;
  suggestions: string[];
  issues: string[];
}

export interface StructuralAnalysis {
  rowCount: number;
  columnCount: number;
  headerDetected: boolean;
  dataTypes: Record<string, string>;
  nullPercentage: Record<string, number>;
  uniqueValueCount: Record<string, number>;
}

export interface DocumentIntelligence {
  format: string;
  structure: 'tabular' | 'form' | 'text' | 'mixed';
  complexity: 'simple' | 'moderate' | 'complex';
  processingRecommendations: string[];
}

export interface IntelligentAnalysisOptions {
  includeStructural?: boolean;
  includeDocumentIntelligence?: boolean;
  enableAIAnalysis?: boolean;
  confidenceThreshold?: number;
}

export const intelligentContentAnalyzer = {
  async analyzeContent(
    content: any,
    filename: string,
    options: IntelligentAnalysisOptions = {}
  ): Promise<{
    analysis: ContentAnalysisResult;
    structural?: StructuralAnalysis;
    intelligence?: DocumentIntelligence;
    aiAnalysis?: OpenAIAnalysisResult;
  }> {
    devLog.info('Starting intelligent content analysis', { filename });

    try {
      // Perform basic content analysis
      const analysis = await this.performBasicAnalysis(content, filename);

      const result: any = { analysis };

      // Add structural analysis if requested
      if (options.includeStructural && Array.isArray(content)) {
        result.structural = this.analyzeStructure(content);
      }

      // Add document intelligence if requested
      if (options.includeDocumentIntelligence) {
        result.intelligence = this.analyzeDocumentIntelligence(content, filename);
      }

      // Add AI analysis if requested and available
      if (options.enableAIAnalysis && Array.isArray(content) && content.length > 0) {
        try {
          const headers = Object.keys(content[0]);
          const sampleData = content.slice(0, 5);
          result.aiAnalysis = await openaiContentAnalyzer.analyzeFileContent(
            filename,
            headers,
            sampleData
          );
        } catch (error) {
          devLog.warn('AI analysis failed, continuing without it', error);
        }
      }

      devLog.info('Content analysis completed', {
        filename,
        dataType: analysis.dataType,
        confidence: analysis.confidence,
        qualityScore: analysis.qualityScore
      });

      return result;
    } catch (error) {
      devLog.error('Content analysis failed', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async analyzeBatch(
    documents: Array<{
      filename: string;
      content: any;
      headers?: string[];
      sampleData?: any[];
    }>,
    options: IntelligentAnalysisOptions = {}
  ): Promise<{
    results: Array<{
      filename: string;
      analysis: ContentAnalysisResult;
      structural?: StructuralAnalysis;
      intelligence?: DocumentIntelligence;
    }>;
    summary: {
      totalDocuments: number;
      averageConfidence: number;
      commonDataTypes: string[];
      recommendedProcessingOrder: string[];
    };
  }> {
    devLog.info('Starting batch content analysis', { count: documents.length });

    const results: any[] = [];
    let totalConfidence = 0;
    const dataTypes: Record<string, number> = {};

    for (const doc of documents) {
      try {
        const result = await this.analyzeContent(doc.content, doc.filename, {
          ...options,
          enableAIAnalysis: false // Disable AI for batch to avoid rate limits
        });

        results.push({
          filename: doc.filename,
          ...result
        });

        totalConfidence += result.analysis.confidence;
        dataTypes[result.analysis.dataType] = (dataTypes[result.analysis.dataType] || 0) + 1;
      } catch (error) {
        devLog.error(`Failed to analyze ${doc.filename}`, error);
      }
    }

    // Generate summary
    const averageConfidence = results.length > 0 ? totalConfidence / results.length : 0;
    const commonDataTypes = Object.entries(dataTypes)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);

    const recommendedProcessingOrder = this.determineProcessingOrder(results);

    return {
      results,
      summary: {
        totalDocuments: results.length,
        averageConfidence,
        commonDataTypes,
        recommendedProcessingOrder
      }
    };
  },

  async performBasicAnalysis(content: any, filename: string): Promise<ContentAnalysisResult> {
    // Basic heuristic analysis
    let dataType = 'unknown';
    let confidence = 0.5;
    const fieldMappings: Record<string, string> = {};
    const suggestions: string[] = [];
    const issues: string[] = [];

    if (Array.isArray(content) && content.length > 0) {
      const headers = Object.keys(content[0]);
      
      // Analyze headers to determine data type
      const headerAnalysis = this.analyzeHeaders(headers);
      dataType = headerAnalysis.suggestedType;
      confidence = headerAnalysis.confidence;

      // Generate field mappings
      headers.forEach(header => {
        const mapping = this.mapFieldToStandard(header, dataType);
        if (mapping) {
          fieldMappings[header] = mapping;
        }
      });

      // Quality assessment
      const qualityAssessment = this.assessDataQuality(content);
      
      return {
        dataType,
        confidence,
        fieldMappings,
        qualityScore: qualityAssessment.score,
        suggestions: [...suggestions, ...qualityAssessment.suggestions],
        issues: [...issues, ...qualityAssessment.issues]
      };
    }

    return {
      dataType,
      confidence,
      fieldMappings,
      qualityScore: 0.3,
      suggestions: ['Content could not be parsed as structured data'],
      issues: ['No structured data detected']
    };
  },

  analyzeHeaders(headers: string[]): { suggestedType: string; confidence: number } {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    // Property-related patterns
    const propertyPatterns = ['address', 'unit', 'property', 'lot', 'square_feet', 'bedrooms', 'bathrooms'];
    const propertyMatches = propertyPatterns.filter(pattern => 
      lowerHeaders.some(h => h.includes(pattern))
    ).length;

    // Owner/Resident patterns
    const ownerPatterns = ['name', 'first_name', 'last_name', 'email', 'phone', 'resident', 'owner'];
    const ownerMatches = ownerPatterns.filter(pattern =>
      lowerHeaders.some(h => h.includes(pattern))
    ).length;

    // Financial patterns
    const financialPatterns = ['amount', 'balance', 'payment', 'fee', 'assessment', 'due_date', 'invoice'];
    const financialMatches = financialPatterns.filter(pattern =>
      lowerHeaders.some(h => h.includes(pattern))
    ).length;

    // Determine best match
    const scores = {
      properties: propertyMatches / propertyPatterns.length,
      owners: ownerMatches / ownerPatterns.length,
      financial: financialMatches / financialPatterns.length
    };

    const bestMatch = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    
    // Check for combined property-owner data
    if (scores.properties > 0.3 && scores.owners > 0.3) {
      return { suggestedType: 'properties_owners', confidence: Math.min(scores.properties + scores.owners, 0.9) };
    }

    return {
      suggestedType: bestMatch[0],
      confidence: Math.max(bestMatch[1], 0.4)
    };
  },

  mapFieldToStandard(fieldName: string, dataType: string): string | null {
    const lower = fieldName.toLowerCase();
    
    const mappings: Record<string, Record<string, string>> = {
      properties: {
        'address': 'address',
        'street': 'address',
        'unit': 'unit_number',
        'unit_number': 'unit_number',
        'lot': 'lot_number',
        'square_feet': 'square_footage',
        'sqft': 'square_footage',
        'bedrooms': 'bedrooms',
        'beds': 'bedrooms',
        'bathrooms': 'bathrooms',
        'baths': 'bathrooms'
      },
      owners: {
        'first_name': 'first_name',
        'fname': 'first_name',
        'last_name': 'last_name',
        'lname': 'last_name',
        'email': 'email',
        'phone': 'phone',
        'phone_number': 'phone'
      },
      financial: {
        'amount': 'amount',
        'balance': 'balance',
        'due_date': 'due_date',
        'payment_date': 'payment_date',
        'invoice_number': 'invoice_number'
      }
    };

    const typeMap = mappings[dataType] || {};
    
    for (const [pattern, standardField] of Object.entries(typeMap)) {
      if (lower.includes(pattern)) {
        return standardField;
      }
    }

    return null;
  },

  analyzeStructure(content: any[]): StructuralAnalysis {
    if (!Array.isArray(content) || content.length === 0) {
      return {
        rowCount: 0,
        columnCount: 0,
        headerDetected: false,
        dataTypes: {},
        nullPercentage: {},
        uniqueValueCount: {}
      };
    }

    const headers = Object.keys(content[0]);
    const dataTypes: Record<string, string> = {};
    const nullPercentage: Record<string, number> = {};
    const uniqueValueCount: Record<string, number> = {};

    headers.forEach(header => {
      const values = content.map(row => row[header]).filter(v => v != null && v !== '');
      const nullCount = content.length - values.length;
      const uniqueValues = new Set(values);

      // Determine data type
      if (values.every(v => !isNaN(Number(v)) && v !== '')) {
        dataTypes[header] = 'number';
      } else if (values.some(v => /^\d{4}-\d{2}-\d{2}/.test(String(v)))) {
        dataTypes[header] = 'date';
      } else {
        dataTypes[header] = 'text';
      }

      nullPercentage[header] = (nullCount / content.length) * 100;
      uniqueValueCount[header] = uniqueValues.size;
    });

    return {
      rowCount: content.length,
      columnCount: headers.length,
      headerDetected: true,
      dataTypes,
      nullPercentage,
      uniqueValueCount
    };
  },

  analyzeDocumentIntelligence(content: any, filename: string): DocumentIntelligence {
    const extension = filename.toLowerCase().split('.').pop() || '';
    
    let format = 'unknown';
    let structure: DocumentIntelligence['structure'] = 'text';
    let complexity: DocumentIntelligence['complexity'] = 'simple';

    // Determine format
    if (['csv', 'xlsx', 'xls'].includes(extension)) {
      format = 'spreadsheet';
      structure = 'tabular';
    } else if (['pdf', 'doc', 'docx'].includes(extension)) {
      format = 'document';
      structure = Array.isArray(content) ? 'tabular' : 'text';
    } else if (['jpg', 'png', 'gif', 'tiff'].includes(extension)) {
      format = 'image';
      structure = 'mixed';
    }

    // Determine complexity
    if (Array.isArray(content) && content.length > 0) {
      const headers = Object.keys(content[0]);
      if (headers.length > 10) complexity = 'complex';
      else if (headers.length > 5) complexity = 'moderate';
    }

    const processingRecommendations: string[] = [];
    
    if (complexity === 'complex') {
      processingRecommendations.push('Consider batch processing for large datasets');
    }
    
    if (structure === 'mixed') {
      processingRecommendations.push('Enable OCR for image-based content');
    }

    return {
      format,
      structure,
      complexity,
      processingRecommendations
    };
  },

  assessDataQuality(content: any[]): { score: number; suggestions: string[]; issues: string[] } {
    if (!Array.isArray(content) || content.length === 0) {
      return {
        score: 0,
        suggestions: ['No data to assess'],
        issues: ['Empty dataset']
      };
    }

    let score = 100;
    const suggestions: string[] = [];
    const issues: string[] = [];

    const headers = Object.keys(content[0]);
    
    // Check for empty headers
    const emptyHeaders = headers.filter(h => !h || h.trim() === '');
    if (emptyHeaders.length > 0) {
      score -= 20;
      issues.push(`${emptyHeaders.length} empty column headers detected`);
      suggestions.push('Ensure all columns have meaningful headers');
    }

    // Check data completeness
    headers.forEach(header => {
      const values = content.map(row => row[header]);
      const emptyValues = values.filter(v => v == null || v === '').length;
      const emptyPercentage = (emptyValues / content.length) * 100;

      if (emptyPercentage > 50) {
        score -= 10;
        issues.push(`Column '${header}' is ${emptyPercentage.toFixed(1)}% empty`);
        suggestions.push(`Review data completeness for '${header}' column`);
      }
    });

    // Check for duplicate rows
    const uniqueRows = new Set(content.map(row => JSON.stringify(row)));
    const duplicateCount = content.length - uniqueRows.size;
    if (duplicateCount > 0) {
      score -= Math.min(duplicateCount * 2, 30);
      issues.push(`${duplicateCount} duplicate rows detected`);
      suggestions.push('Remove duplicate entries before processing');
    }

    return {
      score: Math.max(0, score),
      suggestions,
      issues
    };
  },

  determineProcessingOrder(results: any[]): string[] {
    // Sort by confidence and complexity
    return results
      .sort((a, b) => {
        // Prioritize higher confidence
        const confidenceDiff = (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0);
        if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;

        // Then prioritize simpler structures
        const aComplexity = a.intelligence?.complexity === 'simple' ? 0 : 
                           a.intelligence?.complexity === 'moderate' ? 1 : 2;
        const bComplexity = b.intelligence?.complexity === 'simple' ? 0 :
                           b.intelligence?.complexity === 'moderate' ? 1 : 2;
        
        return aComplexity - bComplexity;
      })
      .map(result => result.filename);
  }
};
