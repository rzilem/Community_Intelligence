
import { devLog } from '@/utils/dev-logger';
import { advancedOCRService } from './advanced-ocr-service';
import { parseService } from './parse-service';
import { 
  ProcessedDocument, 
  ProcessingOptions, 
  MultiFormatProcessingResult, 
  DocumentClassification,
  ClassificationResult
} from './types';

// Export the ProcessedDocument type
export type { ProcessedDocument };

// Mock classification service for now
const classifyDocument = async (content: string): Promise<ClassificationResult> => {
  // Basic classification logic based on content patterns
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('invoice') || lowerContent.includes('bill')) {
    return {
      type: 'invoice',
      confidence: 0.8,
      suggestedMapping: { 'amount': 'total', 'date': 'invoice_date' },
      category: 'financial',
      metadata: {}
    };
  } else if (lowerContent.includes('owner') || lowerContent.includes('resident')) {
    return {
      type: 'owner_list',
      confidence: 0.7,
      suggestedMapping: { 'name': 'owner_name', 'email': 'owner_email' },
      category: 'residents',
      metadata: {}
    };
  } else if (lowerContent.includes('property') || lowerContent.includes('address')) {
    return {
      type: 'property_list',
      confidence: 0.9,
      suggestedMapping: { 'address': 'property_address', 'unit': 'unit_number' },
      category: 'properties',
      metadata: {}
    };
  }
  
  return {
    type: 'unknown',
    confidence: 0.5,
    suggestedMapping: {},
    category: 'general',
    metadata: {}
  };
};

export const multiFormatProcessor = {
  async processWithEnhancedAnalysis(files: File[], options: ProcessingOptions = {}): Promise<MultiFormatProcessingResult> {
    const startTime = Date.now();
    const processedDocuments: ProcessedDocument[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    devLog.info('Starting enhanced multi-format processing:', files.length, 'files');

    for (const file of files) {
      try {
        const processedDoc = await this.processFile(file, options);
        processedDocuments.push(processedDoc);
        
        // Add quality-based recommendations
        if (processedDoc.metadata.confidence && processedDoc.metadata.confidence < 0.7) {
          recommendations.push(`Consider manual review for ${file.name} due to low confidence`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to process ${file.name}: ${errorMessage}`);
        devLog.error('File processing failed:', error);
      }
    }

    const result: MultiFormatProcessingResult = {
      success: processedDocuments.length > 0,
      processedDocuments,
      duplicateResults: {},
      qualityResults: {},
      recommendations,
      errors,
      warnings,
      processingStats: {
        totalFiles: files.length,
        successfulFiles: processedDocuments.length,
        failedFiles: files.length - processedDocuments.length,
        totalProcessingTime: Date.now() - startTime
      }
    };

    devLog.info('Enhanced processing completed:', result.processingStats);
    return result;
  },

  async processFile(file: File, options: ProcessingOptions = {}): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      let processedDoc: ProcessedDocument;
      
      // Determine processing method based on file type
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        processedDoc = await this.processPDF(file, options);
      } else if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
        processedDoc = await this.processImage(file, options);
      } else if (fileType.includes('csv') || fileName.endsWith('.csv')) {
        processedDoc = await this.processCSV(file, options);
      } else if (fileType.includes('excel') || fileName.match(/\.(xlsx|xls)$/)) {
        processedDoc = await this.processExcel(file, options);
      } else {
        // Fallback to OCR for unknown file types
        processedDoc = await this.processWithOCR(file, options);
      }
      
      // Apply document classification if enabled
      if (options.classifyDocument && processedDoc.content) {
        const classification = await classifyDocument(processedDoc.content);
        processedDoc.classification = {
          type: classification.type,
          confidence: classification.confidence,
          suggestedMapping: classification.suggestedMapping || {},
          category: classification.category,
          metadata: classification.metadata || {}
        };
      }
      
      // Add processing time
      processedDoc.metadata.processingTime = Date.now() - startTime;
      
      return processedDoc;
    } catch (error) {
      devLog.error('File processing failed:', error);
      throw new Error(`Processing failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processPDF(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    try {
      const pdfResult = await advancedOCRService.extractFromPDF(file);
      
      return {
        filename: file.name,
        data: [],
        format: 'pdf',
        content: pdfResult.text,
        metadata: {
          processingMethod: 'pdf-parse',
          extractionMethod: 'pdf-text-extraction',
          confidence: 0.9,
          qualityScore: 90,
          tables: 0,
          forms: 0,
          processingTime: 0,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          pageCount: pdfResult.pages.length
        },
        extractedData: { text: pdfResult.text },
        ocr: {
          text: pdfResult.text,
          confidence: 0.9,
          pages: pdfResult.pages
        }
      };
    } catch (error) {
      // Fallback to OCR if PDF parsing fails
      return this.processWithOCR(file, options);
    }
  },

  async processImage(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    return advancedOCRService.processDocumentWithOCR(file, options.ocrOptions);
  },

  async processCSV(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    try {
      const text = await file.text();
      const parsedData = parseService.parseCSV(text);
      
      return {
        filename: file.name,
        data: parsedData,
        format: 'csv',
        content: text,
        metadata: {
          processingMethod: 'csv-parse',
          extractionMethod: 'direct-parse',
          confidence: 1.0,
          qualityScore: 100,
          tables: 1,
          forms: 0,
          processingTime: 0,
          originalName: file.name,
          mimeType: file.type,
          size: file.size
        },
        extractedData: { headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : [] }
      };
    } catch (error) {
      throw new Error(`CSV processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processExcel(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsedResult = parseService.parseExcel(arrayBuffer);
      
      return {
        filename: file.name,
        data: parsedResult.data,
        format: 'excel',
        content: JSON.stringify(parsedResult.data),
        metadata: {
          processingMethod: 'excel-parse',
          extractionMethod: 'direct-parse',
          confidence: 1.0,
          qualityScore: 100,
          tables: 1,
          forms: 0,
          processingTime: 0,
          originalName: file.name,
          mimeType: file.type,
          size: file.size
        },
        extractedData: { headers: parsedResult.headers }
      };
    } catch (error) {
      throw new Error(`Excel processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processWithOCR(file: File, options: ProcessingOptions): Promise<ProcessedDocument> {
    return advancedOCRService.processDocumentWithOCR(file, options.ocrOptions);
  }
};
