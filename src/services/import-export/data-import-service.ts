
import { supabase } from '@/integrations/supabase/client';
import { ImportJob, ImportMapping, ImportResult, ImportJobTable, ImportMappingTable } from '@/types/import-types';
import { toast } from 'sonner';
import { ImportOptions } from './types';
import { validationService } from './validation-service';

export const dataImportService = {
  createImportJob: async (options: {
    associationId: string;
    importType: string;
    fileName: string;
    fileSize: number;
    userId?: string;
  }): Promise<ImportJob | null> => {
    try {
      const { associationId, importType, fileName, fileSize, userId } = options;
      
      const { data, error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .insert({
          association_id: associationId,
          import_type: importType,
          status: 'processing',
          file_name: fileName,
          file_size: fileSize,
          created_by: userId
        } as any)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating import job:', error);
        toast.error('Failed to create import job');
        throw error;
      }
      
      return data as unknown as ImportJob;
    } catch (error) {
      console.error('Error creating import job:', error);
      return null;
    }
  },
  
  updateImportJobStatus: async (
    jobId: string,
    status: ImportJob['status'],
    results?: {
      processed?: number;
      succeeded?: number;
      failed?: number;
      errorDetails?: Record<string, any>;
    }
  ): Promise<void> => {
    try {
      const updateData: Partial<ImportJob> = { status };
      
      if (results) {
        if (results.processed !== undefined) updateData.rows_processed = results.processed;
        if (results.succeeded !== undefined) updateData.rows_succeeded = results.succeeded;
        if (results.failed !== undefined) updateData.rows_failed = results.failed;
        if (results.errorDetails) updateData.error_details = results.errorDetails;
      }
      
      const { error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .update(updateData as any)
        .eq('id', jobId);
      
      if (error) {
        console.error('Error updating import job:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating import job status:', error);
    }
  },
  
  saveImportMapping: async (
    associationId: string,
    importType: string,
    mappings: Record<string, string>,
    userId?: string
  ): Promise<void> => {
    try {
      const { data: existingMapping } = await supabase
        .from('import_mappings' as ImportMappingTable)
        .select('*')
        .eq('association_id', associationId)
        .eq('import_type', importType)
        .maybeSingle();
      
      if (existingMapping) {
        await supabase
          .from('import_mappings' as ImportMappingTable)
          .update({ mappings: mappings as any })
          .eq('id', existingMapping.id);
      } else {
        await supabase
          .from('import_mappings' as ImportMappingTable)
          .insert({
            association_id: associationId,
            import_type: importType,
            mappings: mappings as any,
            created_by: userId
          } as any);
      }
    } catch (error) {
      console.error('Error saving import mappings:', error);
    }
  },
  
  getImportMapping: async (
    associationId: string,
    importType: string
  ): Promise<Record<string, string> | null> => {
    try {
      const { data, error } = await supabase
        .from('import_mappings' as ImportMappingTable)
        .select('mappings')
        .eq('association_id', associationId)
        .eq('import_type', importType)
        .maybeSingle();
      
      if (error) {
        console.error('Error getting import mappings:', error);
        return null;
      }
      
      return data?.mappings && typeof data.mappings === 'object' 
        ? (data.mappings as unknown as Record<string, string>)
        : null;
    } catch (error) {
      console.error('Error getting import mappings:', error);
      return null;
    }
  },
  
  getImportJob: async (jobId: string): Promise<ImportJob | null> => {
    try {
      const { data, error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) {
        console.error('Error getting import job:', error);
        return null;
      }
      
      return data as unknown as ImportJob;
    } catch (error) {
      console.error('Error getting import job:', error);
      return null;
    }
  },
  
  getRecentImportJobs: async (associationId: string, limit = 5): Promise<ImportJob[]> => {
    try {
      const { data, error } = await supabase
        .from('import_jobs' as ImportJobTable)
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error getting recent import jobs:', error);
        return [];
      }
      
      return data as unknown as ImportJob[];
    } catch (error) {
      console.error('Error getting recent import jobs:', error);
      return [];
    }
  },
  
  importData: async (options: ImportOptions): Promise<ImportResult> => {
    const { associationId, dataType, data, mappings, userId } = options;
    
    try {
      const importJob = await dataImportService.createImportJob({
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
        const mappedRow: Record<string, any> = { association_id: associationId };
        
        Object.entries(mappings).forEach(([column, field]) => {
          if (field && row[column] !== undefined) {
            mappedRow[field] = row[column];
          }
        });
        
        return mappedRow;
      });
      
      let tableName: string;
      switch (dataType) {
        case 'associations':
          tableName = 'associations';
          break;
        case 'owners':
          tableName = 'residents';
          processedData.forEach(row => {
            row.resident_type = 'owner';
          });
          break;
        case 'properties':
          tableName = 'properties';
          break;
        case 'financial':
          tableName = 'assessments';
          break;
        case 'compliance':
          tableName = 'compliance_issues';
          break;
        case 'maintenance':
          tableName = 'maintenance_requests';
          break;
        case 'vendors':
          tableName = 'vendors';
          processedData.forEach(row => {
            row.status = row.status || 'active';
            row.hasInsurance = row.hasInsurance === 'true' || row.hasInsurance === true || false;
          });
          break;
        default:
          tableName = dataType;
      }
      
      await dataImportService.updateImportJobStatus(importJob.id, 'validating');
      
      const batchSize = 50;
      let successfulImports = 0;
      let failedImports = 0;
      const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
      
      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        
        try {
          const { data: insertedData, error } = await supabase
            .from(tableName as any)
            .insert(batch as any)
            .select('id');
          
          if (error) {
            console.error(`Error importing batch to ${tableName}:`, error);
            failedImports += batch.length;
            details.push({
              status: 'error',
              message: `Failed to import ${batch.length} records: ${error.message}`
            });
          } else if (insertedData) {
            successfulImports += insertedData.length;
            details.push({
              status: 'success',
              message: `Imported ${insertedData.length} records successfully`
            });
          }
        } catch (e) {
          console.error(`Error in batch import:`, e);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} records: ${e instanceof Error ? e.message : 'Unknown error'}`
          });
        }
        
        await dataImportService.updateImportJobStatus(importJob.id, 'processing', {
          processed: i + batch.length,
          succeeded: successfulImports,
          failed: failedImports
        });
      }
      
      await dataImportService.saveImportMapping(
        associationId,
        dataType,
        mappings,
        userId
      );
      
      const finalStatus = failedImports === 0 ? 'completed' : 'failed';
      await dataImportService.updateImportJobStatus(importJob.id, finalStatus as ImportJob['status'], {
        processed: processedData.length,
        succeeded: successfulImports,
        failed: failedImports,
        errorDetails: failedImports > 0 ? { details } : undefined
      });
      
      return {
        success: failedImports === 0,
        totalProcessed: processedData.length,
        successfulImports,
        failedImports,
        job_id: importJob.id,
        details: [
          { status: 'success', message: `${successfulImports} records imported successfully` },
          ...(failedImports > 0 ? [{ 
            status: 'error' as const, 
            message: `${failedImports} records failed to import` 
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
  },
  
  getImportTemplate: (dataType: string) => {
    const templates: Record<string, Record<string, string>> = {
      associations: {
        name: 'Association Name',
        address: 'Street Address',
        contact_email: 'Contact Email'
      },
      owners: {
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        property_id: 'Property ID',
        move_in_date: 'Move-in Date (YYYY-MM-DD)',
        is_primary: 'Is Primary Owner (true/false)'
      },
      properties: {
        address: 'Street Address',
        unit_number: 'Unit Number',
        property_type: 'Property Type',
        city: 'City',
        state: 'State',
        zip: 'Zip Code',
        square_feet: 'Square Footage',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms'
      },
      financial: {
        property_id: 'Property ID',
        amount: 'Amount',
        due_date: 'Due Date (YYYY-MM-DD)',
        assessment_type_id: 'Assessment Type ID',
        late_fee: 'Late Fee Amount'
      },
      compliance: {
        property_id: 'Property ID',
        violation_type: 'Violation Type',
        description: 'Description',
        due_date: 'Due Date (YYYY-MM-DD)',
        fine_amount: 'Fine Amount'
      },
      maintenance: {
        property_id: 'Property ID',
        title: 'Title',
        description: 'Description',
        priority: 'Priority (low/medium/high)',
        status: 'Status (open/in_progress/completed)'
      },
      vendors: {
        name: 'Vendor Name',
        contactPerson: 'Contact Person',
        email: 'Email',
        phone: 'Phone Number',
        category: 'Service Category',
        status: 'Status (active/inactive)',
        hasInsurance: 'Has Insurance (true/false)'
      }
    };
    
    return templates[dataType] || {};
  }
};
