
import JSZip from 'jszip';
import { enhancedValidationService } from './enhanced-validation-service';
import { enhancedExcelProcessor } from './enhanced-excel-processor';
import { multiFormatProcessor } from './multi-format-processor';
import { SmartImportResult } from '@/types/import-types';
import { devLog } from '@/utils/dev-logger';
import { ZipFileEntry } from './types';

export interface SmartImportOptions {
  associationId: string;
  autoImportThreshold?: number;
  skipValidation?: boolean;
  enableOCR?: boolean;
  enableDuplicateDetection?: boolean;
}

class SmartImportService {
  async processZipFile(zipFile: File, options: SmartImportOptions): Promise<SmartImportResult> {
    try {
      devLog.info('Starting smart ZIP import:', zipFile.name);
      
      const result: SmartImportResult = {
        success: false,
        totalFiles: 0,
        processedFiles: 0,
        skippedFiles: 0,
        totalRecords: 0,
        importedRecords: 0,
        totalProcessed: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [],
        warnings: [],
        details: []
      };

      // Extract ZIP contents
      const zipContents = await this.extractZipContents(zipFile);
      result.totalFiles = zipContents.length;
      
      if (zipContents.length === 0) {
        result.errors.push('ZIP file contains no processable files');
        return result;
      }

      // Process each file
      for (const entry of zipContents) {
        try {
          const fileResult = await this.processZipEntry(entry, options);
          
          if (fileResult.success) {
            result.processedFiles++;
            result.importedRecords += fileResult.recordsProcessed || 0;
            result.details.push({
              filename: entry.filename,
              status: 'success',
              recordsProcessed: fileResult.recordsProcessed || 0,
              message: `Successfully processed ${fileResult.recordsProcessed || 0} records`
            });
          } else {
            result.skippedFiles++;
            result.errors.push(...(fileResult.errors || []));
            result.details.push({
              filename: entry.filename,
              status: 'error',
              recordsProcessed: 0,
              message: fileResult.errors?.join(', ') || 'Processing failed'
            });
          }
        } catch (error) {
          result.skippedFiles++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
          result.errors.push(`Error processing ${entry.filename}: ${errorMessage}`);
          
          result.details.push({
            filename: entry.filename,
            status: 'error',
            recordsProcessed: 0,
            message: errorMessage
          });
        }
      }

      // Update totals
      result.totalProcessed = result.importedRecords;
      result.successfulImports = result.importedRecords;
      result.failedImports = result.totalFiles - result.processedFiles;
      result.success = result.processedFiles > 0 && result.errors.length === 0;

      // Add aggregate processing errors and warnings
      const allProcessingErrors = zipContents
        .filter(entry => entry.processingErrors && entry.processingErrors.length > 0)
        .flatMap(entry => entry.processingErrors || []);
      
      const allProcessingWarnings = zipContents
        .filter(entry => entry.processingWarnings && entry.processingWarnings.length > 0)
        .flatMap(entry => entry.processingWarnings || []);

      result.errors.push(...allProcessingErrors);
      result.warnings.push(...allProcessingWarnings);

      devLog.info('Smart import completed:', result);
      return result;

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
        totalProcessed: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [errorMessage],
        warnings: [],
        details: []
      };
    }
  }

  private async extractZipContents(zipFile: File): Promise<ZipFileEntry[]> {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile);
    const entries: ZipFileEntry[] = [];

    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
      if (!zipEntry.dir && this.isProcessableFile(filename)) {
        try {
          const data = await zipEntry.async('uint8array');
          entries.push({
            filename,
            data,
            isDirectory: false,
            processingErrors: [],
            processingWarnings: []
          });
        } catch (error) {
          devLog.warn(`Failed to extract ${filename}:`, error);
        }
      }
    }

    return entries;
  }

  private isProcessableFile(filename: string): boolean {
    const supportedExtensions = ['.xlsx', '.xls', '.csv', '.txt', '.pdf'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return supportedExtensions.includes(extension);
  }

  private async processZipEntry(entry: ZipFileEntry, options: SmartImportOptions) {
    try {
      // Convert Uint8Array to File for processing
      const file = new File([entry.data], entry.filename);
      
      // Determine file type and process accordingly
      if (entry.filename.toLowerCase().endsWith('.xlsx') || entry.filename.toLowerCase().endsWith('.xls')) {
        return await this.processExcelFile(file, entry, options);
      } else if (entry.filename.toLowerCase().endsWith('.csv')) {
        return await this.processCSVFile(file, entry, options);
      } else {
        // Try multi-format processor for other types
        return await this.processWithMultiFormat(file, entry, options);
      }
    } catch (error) {
      devLog.error(`Error processing ${entry.filename}:`, error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Processing failed'],
        recordsProcessed: 0
      };
    }
  }

  private async processExcelFile(file: File, entry: ZipFileEntry, options: SmartImportOptions) {
    try {
      // Use enhanced Excel processor
      const processingResult = await enhancedExcelProcessor.processExcelFile(file);
      
      if (!processingResult.success) {
        entry.processingErrors?.push(...processingResult.errors);
        entry.processingWarnings?.push(...processingResult.warnings);
        return {
          success: false,
          errors: processingResult.errors,
          warnings: processingResult.warnings,
          recordsProcessed: 0
        };
      }

      // Validate the processed data
      const validationResult = await enhancedValidationService.validateWithDetailedFeedback(
        processingResult.data,
        'properties', // Default type, could be made configurable
        options.associationId
      );

      if (!validationResult.isValid) {
        entry.processingErrors?.push(...validationResult.errors);
        entry.processingWarnings?.push(...validationResult.warnings);
        
        return {
          success: false,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          recordsProcessed: processingResult.data.length,
          validationSuggestions: validationResult.suggestions
        };
      }

      return {
        success: true,
        recordsProcessed: processingResult.data.length,
        data: processingResult.data,
        warnings: [...processingResult.warnings, ...validationResult.warnings]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Excel processing failed';
      entry.processingErrors?.push(errorMessage);
      
      return {
        success: false,
        errors: [errorMessage],
        recordsProcessed: 0
      };
    }
  }

  private async processCSVFile(file: File, entry: ZipFileEntry, options: SmartImportOptions) {
    try {
      // Basic CSV processing (can be enhanced)
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        const error = 'CSV file must contain at least a header row and one data row';
        entry.processingErrors?.push(error);
        return {
          success: false,
          errors: [error],
          recordsProcessed: 0
        };
      }

      return {
        success: true,
        recordsProcessed: lines.length - 1, // Excluding header
        data: lines
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'CSV processing failed';
      entry.processingErrors?.push(errorMessage);
      
      return {
        success: false,
        errors: [errorMessage],
        recordsProcessed: 0
      };
    }
  }

  private async processWithMultiFormat(file: File, entry: ZipFileEntry, options: SmartImportOptions) {
    try {
      // Use multi-format processor for other file types
      const result = await multiFormatProcessor.processWithEnhancedAnalysis([file], {
        enableOCR: options.enableOCR || false,
        enableDuplicateDetection: options.enableDuplicateDetection || false,
        enableQualityAssessment: true,
        enableAutoFix: true,
        fallbackToOCR: true
      });

      if (result.processingStats.successfulFiles === 0) {
        const error = 'Failed to process file with multi-format processor';
        entry.processingErrors?.push(error);
        return {
          success: false,
          errors: [error],
          recordsProcessed: 0
        };
      }

      const processedDoc = result.processedDocuments[0];
      return {
        success: true,
        recordsProcessed: processedDoc?.data?.length || 0,
        data: processedDoc?.data || []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Multi-format processing failed';
      entry.processingErrors?.push(errorMessage);
      
      return {
        success: false,
        errors: [errorMessage],
        recordsProcessed: 0
      };
    }
  }
}

export const smartImportService = new SmartImportService();
export type { SmartImportOptions };
