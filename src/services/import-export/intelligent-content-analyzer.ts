
import { openaiContentAnalyzer, type OpenAIAnalysisResult } from './openai-content-analyzer';
import { advancedOCRService } from './advanced-ocr-service';
import { devLog } from '@/utils/dev-logger';

export interface ContentAnalysisResult {
  contentType: 'structured' | 'semi-structured' | 'unstructured';
  dataQuality: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  extractionStrategy: 'direct' | 'ocr' | 'hybrid' | 'manual';
  fieldMappings: Record<string, string>;
  confidence: number;
  processingNotes: string[];
}

export interface StructuralAnalysis {
  hasHeaders: boolean;
  rowCount: number;
  columnCount: number;
  dataTypes: Record<string, 'text' | 'number' | 'date' | 'boolean' | 'mixed'>;
  consistency: {
    score: number;
    issues: string[];
  };
  completeness: {
    score: number;
    missingFields: string[];
    emptyRows: number;
  };
}

export interface DocumentIntelligence {
  documentType: 'spreadsheet' | 'pdf_table' | 'form' | 'report' | 'invoice' | 'unknown';
  confidence: number;
  suggestedProcessing: string[];
  extractionComplexity: 'simple' | 'moderate' | 'complex';
  estimatedAccuracy: number;
}

export interface IntelligentAnalysisOptions {
  includeOCR?: boolean;
  performStructuralAnalysis?: boolean;
  suggestMappings?: boolean;
  assessQuality?: boolean;
  enableAI?: boolean;
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
    devLog.info('Starting intelligent content analysis for:', filename);
    
    try {
      const results: any = {};
      
      // Determine content type and initial analysis
      const contentType = this.determineContentType(content, filename);
      results.analysis = await this.performContentAnalysis(content, filename, contentType, options);
      
      // Structural analysis for structured data
      if (options.performStructuralAnalysis && Array.isArray(content)) {
        results.structural = this.analyzeDataStructure(content);
      }
      
      // Document intelligence analysis
      results.intelligence = await this.analyzeDocumentIntelligence(content, filename);
      
      // AI-powered analysis if enabled
      if (options.enableAI && Array.isArray(content) && content.length > 0) {
        const headers = Object.keys(content[0]);
        const sampleData = content.slice(0, 5);
        results.aiAnalysis = await openaiContentAnalyzer.analyzeFileContent(
          filename,
          headers,
          sampleData
        );
      }
      
      devLog.info('Intelligent analysis completed:', {
        contentType: results.analysis.contentType,
        confidence: results.analysis.confidence,
        strategy: results.analysis.extractionStrategy
      });
      
      return results;
      
    } catch (error) {
      devLog.error('Intelligent content analysis failed:', error);
      throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async batchAnalyzeContent(
    contents: Array<{ content: any; filename: string }>,
    options: IntelligentAnalysisOptions = {}
  ): Promise<Array<{
    filename: string;
    success: boolean;
    result?: any;
    error?: string;
  }>> {
    const results = [];
    
    for (const { content, filename } of contents) {
      try {
        const result = await this.analyzeContent(content, filename, options);
        results.push({
          filename,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          filename,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  },

  async analyzeImageDocument(
    file: File,
    options: IntelligentAnalysisOptions = {}
  ): Promise<{
    ocr: any;
    analysis: ContentAnalysisResult;
    intelligence: DocumentIntelligence;
  }> {
    if (!options.includeOCR) {
      throw new Error('OCR analysis not enabled for image document');
    }
    
    // Perform OCR with quality assessment
    const ocrResult = await advancedOCRService.processDocument(file, {
      language: 'eng',
      enhanceImage: true,
      extractTables: true,
      analyzeLayout: true,
      qualityCheck: true
    });
    
    // Analyze extracted content
    const extractedText = ocrResult.ocr.text;
    const analysis = await this.performContentAnalysis(
      extractedText, 
      file.name, 
      'unstructured',
      options
    );
    
    const intelligence = await this.analyzeDocumentIntelligence(extractedText, file.name);
    
    return {
      ocr: ocrResult,
      analysis,
      intelligence
    };
  },

  determineContentType(content: any, filename: string): 'structured' | 'semi-structured' | 'unstructured' {
    // Check if it's structured data (array of objects)
    if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object') {
      return 'structured';
    }
    
    // Check file extension for hints
    const ext = filename.toLowerCase().split('.').pop();
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
      return 'structured';
    }
    
    if (['json', 'xml'].includes(ext || '')) {
      return 'semi-structured';
    }
    
    // Check if content looks like structured text
    if (typeof content === 'string') {
      const lines = content.split('\n');
      const hasConsistentDelimiters = lines.some(line => 
        line.includes(',') || line.includes('\t') || line.includes('|')
      );
      
      if (hasConsistentDelimiters && lines.length > 2) {
        return 'semi-structured';
      }
    }
    
    return 'unstructured';
  },

  async performContentAnalysis(
    content: any,
    filename: string,
    contentType: 'structured' | 'semi-structured' | 'unstructured',
    options: IntelligentAnalysisOptions
  ): Promise<ContentAnalysisResult> {
    const analysis: ContentAnalysisResult = {
      contentType,
      dataQuality: { score: 0, issues: [], recommendations: [] },
      extractionStrategy: 'direct',
      fieldMappings: {},
      confidence: 0,
      processingNotes: []
    };
    
    switch (contentType) {
      case 'structured':
        return this.analyzeStructuredContent(content, filename, options);
      case 'semi-structured':
        return this.analyzeSemiStructuredContent(content, filename, options);
      case 'unstructured':
        return this.analyzeUnstructuredContent(content, filename, options);
      default:
        return analysis;
    }
  },

  analyzeStructuredContent(
    content: any[],
    filename: string,
    options: IntelligentAnalysisOptions
  ): ContentAnalysisResult {
    const headers = content.length > 0 ? Object.keys(content[0]) : [];
    const dataQuality = this.assessDataQuality(content);
    const fieldMappings = options.suggestMappings ? this.suggestFieldMappings(headers) : {};
    
    return {
      contentType: 'structured',
      dataQuality,
      extractionStrategy: 'direct',
      fieldMappings,
      confidence: 0.9,
      processingNotes: [
        `Found ${content.length} rows with ${headers.length} columns`,
        'Data is well-structured and ready for direct processing'
      ]
    };
  },

  analyzeSemiStructuredContent(
    content: string,
    filename: string,
    options: IntelligentAnalysisOptions
  ): ContentAnalysisResult {
    const lines = content.split('\n');
    const hasDelimiters = this.detectDelimiters(content);
    
    return {
      contentType: 'semi-structured',
      dataQuality: {
        score: 70,
        issues: hasDelimiters.length === 0 ? ['No clear delimiters detected'] : [],
        recommendations: ['Consider parsing with detected delimiters', 'May require data cleaning']
      },
      extractionStrategy: hasDelimiters.length > 0 ? 'direct' : 'hybrid',
      fieldMappings: {},
      confidence: 0.7,
      processingNotes: [
        `Found ${lines.length} lines`,
        `Detected delimiters: ${hasDelimiters.join(', ') || 'none'}`
      ]
    };
  },

  analyzeUnstructuredContent(
    content: string,
    filename: string,
    options: IntelligentAnalysisOptions
  ): ContentAnalysisResult {
    const wordCount = content.split(/\s+/).length;
    const hasStructuralElements = this.detectStructuralElements(content);
    
    return {
      contentType: 'unstructured',
      dataQuality: {
        score: hasStructuralElements ? 50 : 30,
        issues: [
          'Unstructured content requires advanced processing',
          'May need OCR or manual extraction'
        ],
        recommendations: [
          'Use OCR for scanned documents',
          'Consider manual review',
          'Apply NLP techniques for data extraction'
        ]
      },
      extractionStrategy: options.includeOCR ? 'ocr' : 'manual',
      fieldMappings: {},
      confidence: 0.4,
      processingNotes: [
        `Document contains ${wordCount} words`,
        `Structural elements detected: ${hasStructuralElements}`
      ]
    };
  },

  assessDataQuality(data: any[]): { score: number; issues: string[]; recommendations: string[] } {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        score: 0,
        issues: ['No data to analyze'],
        recommendations: ['Ensure data is properly loaded']
      };
    }
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Check for missing values
    const headers = Object.keys(data[0] || {});
    const missingValueCounts = headers.map(header => ({
      header,
      missing: data.filter(row => !row[header] || row[header] === '').length
    }));
    
    const highMissingFields = missingValueCounts.filter(
      field => field.missing > data.length * 0.2
    );
    
    if (highMissingFields.length > 0) {
      score -= 20;
      issues.push(`High missing values in: ${highMissingFields.map(f => f.header).join(', ')}`);
      recommendations.push('Consider data imputation or field validation');
    }
    
    // Check for data consistency
    const inconsistentTypes = this.detectInconsistentTypes(data);
    if (inconsistentTypes.length > 0) {
      score -= 15;
      issues.push(`Inconsistent data types in: ${inconsistentTypes.join(', ')}`);
      recommendations.push('Standardize data types before import');
    }
    
    // Check for duplicates
    const duplicates = this.detectDuplicates(data);
    if (duplicates > 0) {
      score -= 10;
      issues.push(`Found ${duplicates} potential duplicate rows`);
      recommendations.push('Review and remove duplicate entries');
    }
    
    return { score: Math.max(0, score), issues, recommendations };
  },

  analyzeDataStructure(data: any[]): StructuralAnalysis {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        hasHeaders: false,
        rowCount: 0,
        columnCount: 0,
        dataTypes: {},
        consistency: { score: 0, issues: ['No data to analyze'] },
        completeness: { score: 0, missingFields: [], emptyRows: 0 }
      };
    }
    
    const headers = Object.keys(data[0]);
    const dataTypes = this.analyzeDataTypes(data);
    const consistency = this.analyzeConsistency(data);
    const completeness = this.analyzeCompleteness(data);
    
    return {
      hasHeaders: headers.length > 0,
      rowCount: data.length,
      columnCount: headers.length,
      dataTypes,
      consistency,
      completeness
    };
  },

  async analyzeDocumentIntelligence(content: any, filename: string): Promise<DocumentIntelligence> {
    const ext = filename.toLowerCase().split('.').pop();
    let documentType: DocumentIntelligence['documentType'] = 'unknown';
    let confidence = 0.5;
    
    // File extension hints
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
      documentType = 'spreadsheet';
      confidence = 0.9;
    } else if (ext === 'pdf') {
      documentType = 'pdf_table';
      confidence = 0.7;
    }
    
    // Content analysis
    if (typeof content === 'string') {
      if (content.toLowerCase().includes('invoice') || content.toLowerCase().includes('bill')) {
        documentType = 'invoice';
        confidence = 0.8;
      } else if (content.includes('form') || content.includes('application')) {
        documentType = 'form';
        confidence = 0.7;
      }
    }
    
    const complexity = this.assessExtractionComplexity(content, documentType);
    const estimatedAccuracy = this.estimateAccuracy(documentType, complexity);
    
    return {
      documentType,
      confidence,
      suggestedProcessing: this.suggestProcessingSteps(documentType, complexity),
      extractionComplexity: complexity,
      estimatedAccuracy
    };
  },

  suggestFieldMappings(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    headers.forEach(header => {
      const normalized = header.toLowerCase().trim();
      
      // Common field mappings
      if (normalized.includes('name') && normalized.includes('first')) {
        mappings[header] = 'first_name';
      } else if (normalized.includes('name') && normalized.includes('last')) {
        mappings[header] = 'last_name';
      } else if (normalized.includes('email')) {
        mappings[header] = 'email';
      } else if (normalized.includes('phone')) {
        mappings[header] = 'phone';
      } else if (normalized.includes('address')) {
        mappings[header] = 'address';
      } else if (normalized.includes('unit') || normalized.includes('apt')) {
        mappings[header] = 'unit_number';
      } else if (normalized.includes('amount') || normalized.includes('balance')) {
        mappings[header] = 'amount';
      } else if (normalized.includes('date')) {
        mappings[header] = 'date';
      }
    });
    
    return mappings;
  },

  detectDelimiters(content: string): string[] {
    const delimiters = [',', '\t', '|', ';'];
    const detected = [];
    
    for (const delimiter of delimiters) {
      if (content.includes(delimiter)) {
        detected.push(delimiter);
      }
    }
    
    return detected;
  },

  detectStructuralElements(content: string): boolean {
    const structuralPatterns = [
      /^\s*#/m,           // Headers
      /^\s*\*/m,          // Bullet points
      /^\s*\d+\./m,       // Numbered lists
      /\|\s*.+\s*\|/m,    // Tables
      /.+:\s*.+/m         // Key-value pairs
    ];
    
    return structuralPatterns.some(pattern => pattern.test(content));
  },

  detectInconsistentTypes(data: any[]): string[] {
    if (data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    const inconsistent: string[] = [];
    
    headers.forEach(header => {
      const types = new Set();
      data.slice(0, 10).forEach(row => { // Sample first 10 rows
        const value = row[header];
        if (value !== null && value !== undefined && value !== '') {
          types.add(typeof value);
        }
      });
      
      if (types.size > 1) {
        inconsistent.push(header);
      }
    });
    
    return inconsistent;
  },

  detectDuplicates(data: any[]): number {
    const seen = new Set();
    let duplicates = 0;
    
    data.forEach(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    });
    
    return duplicates;
  },

  analyzeDataTypes(data: any[]): Record<string, 'text' | 'number' | 'date' | 'boolean' | 'mixed'> {
    if (data.length === 0) return {};
    
    const headers = Object.keys(data[0]);
    const types: Record<string, 'text' | 'number' | 'date' | 'boolean' | 'mixed'> = {};
    
    headers.forEach(header => {
      const values = data.slice(0, 10).map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
      
      if (values.length === 0) {
        types[header] = 'text';
        return;
      }
      
      const detectedTypes = new Set();
      
      values.forEach(value => {
        if (typeof value === 'boolean') {
          detectedTypes.add('boolean');
        } else if (!isNaN(Number(value))) {
          detectedTypes.add('number');
        } else if (this.isDateString(value)) {
          detectedTypes.add('date');
        } else {
          detectedTypes.add('text');
        }
      });
      
      if (detectedTypes.size === 1) {
        types[header] = Array.from(detectedTypes)[0] as any;
      } else {
        types[header] = 'mixed';
      }
    });
    
    return types;
  },

  analyzeConsistency(data: any[]): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;
    
    // Check for consistent number of fields
    const fieldCounts = data.map(row => Object.keys(row).length);
    const uniqueCounts = new Set(fieldCounts);
    
    if (uniqueCounts.size > 1) {
      score -= 20;
      issues.push('Inconsistent number of fields across rows');
    }
    
    // Check for consistent field names
    const allHeaders = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(key => allHeaders.add(key));
    });
    
    const expectedHeaders = Object.keys(data[0] || {});
    if (allHeaders.size !== expectedHeaders.length) {
      score -= 15;
      issues.push('Inconsistent field names across rows');
    }
    
    return { score: Math.max(0, score), issues };
  },

  analyzeCompleteness(data: any[]): { score: number; missingFields: string[]; emptyRows: number } {
    if (data.length === 0) {
      return { score: 0, missingFields: [], emptyRows: 0 };
    }
    
    const headers = Object.keys(data[0]);
    const missingFields: string[] = [];
    let emptyRows = 0;
    
    // Check for empty rows
    data.forEach(row => {
      const values = Object.values(row).filter(v => v !== null && v !== undefined && v !== '');
      if (values.length === 0) {
        emptyRows++;
      }
    });
    
    // Check for fields with high missing rates
    headers.forEach(header => {
      const missingCount = data.filter(row => !row[header] || row[header] === '').length;
      const missingRate = missingCount / data.length;
      
      if (missingRate > 0.5) {
        missingFields.push(header);
      }
    });
    
    const completenessScore = Math.max(0, 100 - (emptyRows / data.length * 50) - (missingFields.length / headers.length * 30));
    
    return {
      score: completenessScore,
      missingFields,
      emptyRows
    };
  },

  isDateString(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,         // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,       // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/,         // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/  // M/D/YY or MM/DD/YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value));
  },

  assessExtractionComplexity(content: any, documentType: DocumentIntelligence['documentType']): 'simple' | 'moderate' | 'complex' {
    if (documentType === 'spreadsheet' && Array.isArray(content)) {
      return 'simple';
    }
    
    if (documentType === 'form' || documentType === 'pdf_table') {
      return 'moderate';
    }
    
    if (typeof content === 'string') {
      const wordCount = content.split(/\s+/).length;
      if (wordCount < 100) return 'simple';
      if (wordCount < 1000) return 'moderate';
      return 'complex';
    }
    
    return 'moderate';
  },

  estimateAccuracy(documentType: DocumentIntelligence['documentType'], complexity: 'simple' | 'moderate' | 'complex'): number {
    const baseAccuracy = {
      spreadsheet: 95,
      form: 80,
      pdf_table: 75,
      report: 70,
      invoice: 85,
      unknown: 60
    };
    
    const complexityModifier = {
      simple: 0,
      moderate: -10,
      complex: -20
    };
    
    return Math.max(30, baseAccuracy[documentType] + complexityModifier[complexity]);
  },

  suggestProcessingSteps(documentType: DocumentIntelligence['documentType'], complexity: 'simple' | 'moderate' | 'complex'): string[] {
    const steps = [];
    
    switch (documentType) {
      case 'spreadsheet':
        steps.push('Direct CSV/Excel parsing', 'Field mapping', 'Data validation');
        break;
      case 'pdf_table':
        steps.push('OCR extraction', 'Table detection', 'Field mapping', 'Manual review');
        break;
      case 'form':
        steps.push('Form field detection', 'OCR if needed', 'Field validation');
        break;
      case 'invoice':
        steps.push('Invoice template detection', 'Key field extraction', 'Amount validation');
        break;
      default:
        steps.push('Content analysis', 'Manual processing', 'Data validation');
    }
    
    if (complexity === 'complex') {
      steps.push('Manual review required');
    }
    
    return steps;
  }
};
