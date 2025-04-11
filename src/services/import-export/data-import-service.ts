
import { ImportJob, ImportResult } from '@/types/import-types';
import { ImportOptions } from './types';
import { jobService } from './job-service';
import { mappingService } from './mapping-service';
import { templateService } from './template-service';
import { processorService } from './processor-service';

export const dataImportService = {
  createImportJob: jobService.createImportJob,
  updateImportJobStatus: jobService.updateImportJobStatus,
  getImportJob: jobService.getImportJob,
  getRecentImportJobs: jobService.getRecentImportJobs,
  
  saveImportMapping: mappingService.saveImportMapping,
  getImportMapping: mappingService.getImportMapping,
  
  getImportTemplate: templateService.getImportTemplate,
  
  importData: async (options: ImportOptions): Promise<ImportResult> => {
    const { associationId, dataType, data, mappings, userId } = options;
    
    try {
      const importJob = await jobService.createImportJob({
        associationId,
        importType: dataType,
        fileName: `${dataType}_import_${new Date().toISOString()}`,
        fileSize: JSON.stringify(data).length,
        userId
      });
      
      if (!importJob) {
        return {
          success: false,
          totalProcessed: 0,
          successfulImports: 0,
          failedImports: 0,
          details: [{ status: 'error' as const, message: 'Failed to create import job' }]
        };
      }
      
      const processedData = data.map(row => {
        // Create a new object to hold mapped data
        const mappedRow: Record<string, any> = {};
        
        // Only add association_id for non-association imports
        if (dataType !== 'associations') {
          mappedRow.association_id = associationId;
        }
        
        // Map fields from the source data to destination fields
        Object.entries(mappings).forEach(([column, field]) => {
          if (field && row[column] !== undefined) {
            mappedRow[field] = row[column];
          }
        });
        
        return mappedRow;
      });
      
      const importResult = await processorService.processImportData(
        importJob.id,
        associationId,
        dataType,
        processedData
      );
      
      await mappingService.saveImportMapping(
        associationId,
        dataType,
        mappings,
        userId
      );
      
      const finalStatus = importResult.failedImports === 0 ? 'completed' : 'failed';
      await jobService.updateImportJobStatus(importJob.id, finalStatus as ImportJob['status'], {
        processed: processedData.length,
        succeeded: importResult.successfulImports,
        failed: importResult.failedImports,
        errorDetails: importResult.failedImports > 0 ? { details: importResult.details } : undefined
      });
      
      return {
        success: importResult.failedImports === 0,
        totalProcessed: processedData.length,
        successfulImports: importResult.successfulImports,
        failedImports: importResult.failedImports,
        job_id: importJob.id,
        details: [
          { status: 'success', message: `${importResult.successfulImports} records imported successfully` },
          ...(importResult.failedImports > 0 ? [{ 
            status: 'error' as const, 
            message: `${importResult.failedImports} records failed to import` 
          }] : [])
        ]
      };
    } catch (error) {
      console.error('Error importing data:', error);
      return {
        success: false,
        totalProcessed: 0,
        successfulImports: 0,
        failedImports: data.length,
        details: [{ 
          status: 'error' as const, 
          message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }]
      };
    }
  }
};
