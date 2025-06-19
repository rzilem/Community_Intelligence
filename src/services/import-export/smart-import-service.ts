import { zipParserService, ZipAnalysisResult } from './zip-parser-service';
import { aiContentAnalyzer, BatchAnalysisResult } from './ai-content-analyzer';
import { dataImportService } from './data-import-service';
import { enhancedValidationService } from './enhanced-validation-service';
import { enhancedExcelProcessor } from './enhanced-excel-processor';
import { SmartImportResult } from '@/types/import-types';
import { devLog } from '@/utils/dev-logger';
import { toast } from 'sonner';

export interface SmartImportOptions {
  associationId: string;
  userId?: string;
  autoImportThreshold?: number;
  skipValidation?: boolean;
}

export const smartImportService = {
  async processZipFile(
    zipFile: File, 
    options: SmartImportOptions
  ): Promise<SmartImportResult> {
    devLog.info('Starting enhanced smart import process for:', zipFile.name);
    
    try {
      toast.info('Analyzing zip file contents...');
      const zipAnalysis = await zipParserService.parseZipFile(zipFile);
      
      // Enhanced Excel processing for each file
      const processedFiles = await this.preprocessFiles(zipAnalysis.files);
      
      toast.info('AI analyzing file contents and mappings...');
      const aiAnalysis = await aiContentAnalyzer.analyzeBatch(processedFiles);
      
      const importStrategy = this.determineImportStrategy(aiAnalysis, options);
      
      if (importStrategy.autoImport) {
        toast.success(`High confidence detected! Auto-importing ${processedFiles.length} files...`);
        return await this.executeAutoImport({ ...zipAnalysis, files: processedFiles }, aiAnalysis, options);
      } else {
        toast.info('Manual review required for some files');
        return await this.executeManualImport({ ...zipAnalysis, files: processedFiles }, aiAnalysis, options);
      }
      
    } catch (error) {
      devLog.error('Enhanced smart import failed:', error);
      const errorMessage = this.safeErrorMessage(error);
      
      return {
        success: false,
        totalFiles: 0,
        processedFiles: 0,
        skippedFiles: 0,
        totalRecords: 0,
        importedRecords: 0,
        totalProcessed: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [errorMessage],
        warnings: [],
        details: []
      };
    }
  },

  async preprocessFiles(files: any[]): Promise<any[]> {
    const processedFiles = [];
    
    for (const file of files) {
      try {
        if (file.filename.toLowerCase().endsWith('.xlsx') || file.filename.toLowerCase().endsWith('.xls')) {
          devLog.info('Enhanced Excel processing for:', file.filename);
          
          // Create a File object from the data
          const blob = new Blob([new Uint8Array(file.content)], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const excelFile = new File([blob], file.filename);
          
          const excelResult = await enhancedExcelProcessor.processExcelFile(excelFile);
          
          if (excelResult.success && excelResult.data.length > 0) {
            processedFiles.push({
              ...file,
              data: excelResult.data,
              processingMetadata: excelResult.metadata,
              processingWarnings: excelResult.warnings
            });
          } else {
            devLog.warn('Excel processing failed for:', file.filename, excelResult.errors);
            processedFiles.push({
              ...file,
              processingErrors: excelResult.errors,
              processingWarnings: excelResult.warnings
            });
          }
        } else {
          // Keep non-Excel files as-is
          processedFiles.push(file);
        }
      } catch (error) {
        devLog.error('File preprocessing failed:', file.filename, error);
        processedFiles.push({
          ...file,
          processingErrors: [this.safeErrorMessage(error)]
        });
      }
    }
    
    return processedFiles;
  },

  determineImportStrategy(
    aiAnalysis: BatchAnalysisResult, 
    options: SmartImportOptions
  ) {
    const threshold = options.autoImportThreshold || 0.85;
    const autoImport = aiAnalysis.readyForAutoImport && aiAnalysis.overallConfidence >= threshold;
    
    devLog.info('Import strategy determined:', {
      autoImport,
      overallConfidence: aiAnalysis.overallConfidence,
      threshold,
      readyForAutoImport: aiAnalysis.readyForAutoImport
    });
    
    return { autoImport, threshold };
  },

  async executeAutoImport(
    zipAnalysis: ZipAnalysisResult,
    aiAnalysis: BatchAnalysisResult,
    options: SmartImportOptions
  ): Promise<SmartImportResult> {
    const result: SmartImportResult = {
      success: true,
      totalFiles: zipAnalysis.files.length,
      processedFiles: 0,
      skippedFiles: 0,
      totalRecords: zipAnalysis.totalRecords,
      importedRecords: 0,
      totalProcessed: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: [],
      details: []
    };
    
    const concurrencyLimit = 3;
    const fileGroups = this.chunkArray(zipAnalysis.files, concurrencyLimit);
    
    for (const fileGroup of fileGroups) {
      const promises = fileGroup.map(file => 
        this.processFileWithAutoImport(file, aiAnalysis.fileAnalyses[file.path], options)
      );
      
      const groupResults = await Promise.allSettled(promises);
      
      groupResults.forEach((promiseResult, index) => {
        const file = fileGroup[index];
        
        if (promiseResult.status === 'fulfilled') {
          const fileResult = promiseResult.value;
          result.processedFiles++;
          result.importedRecords += fileResult.recordsImported;
          result.successfulImports += fileResult.recordsImported;
          result.totalProcessed += fileResult.recordsImported;
          
          if (fileResult.warnings.length > 0) {
            result.warnings.push(...fileResult.warnings.map(w => this.safeErrorMessage(w)));
          }
          
          result.details.push({
            filename: file.filename,
            status: 'success',
            recordsProcessed: fileResult.recordsImported,
            message: `Successfully imported ${fileResult.recordsImported} records`
          });
        } else {
          const errorMessage = this.safeErrorMessage(promiseResult.reason);
          result.errors.push(`Error processing ${file.filename}: ${errorMessage}`);
          result.failedImports++;
          result.details.push({
            filename: file.filename,
            status: 'error',
            recordsProcessed: 0,
            message: errorMessage
          });
        }
      });
    }
    
    result.success = result.errors.length === 0;
    
    return result;
  },

  async executeManualImport(
    zipAnalysis: ZipAnalysisResult,
    aiAnalysis: BatchAnalysisResult,
    options: SmartImportOptions
  ): Promise<SmartImportResult> {
    devLog.info('Manual import mode - preparing detailed analysis for user review');
    
    const details = await Promise.all(
      zipAnalysis.files.map(async (file) => {
        const analysis = aiAnalysis.fileAnalyses[file.path];
        let message = `Confidence: ${(analysis?.confidence * 100).toFixed(1)}%`;
        
        // Add specific processing issues if any
        if (file.processingErrors?.length > 0) {
          message += ` - Errors: ${file.processingErrors.join(', ')}`;
        }
        if (file.processingWarnings?.length > 0) {
          message += ` - Warnings: ${file.processingWarnings.join(', ')}`;
        }
        
        return {
          filename: file.filename,
          status: 'skipped' as const,
          recordsProcessed: 0,
          message
        };
      })
    );
    
    return {
      success: false,
      totalFiles: zipAnalysis.files.length,
      processedFiles: 0,
      skippedFiles: zipAnalysis.files.length,
      totalRecords: zipAnalysis.totalRecords,
      importedRecords: 0,
      totalProcessed: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: ['Manual review required - confidence below threshold'],
      details
    };
  },

  async processFileWithAutoImport(
    file: any,
    analysis: any,
    options: SmartImportOptions
  ) {
    // Use enhanced validation with detailed feedback
    const validation = await enhancedValidationService.validateDataWithDetails(
      file.data, 
      analysis.detectedType, 
      options.associationId,
      file.filename
    );
    
    if (!validation.valid && !options.skipValidation) {
      const detailedErrors = validation.suggestedFixes.join('; ');
      throw new Error(`Enhanced validation failed: ${detailedErrors}`);
    }
    
    const importResult = await dataImportService.importData({
      associationId: options.associationId,
      dataType: analysis.detectedType,
      data: file.data,
      mappings: analysis.suggestedMappings,
      userId: options.userId
    });
    
    if (!importResult.success) {
      throw new Error(`Import failed: ${importResult.details.map(d => d.message).join(', ')}`);
    }
    
    return {
      recordsImported: importResult.successfulImports,
      warnings: validation.issues.map(issue => issue.issue)
    };
  },

  safeErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error?.message) return error.message;
    return 'Unknown error occurred';
  },

  chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};
