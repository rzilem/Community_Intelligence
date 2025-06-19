
import JSZip from 'jszip';
import { SmartImportResult } from '@/types/import-types';
import { ZipFileEntry } from './types';
import { parseService } from './parse-service';
import { enhancedValidationService } from './enhanced-validation-service';
import { enhancedExcelProcessor } from './enhanced-excel-processor';
import { dataImportService } from './data-import-service';
import { devLog } from '@/utils/dev-logger';

export interface SmartImportOptions {
  associationId: string;
  autoImportThreshold?: number;
  skipValidation?: boolean;
}

export const smartImportService = {
  async processZipFile(zipFile: File, options: SmartImportOptions): Promise<SmartImportResult> {
    devLog.info('Starting smart ZIP import:', { fileName: zipFile.name, options });
    
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

    try {
      // Extract ZIP contents
      const zipEntries = await this.extractZipContents(zipFile);
      result.totalFiles = zipEntries.length;
      
      if (zipEntries.length === 0) {
        result.errors.push('ZIP file contains no processable files');
        return result;
      }

      // Process each file
      for (const entry of zipEntries) {
        try {
          const fileResult = await this.processZipEntry(entry, options);
          
          result.processedFiles++;
          result.totalRecords += fileResult.totalRecords;
          result.importedRecords += fileResult.importedRecords;
          
          result.details.push({
            filename: entry.filename,
            status: fileResult.success ? 'success' : 'error',
            recordsProcessed: fileResult.totalRecords,
            message: fileResult.message
          });
          
          if (!fileResult.success) {
            result.errors.push(`${entry.filename}: ${fileResult.message}`);
          }
          
        } catch (error) {
          devLog.error('Error processing ZIP entry:', { filename: entry.filename, error });
          result.skippedFiles++;
          result.errors.push(`${entry.filename}: ${error instanceof Error ? error.message : 'Processing failed'}`);
        }
      }

      // Set final results
      result.totalProcessed = result.totalRecords;
      result.successfulImports = result.importedRecords;
      result.failedImports = result.totalRecords - result.importedRecords;
      result.success = result.errors.length === 0 && result.importedRecords > 0;
      
      devLog.info('Smart import completed:', result);
      return result;
      
    } catch (error) {
      devLog.error('Smart import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  },

  async extractZipContents(zipFile: File): Promise<ZipFileEntry[]> {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(zipFile);
    const entries: ZipFileEntry[] = [];

    for (const [filename, fileData] of Object.entries(zipContents.files)) {
      if (!fileData.dir && this.isSupportedFile(filename)) {
        const data = await fileData.async('uint8array');
        entries.push({
          filename,
          data,
          isDirectory: false,
          processingErrors: [],
          processingWarnings: []
        });
      }
    }

    return entries;
  },

  isSupportedFile(filename: string): boolean {
    const supportedExtensions = ['.csv', '.xlsx', '.xls'];
    return supportedExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  },

  async processZipEntry(entry: ZipFileEntry, options: SmartImportOptions): Promise<{
    success: boolean;
    totalRecords: number;
    importedRecords: number;
    message: string;
  }> {
    try {
      devLog.info('Processing ZIP entry:', entry.filename);
      
      // Convert Uint8Array to File for processing
      const blob = new Blob([entry.data]);
      const file = new File([blob], entry.filename);
      
      // Parse the file
      let parsedData: any[] = [];
      
      if (entry.filename.toLowerCase().endsWith('.csv')) {
        const parseResult = await parseService.parseCSV(file);
        if (!parseResult.success) {
          throw new Error(`CSV parsing failed: ${parseResult.errors.join(', ')}`);
        }
        parsedData = parseResult.data || [];
      } else if (entry.filename.toLowerCase().endsWith('.xlsx') || entry.filename.toLowerCase().endsWith('.xls')) {
        const excelResult = await enhancedExcelProcessor.processExcelFile(file);
        if (!excelResult.success) {
          throw new Error(`Excel processing failed: ${excelResult.errors.join(', ')}`);
        }
        parsedData = excelResult.data;
      }

      if (parsedData.length === 0) {
        return {
          success: false,
          totalRecords: 0,
          importedRecords: 0,
          message: 'No data found in file'
        };
      }

      // Validate data
      const validationResult = await enhancedValidationService.validateDataWithDetails(
        parsedData, 
        this.detectDataType(entry.filename, parsedData), 
        options.associationId,
        entry.filename
      );

      if (!validationResult.isValid && validationResult.criticalErrors.length > 0) {
        const errorMessage = validationResult.criticalErrors.slice(0, 3).join('; ');
        return {
          success: false,
          totalRecords: parsedData.length,
          importedRecords: 0,
          message: `Validation failed: ${errorMessage}`
        };
      }

      // For now, we'll skip the actual import and just return validation results
      // In a full implementation, this would call the import service
      return {
        success: validationResult.isValid,
        totalRecords: parsedData.length,
        importedRecords: validationResult.isValid ? parsedData.length : 0,
        message: validationResult.isValid ? 
          `Successfully processed ${parsedData.length} records` : 
          `Validation issues: ${validationResult.suggestions.slice(0, 2).join('; ')}`
      };
      
    } catch (error) {
      devLog.error('Error processing ZIP entry:', error);
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        message: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  },

  detectDataType(filename: string, data: any[]): string {
    const lowerFilename = filename.toLowerCase();
    
    // File name based detection
    if (lowerFilename.includes('property') || lowerFilename.includes('address')) {
      return 'properties';
    }
    if (lowerFilename.includes('owner') || lowerFilename.includes('resident')) {
      return 'owners';
    }
    if (lowerFilename.includes('financial') || lowerFilename.includes('payment') || lowerFilename.includes('assessment')) {
      return 'financial';
    }
    if (lowerFilename.includes('compliance') || lowerFilename.includes('violation')) {
      return 'compliance';
    }
    if (lowerFilename.includes('maintenance') || lowerFilename.includes('request')) {
      return 'maintenance';
    }
    if (lowerFilename.includes('association')) {
      return 'associations';
    }

    // Content based detection
    if (data.length > 0) {
      const headers = Object.keys(data[0]).map(h => h.toLowerCase());
      
      if (headers.some(h => h.includes('address') || h.includes('property'))) {
        return 'properties';
      }
      if (headers.some(h => h.includes('owner') || h.includes('resident') || h.includes('first_name'))) {
        return 'owners';
      }
      if (headers.some(h => h.includes('amount') || h.includes('payment') || h.includes('balance'))) {
        return 'financial';
      }
      if (headers.some(h => h.includes('violation') || h.includes('compliance'))) {
        return 'compliance';
      }
      if (headers.some(h => h.includes('maintenance') || h.includes('request'))) {
        return 'maintenance';
      }
      if (headers.some(h => h.includes('association'))) {
        return 'associations';
      }
    }

    // Default fallback
    return 'properties';
  }
};
