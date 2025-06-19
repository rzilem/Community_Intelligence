import { ZipFileEntry, SmartImportOptions, ProcessingOptions, ProcessedDocument, DetailedValidationResult } from './types';
import { multiFormatProcessor } from './multi-format-processor';
import { parseService } from './parse-service';
import { importService } from './import-service';
import { devLog } from '@/utils/dev-logger';
import { SmartImportResult } from '@/types/import-types';
import JSZip from 'jszip';

export const smartImportService = {
  async processZipFile(zipFile: File, options: SmartImportOptions): Promise<SmartImportResult> {
    const startTime = Date.now();
    devLog.info('Starting smart import process for ZIP file:', zipFile.name);
    
    try {
      // Step 1: Extract ZIP contents
      const zipEntries = await this.extractZipContents(zipFile);
      devLog.info('Extracted ZIP contents:', zipEntries.length, 'files');
      
      // Step 2: Process files with enhanced analysis
      const processingOptions: ProcessingOptions = {
        enableOCR: true,
        enableDuplicateDetection: true,
        enableQualityAssessment: true,
        enableAutoFix: true,
        fallbackToOCR: true,
        validateData: true,
        extractStructured: true,
        classifyDocument: true,
        // Remove processingQuality as it's not in ProcessingOptions
        includeMetadata: true
      };
      
      const files = zipEntries
        .filter(entry => !entry.isDirectory)
        .map(entry => new File([entry.data], entry.filename));
      
      const processingResult = await multiFormatProcessor.processWithEnhancedAnalysis(files, processingOptions);
      
      // Step 3: Smart validation and mapping
      let totalImported = 0;
      let totalFailed = 0;
      const details: Array<{
        filename?: string;
        status: 'success' | 'error' | 'skipped' | 'warning';
        recordsProcessed: number;
        message: string;
      }> = [];
      
      for (const processedDoc of processingResult.processedDocuments) {
        try {
          // Validate the processed data
          const validationResult = await this.validateProcessedDocument(processedDoc);
          
          // Check confidence threshold
          const confidence = validationResult.score || 0; // Use score property
          
          if (confidence >= (options.autoImportThreshold || 0.85)) {
            // Auto-import with high confidence
            const importResult = await this.autoImportDocument(processedDoc, options.associationId);
            totalImported += importResult.recordsImported;
            
            details.push({
              filename: processedDoc.filename,
              status: 'success',
              recordsProcessed: importResult.recordsImported,
              message: `Auto-imported ${importResult.recordsImported} records with ${Math.round(confidence * 100)}% confidence`
            });
          } else {
            // Flag for manual review
            details.push({
              filename: processedDoc.filename,
              status: 'warning',
              recordsProcessed: 0,
              message: `Flagged for manual review - confidence ${Math.round(confidence * 100)}% below threshold`
            });
          }
        } catch (error) {
          totalFailed++;
          details.push({
            filename: processedDoc.filename,
            status: 'error',
            recordsProcessed: 0,
            message: error instanceof Error ? error.message : 'Unknown processing error'
          });
        }
      }
      
      const result: SmartImportResult = {
        success: totalImported > 0 || processingResult.processedDocuments.length > 0,
        totalFiles: files.length,
        processedFiles: processingResult.processedDocuments.length,
        skippedFiles: files.length - processingResult.processedDocuments.length,
        totalRecords: processingResult.processedDocuments.reduce((sum, doc) => sum + doc.data.length, 0),
        importedRecords: totalImported,
        totalProcessed: processingResult.processedDocuments.length,
        successfulImports: totalImported,
        failedImports: totalFailed,
        errors: processingResult.errors,
        warnings: processingResult.warnings,
        details
      };
      
      if (result.successfulImports === 0 && result.processedFiles > 0) {
        result.warnings.push('Manual review required - confidence below threshold');
      }
      
      devLog.info('Smart import completed:', {
        totalFiles: result.totalFiles,
        imported: result.importedRecords,
        processingTime: Date.now() - startTime
      });
      
      return result;
    } catch (error) {
      devLog.error('Smart import failed:', error);
      throw new Error(`Smart import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractZipContents(zipFile: File): Promise<ZipFileEntry[]> {
    try {
      const zip = await JSZip.loadAsync(zipFile);
      const entries: ZipFileEntry[] = [];
      
      zip.forEach((relativePath, zipEntry) => {
        const isDirectory = zipEntry.dir;
        
        if (!isDirectory) {
          entries.push({
            filename: relativePath,
            data: null, // Initialize as null, will be populated later
            isDirectory: false
          });
        } else {
          entries.push({
            filename: relativePath,
            data: new Uint8Array(), // Empty array for directories
            isDirectory: true
          });
        }
      });
      
      // Load data for file entries
      for (const entry of entries) {
        if (!entry.isDirectory) {
          const zipEntry = zip.file(entry.filename);
          if (zipEntry) {
            const data = await zipEntry.async("uint8array");
            entry.data = data;
          } else {
            entry.processingErrors = ['Could not read file from zip'];
          }
        }
      }
      
      return entries;
    } catch (error) {
      devLog.error('Error extracting zip contents:', error);
      throw new Error(`Error extracting zip contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async validateProcessedDocument(doc: ProcessedDocument): Promise<DetailedValidationResult> {
    try {
      // Basic validation logic
      const totalRows = doc.data.length;
      let validRows = 0;
      const issues: Array<{
        row: number;
        field: string;
        issue: string;
        severity: 'error' | 'warning';
      }> = [];
      
      // Validate each row
      doc.data.forEach((row, index) => {
        if (row && typeof row === 'object') {
          const keys = Object.keys(row);
          if (keys.length > 0) {
            validRows++;
          } else {
            issues.push({
              row: index + 1,
              field: 'general',
              issue: 'Empty row detected',
              severity: 'warning'
            });
          }
        } else {
          issues.push({
            row: index + 1,
            field: 'general',
            issue: 'Invalid row format',
            severity: 'error'
          });
        }
      });
      
      const score = totalRows > 0 ? validRows / totalRows : 0;
      
      return {
        valid: score > 0.5,
        score: score, // Ensure score property exists
        totalRows,
        validRows,
        invalidRows: totalRows - validRows,
        warnings: issues.filter(i => i.severity === 'warning').length,
        issues,
        qualityMetrics: {
          completeness: score,
          consistency: 0.8, // Placeholder
          accuracy: 0.9 // Placeholder
        }
      };
    } catch (error) {
      devLog.error('Document validation failed:', error);
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async autoImportDocument(doc: ProcessedDocument, associationId: string): Promise<{ recordsImported: number }> {
    try {
      // Auto-detect import type based on document classification
      const importType = this.detectImportType(doc);
      
      // Create smart field mappings
      const mappings = this.createSmartMappings(doc, importType);
      
      // Import the data
      const importResult = await importService.importData({
        associationId,
        dataType: importType,
        data: doc.data,
        mappings
      });
      
      return {
        recordsImported: importResult.successfulImports
      };
    } catch (error) {
      devLog.error('Auto-import failed:', error);
      throw new Error(`Auto-import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  detectImportType(doc: ProcessedDocument): string {
    // Implement logic to detect import type based on document classification
    // This is a placeholder, replace with actual logic
    if (doc.classification?.type === 'owner_list') {
      return 'homeowners';
    } else if (doc.classification?.type === 'property_list') {
      return 'properties';
    } else if (doc.classification?.type === 'invoice') {
      return 'invoices';
    }
    return 'unknown';
  },

  createSmartMappings(doc: ProcessedDocument, importType: string): Record<string, string> {
    // Implement logic to create smart field mappings based on document classification
    // This is a placeholder, replace with actual logic
    const mappings: Record<string, string> = {};
    
    if (importType === 'homeowners') {
      mappings['name'] = 'owner_name';
      mappings['email'] = 'owner_email';
    } else if (importType === 'properties') {
      mappings['address'] = 'property_address';
      mappings['unit'] = 'unit_number';
    } else if (importType === 'invoices') {
      mappings['invoice_number'] = 'invoice_id';
      mappings['amount'] = 'invoice_amount';
    }
    
    return mappings;
  }
};
