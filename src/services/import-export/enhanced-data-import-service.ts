
import { ImportResult, ImportJob, ImportOptions } from '@/types/import-types';
import { jobService } from './job-service';
import { enhancedProcessorService } from './processors/enhanced-processor-service';
import { templateService } from './template-service';
import { EnhancedErrorHandler } from './enhanced-error-handler';
import { devLog } from '@/utils/dev-logger';

export const enhancedDataImportService = {
  async importData(options: ImportOptions): Promise<ImportResult> {
    const { associationId, dataType, data, mappings, userId } = options;
    
    devLog.info('[EnhancedDataImportService] Starting enhanced data import:', {
      associationId,
      dataType,
      recordCount: data.length,
      userId: userId || 'anonymous'
    });

    try {
      // Validate import options
      if (!associationId) {
        throw new Error('Association ID is required');
      }

      if (!dataType) {
        throw new Error('Data type is required');
      }

      if (!data || data.length === 0) {
        throw new Error('No data provided for import');
      }

      // Create import job with enhanced tracking
      const job = await jobService.createImportJob({
        associationId: associationId,
        importType: dataType,
        fileName: `${dataType}_import_${new Date().toISOString()}`,
        fileSize: JSON.stringify(data).length,
        userId: userId
      });

      if (!job) {
        throw new Error('Failed to create import job - this may indicate a permission issue');
      }

      devLog.info('[EnhancedDataImportService] Import job created:', job.id);

      // Process data with enhanced field mappings
      const processedData = this.applyEnhancedFieldMappings(data, mappings, dataType);
      
      devLog.info('[EnhancedDataImportService] Data mapped successfully:', {
        originalFields: Object.keys(data[0] || {}),
        mappedFields: Object.keys(processedData[0] || {}),
        recordCount: processedData.length
      });

      // Process the import with enhanced error handling
      const result = await enhancedProcessorService.processImportData(
        job.id,
        associationId,
        dataType,
        processedData
      );

      // Return standardized result with enhanced error information
      const importResult: ImportResult = {
        success: result.success,
        totalProcessed: data.length,
        successfulImports: result.successfulImports,
        failedImports: result.failedImports,
        details: result.details.map(detail => ({
          filename: undefined,
          status: detail.status,
          recordsProcessed: this.extractRecordsProcessed(detail.message),
          message: detail.message
        })),
        errors: result.details
          .filter(d => d.status === 'error')
          .map(d => d.message),
        warnings: result.details
          .filter(d => d.status === 'warning')
          .map(d => d.message),
        job_id: job.id
      };

      devLog.info('[EnhancedDataImportService] Import completed:', {
        success: importResult.success,
        totalProcessed: importResult.totalProcessed,
        successfulImports: importResult.successfulImports,
        failedImports: importResult.failedImports
      });

      return importResult;

    } catch (error) {
      const categorizedError = EnhancedErrorHandler.handleError(error, 'Enhanced Data Import');
      devLog.error('[EnhancedDataImportService] Import failed:', categorizedError);
      
      return {
        success: false,
        totalProcessed: data.length,
        successfulImports: 0,
        failedImports: data.length,
        details: [{
          filename: undefined,
          status: 'error' as const,
          recordsProcessed: 0,
          message: `Import failed: ${categorizedError.message}`
        }],
        errors: [categorizedError.message],
        warnings: categorizedError.recovery ? [categorizedError.recovery] : []
      };
    }
  },

  // Enhanced field mapping with data type-specific logic
  applyEnhancedFieldMappings(
    data: any[], 
    mappings: Record<string, string>, 
    dataType: string
  ): Record<string, any>[] {
    return data.map(row => {
      const mappedRow: Record<string, any> = {};
      
      // Apply explicit mappings first
      for (const [sourceField, targetField] of Object.entries(mappings)) {
        if (row[sourceField] !== undefined) {
          mappedRow[targetField] = this.cleanFieldValue(row[sourceField], targetField);
        }
      }
      
      // Apply data type-specific default mappings
      this.applyDefaultMappings(row, mappedRow, dataType);
      
      // Copy unmapped fields that might be needed
      for (const [key, value] of Object.entries(row)) {
        if (!mappings[key] && !Object.values(mappings).includes(key) && !mappedRow[key]) {
          mappedRow[key] = this.cleanFieldValue(value, key);
        }
      }
      
      return mappedRow;
    });
  },

  // Clean and validate field values
  cleanFieldValue(value: any, fieldName: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Handle boolean fields
    if (fieldName.includes('is_') || fieldName === 'paid') {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
      }
      return Boolean(value);
    }

    // Handle numeric fields
    if (fieldName.includes('amount') || fieldName.includes('fee') || 
        fieldName.includes('footage') || fieldName.includes('size')) {
      const numValue = parseFloat(value.toString().replace(/[$,]/g, ''));
      return isNaN(numValue) ? null : numValue;
    }

    // Handle integer fields
    if (fieldName.includes('bedrooms') || fieldName.includes('year_built')) {
      const intValue = parseInt(value.toString());
      return isNaN(intValue) ? null : intValue;
    }

    // Handle email fields
    if (fieldName.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.toString()) ? value.toString().toLowerCase() : null;
    }

    // Handle phone fields
    if (fieldName.includes('phone')) {
      return value.toString().replace(/[^\d+()-]/g, '');
    }

    // Default: return as string, trimmed
    return value.toString().trim();
  },

  // Apply default mappings based on data type
  applyDefaultMappings(sourceRow: any, targetRow: any, dataType: string): void {
    switch (dataType) {
      case 'properties_owners':
        // Property address variants
        if (!targetRow.address) {
          targetRow.address = sourceRow.property_address || sourceRow.street_address || sourceRow.full_address;
        }
        // Owner name variants
        if (!targetRow.first_name && sourceRow.owner_name) {
          const nameParts = sourceRow.owner_name.split(' ');
          targetRow.first_name = nameParts[0];
          targetRow.last_name = nameParts.slice(1).join(' ');
        }
        break;
        
      case 'owners':
        // Email variants
        if (!targetRow.email) {
          targetRow.email = sourceRow.contact_email || sourceRow.email_address;
        }
        // Phone variants
        if (!targetRow.phone) {
          targetRow.phone = sourceRow.phone_number || sourceRow.contact_phone;
        }
        break;
    }
  },

  // Get import template (legacy support)
  getImportTemplate(dataType: string) {
    return templateService.getImportTemplate(dataType);
  },

  // Extract number of records processed from message
  extractRecordsProcessed(message: string): number {
    const match = message.match(/(\d+)\s+record/i);
    return match ? parseInt(match[1], 10) : 0;
  }
};
