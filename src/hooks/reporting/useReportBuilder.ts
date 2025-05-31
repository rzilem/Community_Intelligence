
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReportDefinition, ReportExecution } from '@/types/reporting-types';

export const useReportBuilder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [executionResults, setExecutionResults] = useState<any>(null);

  const createReport = useCallback(async (reportData: Partial<ReportDefinition>) => {
    setIsLoading(true);
    try {
      console.log('Creating report:', reportData);
      
      const { data, error } = await supabase
        .from('report_definitions')
        .insert([reportData])
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Report created successfully!');
      setReports(prev => [...prev, data]);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeReport = useCallback(async (reportId: string) => {
    setIsLoading(true);
    try {
      console.log('Executing report:', reportId);
      
      // First get the report definition
      const { data: reportDef, error: reportError } = await supabase
        .from('report_definitions')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;

      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('report_executions')
        .insert([{
          report_definition_id: reportId,
          status: 'running'
        }])
        .select('*')
        .single();

      if (execError) throw execError;

      // Execute the report logic based on data sources
      const startTime = Date.now();
      let resultData: any[] = [];

      try {
        // Build dynamic query based on report definition
        const dataSources = reportDef.data_sources || [];
        
        if (dataSources.includes('assessments')) {
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .order('due_date', { ascending: false })
            .limit(1000);
          
          if (error) throw error;
          resultData = data || [];
        } else if (dataSources.includes('properties')) {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
          
          if (error) throw error;
          resultData = data || [];
        } else if (dataSources.includes('residents')) {
          const { data, error } = await supabase
            .from('residents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
          
          if (error) throw error;
          resultData = data || [];
        }

        // Apply filters
        if (reportDef.filters && reportDef.filters.length > 0) {
          resultData = resultData.filter(row => {
            return reportDef.filters!.every(filter => {
              const value = row[filter.field];
              switch (filter.operator) {
                case 'equals':
                  return value === filter.value;
                case 'contains':
                  return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                case 'greater_than':
                  return Number(value) > Number(filter.value);
                case 'less_than':
                  return Number(value) < Number(filter.value);
                default:
                  return true;
              }
            });
          });
        }

        const executionTime = Date.now() - startTime;

        // Update execution with results
        const { error: updateError } = await supabase
          .from('report_executions')
          .update({
            status: 'completed',
            result_data: resultData,
            execution_time_ms: executionTime,
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id);

        if (updateError) throw updateError;

        setExecutionResults(resultData);
        toast.success(`Report executed successfully! Generated ${resultData.length} rows in ${executionTime}ms`);
        
        return { success: true, data: resultData, execution };
      } catch (execError) {
        // Update execution with error
        await supabase
          .from('report_executions')
          .update({
            status: 'failed',
            error_message: execError instanceof Error ? execError.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id);
        
        throw execError;
      }
    } catch (error) {
      console.error('Error executing report:', error);
      toast.error('Failed to execute report');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async (associationId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('report_definitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (associationId) {
        query = query.eq('association_id', associationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('report_definitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Report deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    reports,
    executionResults,
    createReport,
    executeReport,
    fetchReports,
    deleteReport
  };
};
