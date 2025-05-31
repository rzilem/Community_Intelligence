
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ReportDefinition, ReportFilter, ReportColumn, ChartConfig } from '@/types/reporting-types';

// Mock data for demonstration
const mockReports: ReportDefinition[] = [
  {
    id: '1',
    association_id: 'demo-association',
    name: 'Financial Summary Report',
    description: 'Monthly financial overview',
    report_type: 'financial',
    data_sources: ['assessments', 'payments'],
    filters: [],
    grouping: [],
    columns: [
      { field: 'property', label: 'Property', data_type: 'string', is_visible: true },
      { field: 'amount', label: 'Amount', data_type: 'currency', is_visible: true }
    ],
    is_active: true,
    created_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useReportBuilder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportDefinition[]>(mockReports);
  const [currentReport, setCurrentReport] = useState<Partial<ReportDefinition> | null>(null);

  const createReport = useCallback(async (reportData: Partial<ReportDefinition>) => {
    setIsLoading(true);
    try {
      const newReport: ReportDefinition = {
        id: Date.now().toString(),
        association_id: reportData.association_id || 'demo-association',
        name: reportData.name || 'New Report',
        description: reportData.description,
        report_type: reportData.report_type || 'custom',
        data_sources: reportData.data_sources || [],
        filters: reportData.filters || [],
        grouping: reportData.grouping || [],
        columns: reportData.columns || [],
        chart_config: reportData.chart_config,
        schedule: reportData.schedule,
        is_active: true,
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
      toast.success('Report created successfully!');
      return newReport;
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
      // Simulate report execution
      const reportData = await generateReportData(reportId);
      
      const executionResult = {
        id: Date.now().toString(),
        report_definition_id: reportId,
        status: 'completed' as const,
        result_data: reportData,
        execution_time_ms: Math.floor(Math.random() * 2000) + 500,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };

      toast.success('Report executed successfully!');
      return executionResult;
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
      let filteredReports = mockReports;

      if (associationId) {
        filteredReports = mockReports.filter(r => r.association_id === associationId);
      }

      setReports(filteredReports);
      return filteredReports;
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
