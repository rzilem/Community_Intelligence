
import { devLog } from '@/utils/dev-logger';
import { processorFactory } from './processors/processor-factory';
import { documentClassificationService } from './services/document-classification-service';
import { enhancedMultiFormatProcessor } from './enhanced-multi-format-processor';
import { 
  ProcessedDocument, 
  ProcessingOptions, 
  MultiFormatProcessingResult, 
  EnhancedProcessingOptions
} from './types';

export type { ProcessedDocument };

export const multiFormatProcessor = {
  async processWithAddressIntelligence(files: File[], options: EnhancedProcessingOptions = {}) {
    return enhancedMultiFormatProcessor.processWithAddressIntelligence(files, options);
  },

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
      const processor = processorFactory.getProcessor(file);
      const processedDoc = await processor.process(file, options);
      
      if (options.classifyDocument && processedDoc.content) {
        const classification = await documentClassificationService.classifyDocument(processedDoc.content);
        processedDoc.classification = {
          type: classification.type,
          confidence: classification.confidence,
          suggestedMapping: classification.suggestedMapping || {},
          category: classification.category,
          metadata: classification.metadata || {}
        };
      }
      
      processedDoc.metadata.processingTime = Date.now() - startTime;
      return processedDoc;
      
    } catch (error) {
      devLog.error('File processing failed:', error);
      throw new Error(`Processing failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
