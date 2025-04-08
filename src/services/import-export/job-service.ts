
import { supabase } from '@/integrations/supabase/client';
import { ImportJob, ImportJobTable } from '@/types/import-types';
import { toast } from 'sonner';

export const jobService = {
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
};
