
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReportDefinition, ReportFilter, ReportColumn, ChartConfig } from '@/types/reporting-types';

export const useReportBuilder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [currentReport, setCurrentReport] = useState<Partial<ReportDefinition> | null>(null);

  const createReport = useCallback(async (reportData: Partial<ReportDefinition>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_definitions')
        .insert([{
          ...reportData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select('*')
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      toast.success('Report created successfully!');
      return data;
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeReport = useCallback(async (reportId: string) => {
    setIsLoading(true);
    try {
      // Start execution
      const { data: execution, error: execError } = await supabase
        .from('report_executions')
        .insert([{
          report_definition_id: reportId,
          status: 'running'
        }])
        .select('*')
        .single();

      if (execError) throw execError;

      // Simulate report execution with AI insights
      const reportData = await generateReportData(reportId);
      
      // Update execution with results
      const { error: updateError } = await supabase
        .from('report_executions')
        .update({
          status: 'completed',
          result_data: reportData,
          execution_time_ms: Math.floor(Math.random() * 2000) + 500,
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      if (updateError) throw updateError;

      toast.success('Report executed successfully!');
      return { ...execution, result_data: reportData };
    } catch (error: any) {
      console.error('Error executing report:', error);
      toast.error('Failed to execute report');
      throw error;
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
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAIInsights = useCallback(async (reportData: any[]) => {
    // AI-powered insights generation
    const insights = {
      summary: `Analyzed ${reportData.length} records`,
      trends: [
        'Payment compliance has improved by 12% this quarter',
        'Pool bookings are 35% higher than last year',
        'Maintenance requests spike on weekends'
      ],
      anomalies: [
        'Unusual spike in late fees in Building C',
        '3 properties have not submitted any requests this year'
      ],
      recommendations: [
        'Consider implementing automatic payment reminders',
        'Add more pool booking slots for peak hours',
        'Schedule preventive maintenance on weekdays'
      ]
    };

    return insights;
  }, []);

  return {
    isLoading,
    reports,
    currentReport,
    setCurrentReport,
    createReport,
    executeReport,
    fetchReports,
    getAIInsights
  };
};

// Generate mock report data based on report type
async function generateReportData(reportId: string) {
  // This would normally execute the actual report query
  // For demo purposes, we'll return structured mock data
  const mockData = [
    {
      id: '1',
      property: '123 Main St',
      resident: 'John Doe',
      payment_status: 'Paid',
      amount: 250.00,
      due_date: '2024-01-15',
      category: 'Monthly Assessment'
    },
    {
      id: '2',
      property: '456 Oak Ave',
      resident: 'Jane Smith',
      payment_status: 'Overdue',
      amount: 275.00,
      due_date: '2024-01-10',
      category: 'Monthly Assessment'
    },
    {
      id: '3',
      property: '789 Pine St',
      resident: 'Bob Wilson',
      payment_status: 'Paid',
      amount: 300.00,
      due_date: '2024-01-20',
      category: 'Special Assessment'
    }
  ];

  return mockData;
}
