
import { zipParserService, ZipAnalysisResult } from './zip-parser-service';
import { aiContentAnalyzer, BatchAnalysisResult } from './ai-content-analyzer';
import { dataImportService } from './data-import-service';
import { validationService } from './validation-service';
import { devLog } from '@/utils/dev-logger';
import { toast } from 'sonner';

export interface SmartImportOptions {
  associationId: string;
  userId?: string;
  autoImportThreshold?: number; // Confidence threshold for auto-import
  skipValidation?: boolean;
}

export interface SmartImportResult {
  success: boolean;
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  totalRecords: number;
  importedRecords: number;
  errors: string[];
  warnings: string[];
  details: Array<{
    filename: string;
    status: 'success' | 'error' | 'skipped';
    recordsProcessed: number;
    message: string;
  }>;
}

export const smartImportService = {
  async processZipFile(
    zipFile: File, 
    options: SmartImportOptions
  ): Promise<SmartImportResult> {
    devLog.info('Starting smart import process for:', zipFile.name);
    
    try {
      // Phase 1: Parse and analyze zip file
      toast.info('Analyzing zip file contents...');
      const zipAnalysis = await zipParserService.parseZipFile(zipFile);
      
      // Phase 2: AI content analysis
      toast.info('AI analyzing file contents and mappings...');
      const aiAnalysis = await aiContentAnalyzer.analyzeBatch(zipAnalysis.files);
      
      // Phase 3: Determine import strategy
      const importStrategy = this.determineImportStrategy(aiAnalysis, options);
      
      if (importStrategy.autoImport) {
        toast.success(`High confidence detected! Auto-importing ${zipAnalysis.files.length} files...`);
        return await this.executeAutoImport(zipAnalysis, aiAnalysis, options);
      } else {
        toast.info('Manual review required for some files');
        return await this.executeManualImport(zipAnalysis, aiAnalysis, options);
      }
      
    } catch (error) {
      devLog.error('Smart import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        totalFiles: 0,
        processedFiles: 0,
        skippedFiles: 0,
        totalRecords: 0,
        importedRecords: 0,
        errors: [errorMessage],
        warnings: [],
        details: []
      };
    }
  },

  private determineImportStrategy(
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

  private async executeAutoImport(
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
      errors: [],
      warnings: [],
      details: []
    };
    
    // Process files in parallel (with concurrency limit)
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
          
          if (fileResult.warnings.length > 0) {
            result.warnings.push(...fileResult.warnings);
          }
          
          result.details.push({
            filename: file.filename,
            status: 'success',
            recordsProcessed: fileResult.recordsImported,
            message: `Successfully imported ${fileResult.recordsImported} records`
          });
        } else {
          result.errors.push(`Error processing ${file.filename}: ${promiseResult.reason}`);
          result.details.push({
            filename: file.filename,
            status: 'error',
            recordsProcessed: 0,
            message: promiseResult.reason
          });
        }
      });
    }
    
    result.success = result.errors.length === 0;
    
    return result;
  },

  private async executeManualImport(
    zipAnalysis: ZipAnalysisResult,
    aiAnalysis: BatchAnalysisResult,
    options: SmartImportOptions
  ): Promise<SmartImportResult> {
    // For manual import, we'll return the analysis results for user review
    // This would typically trigger the mapping modal in the UI
    
    devLog.info('Manual import mode - preparing for user review');
    
    return {
      success: false, // Indicates manual review needed
      totalFiles: zipAnalysis.files.length,
      processedFiles: 0,
      skippedFiles: 0,
      totalRecords: zipAnalysis.totalRecords,
      importedRecords: 0,
      errors: [],
      warnings: ['Manual review required - confidence below threshold'],
      details: zipAnalysis.files.map(file => ({
        filename: file.filename,
        status: 'skipped' as const,
        recordsProcessed: 0,
        message: `Confidence: ${(aiAnalysis.fileAnalyses[file.path]?.confidence * 100).toFixed(1)}%`
      }))
    };
  },

  private async processFileWithAutoImport(
    file: any,
    analysis: any,
    options: SmartImportOptions
  ) {
    const validation = await validationService.validateData(
      file.data, 
      analysis.detectedType, 
      options.associationId
    );
    
    if (!validation.valid && !options.skipValidation) {
      throw new Error(`Validation failed: ${validation.issues.length} issues found`);
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

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};
