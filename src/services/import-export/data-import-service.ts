
import { ImportResult, ImportJob, ImportOptions } from '@/types/import-types';
import { supabase } from '@/integrations/supabase/client';
import { jobService } from './job-service';
import { processorService } from './processor-service';
import { devLog } from '@/utils/dev-logger';

export const dataImportService = {
  async importData(options: ImportOptions): Promise<ImportResult> {
    const { associationId, dataType, data, mappings, userId } = options;
    
    devLog.info('Starting data import:', {
      associationId,
      dataType,
      recordCount: data.length
    });

    try {
      // Create import job
      const job = await jobService.createImportJob({
        association_id: associationId,
        import_type: dataType,
        file_name: `${dataType}_import_${new Date().toISOString()}`,
        file_size: JSON.stringify(data).length,
        created_by: userId
      });

      if (!job) {
        throw new Error('Failed to create import job');
      }

      // Process data with field mappings
      const processedData = this.applyFieldMappings(data, mappings);
      
      devLog.info('Data mapped successfully:', {
        originalFields: Object.keys(data[0] || {}),
        mappedFields: Object.keys(processedData[0] || {}),
        recordCount: processedData.length
      });

      // Process the import
      const result = await processorService.processImportData(
        job.id,
        associationId,
        dataType,
        processedData
      );

      // Return standardized result
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

      devLog.info('Import completed:', importResult);
      return importResult;

    } catch (error) {
      devLog.error('Import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        totalProcessed: data.length,
        successfulImports: 0,
        failedImports: data.length,
        details: [{
          filename: undefined,
          status: 'error' as const,
          recordsProcessed: 0,
          message: `Import failed: ${errorMessage}`
        }],
        errors: [errorMessage],
        warnings: []
      };
    }
  },

  applyFieldMappings(data: any[], mappings: Record<string, string>): Record<string, any>[] {
    return data.map(row => {
      const mappedRow: Record<string, any> = {};
      
      // Apply mappings
      for (const [sourceField, targetField] of Object.entries(mappings)) {
        if (row[sourceField] !== undefined) {
          mappedRow[targetField] = row[sourceField];
        }
      }
      
      // Copy unmapped fields that might be needed
      for (const [key, value] of Object.entries(row)) {
        if (!mappings[key] && !Object.values(mappings).includes(key)) {
          mappedRow[key] = value;
        }
      }
      
      return mappedRow;
    });
  },

  extractRecordsProcessed(message: string): number {
    const match = message.match(/(\d+)\s+record/i);
    return match ? parseInt(match[1], 10) : 0;
  },

  // Legacy method for backwards compatibility
  async processAssociationsImport(data: any[], userId?: string): Promise<ImportResult> {
    try {
      const insertData = data.map(item => ({
        name: item.name || item.association_name,
        address: item.address,
        contact_email: item.contact_email || item.email,
        phone: item.phone,
        city: item.city,
        state: item.state,
        zip: item.zip,
        country: item.country || 'US',
        status: item.status || 'active'
      }));

      const { data: insertedData, error } = await supabase
        .from('associations')
        .insert(insertData)
        .select('id');

      if (error) {
        throw error;
      }

      const result: ImportResult = {
        success: true,
        totalProcessed: data.length,
        successfulImports: insertedData?.length || 0,
        failedImports: 0,
        details: [{
          filename: undefined,
          status: 'success' as const,
          recordsProcessed: insertedData?.length || 0,
          message: `Successfully imported ${insertedData?.length || 0} associations`
        }],
        errors: [],
        warnings: []
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        totalProcessed: data.length,
        successfulImports: 0,
        failedImports: data.length,
        details: [{
          filename: undefined,
          status: 'error' as const,
          recordsProcessed: 0,
          message: `Failed to import associations: ${errorMessage}`
        }],
        errors: [errorMessage],
        warnings: []
      };
    }
  },

  async processPropertiesImport(data: any[], associationId: string, userId?: string): Promise<ImportResult> {
    try {
      const insertData = data.map(item => ({
        association_id: associationId,
        address: item.address || item.property_address || item.street_address,
        property_type: item.property_type || 'single_family',
        unit_number: item.unit_number || item.unit,
        square_footage: item.square_footage ? parseFloat(item.square_footage) : null,
        bedrooms: item.bedrooms ? parseInt(item.bedrooms) : null,
        bathrooms: item.bathrooms ? parseFloat(item.bathrooms) : null,
        year_built: item.year_built ? parseInt(item.year_built) : null,
        lot_size: item.lot_size ? parseFloat(item.lot_size) : null
      }));

      const { data: insertedData, error } = await supabase
        .from('properties')
        .insert(insertData)
        .select('id');

      if (error) {
        throw error;
      }

      return {
        success: true,
        totalProcessed: data.length,
        successfulImports: insertedData?.length || 0,
        failedImports: 0,
        details: [{
          filename: undefined,
          status: 'success' as const,
          recordsProcessed: insertedData?.length || 0,
          message: `Successfully imported ${insertedData?.length || 0} properties`
        }],
        errors: [],
        warnings: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        totalProcessed: data.length,
        successfulImports: 0,
        failedImports: data.length,
        details: [{
          filename: undefined,
          status: 'error' as const,
          recordsProcessed: 0,
          message: `Failed to import properties: ${errorMessage}`
        }],
        errors: [errorMessage],
        warnings: []
      };
    }
  }
};
