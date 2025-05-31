
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Define interfaces locally to avoid any potential type import issues
interface ReportDefinition {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  report_type: string;
  data_sources: string[];
  filters: any[];
  grouping: string[];
  columns: any[];
  chart_config?: any;
  schedule?: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ReportExecutionResult {
  id: string;
  report_definition_id: string;
  status: 'completed' | 'failed' | 'running';
  result_data: any[];
  execution_time_ms: number;
  created_at: string;
  completed_at: string;
}

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
  },
  {
    id: '2',
    association_id: 'demo-association',
    name: 'Maintenance Requests Report',
    description: 'Monthly maintenance overview',
    report_type: 'maintenance',
    data_sources: ['maintenance_requests'],
    filters: [],
    grouping: [],
    columns: [
      { field: 'property', label: 'Property', data_type: 'string', is_visible: true },
      { field: 'status', label: 'Status', data_type: 'string', is_visible: true }
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
      // Simulate report execution with mock data
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
        }
      ];
      
      const executionResult: ReportExecutionResult = {
        id: Date.now().toString(),
        report_definition_id: reportId,
        status: 'completed',
        result_data: mockData,
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
        'Maintenance requests are 15% higher than last month'
      ],
      anomalies: [
        'Unusual spike in late fees in Building C'
      ],
      recommendations: [
        'Consider implementing automatic payment reminders'
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
