import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Mock types for reporting (no database dependency)
export interface ReportDefinition {
  id: string;
  association_id: string | null;
  name: string;
  description: string | null;
  report_type: string;
  data_source: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  chart_config: ChartConfig | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label?: string;
}

export interface ReportColumn {
  field: string;
  label: string;
  type: string;
  format?: string;
  aggregation?: string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  colors?: string[];
  options?: Record<string, any>;
}

export interface ReportExecution {
  id: string;
  report_definition_id: string;
  status: 'running' | 'completed' | 'failed';
  result_data: any[] | null;
  execution_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// Mock data
const mockReports: ReportDefinition[] = [
  {
    id: '1',
    association_id: 'demo-association',
    name: 'Payment Status Report',
    description: 'Shows payment status for all residents',
    report_type: 'financial',
    data_source: 'assessments',
    filters: [
      { field: 'payment_status', operator: 'in', value: ['paid', 'overdue'], label: 'Payment Status' }
    ],
    columns: [
      { field: 'property', label: 'Property', type: 'string' },
      { field: 'resident', label: 'Resident', type: 'string' },
      { field: 'amount', label: 'Amount', type: 'currency' },
      { field: 'payment_status', label: 'Status', type: 'string' }
    ],
    chart_config: {
      type: 'pie',
      groupBy: 'payment_status',
      colors: ['#10b981', '#ef4444', '#f59e0b']
    },
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  },
  {
    id: '2',
    association_id: 'demo-association',
    name: 'Maintenance Request Summary',
    description: 'Summary of all maintenance requests',
    report_type: 'operational',
    data_source: 'maintenance_requests',
    filters: [
      { field: 'status', operator: 'neq', value: 'completed', label: 'Active Requests' }
    ],
    columns: [
      { field: 'title', label: 'Request Title', type: 'string' },
      { field: 'priority', label: 'Priority', type: 'string' },
      { field: 'status', label: 'Status', type: 'string' },
      { field: 'created_at', label: 'Created', type: 'date' }
    ],
    chart_config: {
      type: 'bar',
      xAxis: 'priority',
      yAxis: 'count',
      colors: ['#3b82f6', '#8b5cf6', '#f59e0b']
    },
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  }
];

export const useReportBuilder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportDefinition[]>(mockReports);
  const [currentReport, setCurrentReport] = useState<Partial<ReportDefinition> | null>(null);

  const createReport = useCallback(async (reportData: Partial<ReportDefinition>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newReport: ReportDefinition = {
        id: Math.random().toString(36).substring(7),
        association_id: reportData.association_id || 'demo-association',
        name: reportData.name || 'New Report',
        description: reportData.description || null,
        report_type: reportData.report_type || 'general',
        data_source: reportData.data_source || 'properties',
        filters: reportData.filters || [],
        columns: reportData.columns || [],
        chart_config: reportData.chart_config || null,
        is_public: reportData.is_public !== undefined ? reportData.is_public : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: reportData.created_by || 'current-user'
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reportData = await generateReportData(reportId);
      
      const execution: ReportExecution = {
        id: Math.random().toString(36).substring(7),
        report_definition_id: reportId,
        status: 'completed',
        result_data: reportData,
        execution_time_ms: Math.floor(Math.random() * 2000) + 500,
        error_message: null,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };

      toast.success('Report executed successfully!');
      return execution;
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

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
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const insights = {
      summary: `Analyzed ${reportData.length} records with AI-powered insights`,
      trends: [
        'Payment compliance has improved by 12% this quarter compared to last quarter',
        'Pool amenity bookings are 35% higher than the same period last year',
        'Maintenance requests spike on weekends, suggesting preventive scheduling opportunities'
      ],
      anomalies: [
        'Unusual spike in late fees detected in Building C units (3x normal rate)',
        '3 properties have not submitted any maintenance requests this year (potential under-reporting)',
        'Electric utility costs increased 18% in Q4 without corresponding usage increase'
      ],
      recommendations: [
        'Implement automated payment reminders to improve compliance by estimated 8-15%',
        'Add additional pool booking slots for peak hours (10 AM - 2 PM weekends)',
        'Schedule preventive maintenance on weekdays to reduce emergency weekend requests',
        'Investigate Building C late fee pattern - may indicate communication or billing issues'
      ],
      riskFactors: [
        'High delinquency rate in units 201-210 may indicate larger systemic issue',
        'Declining amenity usage could signal resident satisfaction concerns'
      ],
      financialProjections: {
        nextQuarterRevenue: reportData.reduce((sum, item) => sum + (item.amount || 0), 0) * 1.03,
        costSavingsOpportunity: '$2,400 annually through preventive maintenance scheduling',
        collectionEfficiencyGain: '12% improvement possible with automated reminders'
      }
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
  // Simulate different data based on report type
  const report = mockReports.find(r => r.id === reportId);
  
  if (report?.report_type === 'financial') {
    return [
      {
        id: '1',
        property: '123 Main St, Unit A',
        resident: 'John Doe',
        payment_status: 'Paid',
        amount: 250.00,
        due_date: '2024-01-15',
        payment_date: '2024-01-12',
        category: 'Monthly Assessment'
      },
      {
        id: '2',
        property: '456 Oak Ave, Unit B',
        resident: 'Jane Smith',
        payment_status: 'Overdue',
        amount: 275.00,
        due_date: '2024-01-10',
        payment_date: null,
        category: 'Monthly Assessment'
      },
      {
        id: '3',
        property: '789 Pine St, Unit C',
        resident: 'Bob Wilson',
        payment_status: 'Paid',
        amount: 300.00,
        due_date: '2024-01-20',
        payment_date: '2024-01-18',
        category: 'Special Assessment'
      },
      {
        id: '4',
        property: '321 Elm Dr, Unit D',
        resident: 'Sarah Johnson',
        payment_status: 'Partial',
        amount: 250.00,
        due_date: '2024-01-15',
        payment_date: '2024-01-16',
        category: 'Monthly Assessment'
      }
    ];
  }

  if (report?.report_type === 'operational') {
    return [
      {
        id: '1',
        title: 'Pool Pump Maintenance',
        property: '123 Main St',
        priority: 'High',
        status: 'In Progress',
        created_at: '2024-01-10',
        assigned_to: 'Mike Thompson',
        category: 'Pool/Spa'
      },
      {
        id: '2',
        title: 'Parking Lot Light Repair',
        property: 'Common Area',
        priority: 'Medium',
        status: 'Open',
        created_at: '2024-01-12',
        assigned_to: 'John Martinez',
        category: 'Electrical'
      },
      {
        id: '3',
        title: 'Fence Panel Replacement',
        property: '456 Oak Ave',
        priority: 'Low',
        status: 'Scheduled',
        created_at: '2024-01-08',
        assigned_to: 'ABC Contractors',
        category: 'Exterior'
      }
    ];
  }

  // Default general data
  return [
    {
      id: '1',
      name: 'Sample Data Point 1',
      value: 100,
      category: 'Category A',
      date: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sample Data Point 2',
      value: 150,
      category: 'Category B',
      date: '2024-01-16'
    },
    {
      id: '3',
      name: 'Sample Data Point 3',
      value: 75,
      category: 'Category A',
      date: '2024-01-17'
    }
  ];
}