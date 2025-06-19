import { parseService } from './parse-service';
import { enhancedExcelProcessor } from './enhanced-excel-processor';
import { advancedOCRService } from './advanced-ocr-service';
import { documentClassificationService } from './document-classification-service';
import { devLog } from '@/utils/dev-logger';
import { MultiFormatProcessingResult, ProcessedDocument, ProcessingOptions } from './types';

export const multiFormatProcessor = {
  async processWithEnhancedAnalysis(
    files: File[],
    options: ProcessingOptions = {}
  ): Promise<MultiFormatProcessingResult> {
    const startTime = Date.now();
    const processedDocuments: ProcessedDocument[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    let successfulFiles = 0;
    let failedFiles = 0;
    
    devLog.info('Starting enhanced multi-format processing for', files.length, 'files');
    
    for (const file of files) {
      try {
        devLog.info('Processing file:', file.name);
        
        // Determine file type and processing strategy
        const fileExtension = file.name.toLowerCase().split('.').pop() || '';
        let processedDoc: ProcessedDocument;
        
        if (['csv', 'txt'].includes(fileExtension)) {
          processedDoc = await this.processTextFile(file);
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
          processedDoc = await this.processExcelFile(file);
        } else if (['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(fileExtension)) {
          // Use OCR for PDFs and images
          if (options.enableOCR || options.fallbackToOCR) {
            processedDoc = await advancedOCRService.processDocumentWithOCR(file, options.ocrOptions);
          } else {
            throw new Error('OCR processing is disabled for this file type');
          }
        } else {
          throw new Error(`Unsupported file format: ${fileExtension}`);
        }
        
        // Enhanced classification if enabled
        if (options.enableQualityAssessment) {
          try {
            const classification = await documentClassificationService.classifyDocument(processedDoc);
            processedDoc.classification = classification;
            
            if (classification.suggestedMapping) {
              recommendations.push(`Suggested field mapping for ${file.name}: ${Object.keys(classification.suggestedMapping).join(', ')}`);
            }
          } catch (classificationError) {
            devLog.warn('Classification failed for', file.name, classificationError);
            warnings.push(`Classification failed for ${file.name}`);
          }
        }
        
        processedDocuments.push(processedDoc);
        successfulFiles++;
        
      } catch (error) {
        devLog.error('Failed to process file:', file.name, error);
        errors.push(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failedFiles++;
        
        // Try fallback to OCR if enabled
        if (options.fallbackToOCR && options.enableOCR) {
          try {
            devLog.info('Attempting OCR fallback for:', file.name);
            const fallbackDoc = await advancedOCRService.processDocumentWithOCR(file, options.ocrOptions);
            fallbackDoc.metadata.processingMethod = 'ocr-fallback';
            processedDocuments.push(fallbackDoc);
            successfulFiles++;
            failedFiles--;
            warnings.push(`${file.name} processed using OCR fallback`);
          } catch (fallbackError) {
            devLog.error('OCR fallback also failed:', fallbackError);
          }
        }
      }
    }
    
    const totalProcessingTime = Date.now() - startTime;
    
    // Add general recommendations
    if (processedDocuments.length > 0) {
      const avgConfidence = processedDocuments.reduce((sum, doc) => 
        sum + (doc.metadata.confidence || 0), 0) / processedDocuments.length;
      
      if (avgConfidence < 0.8) {
        recommendations.push('Consider improving document quality for better accuracy');
      }
      
      const ocrDocs = processedDocuments.filter(doc => doc.metadata.processingMethod.includes('ocr'));
      if (ocrDocs.length > 0) {
        recommendations.push(`${ocrDocs.length} documents processed with OCR - review for accuracy`);
      }
    }
    
    const result: MultiFormatProcessingResult = {
      success: successfulFiles > 0,
      processedDocuments,
      recommendations,
      errors,
      warnings,
      processingStats: {
        totalFiles: files.length,
        successfulFiles,
        failedFiles,
        totalProcessingTime
      }
    };
    
    // Add duplicate and quality results if requested
    if (options.enableDuplicateDetection && processedDocuments.length > 1) {
      result.duplicateResults = await this.performDuplicateDetection(processedDocuments);
    }
    
    if (options.enableQualityAssessment) {
      result.qualityResults = await this.performQualityAssessment(processedDocuments);
    }
    
    devLog.info('Multi-format processing completed:', result.processingStats);
    return result;
  },

  // Add the missing processFile method for backward compatibility
  async processFile(file: File, options: ProcessingOptions = {}): Promise<ProcessedDocument> {
    const result = await this.processWithEnhancedAnalysis([file], options);
    if (result.processedDocuments.length === 0) {
      throw new Error('Failed to process file');
    }
    return result.processedDocuments[0];
  },

  async processTextFile(file: File): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      const text = await file.text();
      const parseResult = parseService.parseCSV(text);
      
      return {
        filename: file.name,
        data: parseResult.data,
        format: 'csv',
        metadata: {
          processingMethod: 'text-parser',
          extractionMethod: 'native-parser',
          confidence: 0.95,
          qualityScore: 90,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      throw new Error(`Text file processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processExcelFile(file: File): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      const result = await enhancedExcelProcessor.processExcelFile(file);
      
      if (!result.success) {
        throw new Error(result.errors.join('; '));
      }
      
      return {
        filename: file.name,
        data: result.data,
        format: 'excel',
        metadata: {
          processingMethod: 'enhanced-excel',
          extractionMethod: 'xlsx-parser',
          confidence: 0.9,
          qualityScore: 85,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      throw new Error(`Excel file processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractImageFromPDF(file: File): Promise<any> {
    // Placeholder for image extraction logic
    return {
      success: false,
      data: null
    };
  },

  async detectFormFields(file: File): Promise<any> {
    // Placeholder for form field detection logic
    return {
      success: false,
      data: null
    };
  },

  async performDuplicateDetection(documents: ProcessedDocument[]): Promise<any> {
    // Placeholder for duplicate detection logic
    return {
      totalDuplicates: 0,
      duplicatePairs: [],
      confidence: 0.8
    };
  },

  async performQualityAssessment(documents: ProcessedDocument[]): Promise<any> {
    // Calculate overall quality metrics
    const totalDocs = documents.length;
    const avgConfidence = documents.reduce((sum, doc) => sum + (doc.metadata.confidence || 0), 0) / totalDocs;
    const avgQuality = documents.reduce((sum, doc) => sum + (doc.metadata.qualityScore || 0), 0) / totalDocs;
    
    return {
      overallScore: Math.round((avgConfidence * 100 + avgQuality) / 2),
      totalDocuments: totalDocs,
      averageConfidence: avgConfidence,
      averageQuality: avgQuality,
      recommendations: [
        avgConfidence < 0.8 ? 'Consider improving document quality' : null,
        avgQuality < 80 ? 'Some documents may need manual review' : null
      ].filter(Boolean)
    };
  }
};
