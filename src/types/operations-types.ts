
export interface OperationsTimeSeriesData {
  month: string;
  invoices: number;
  arcRequests: number;
  gateRequests: number;
  poolRequests: number;
  generalInquiries: number;
}

export interface RequestDistributionData {
  type: string;
  percentage: number;
  color: string;
}

export interface OfficeMetricsData {
  office: string;
  openRequests: number;
  color: string;
}

export interface RequestTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface OperationsDashboardFilters {
  timeRange: string;
  portfolio: string;
  office: string;
}

export interface WorkflowSchedule {
  id: string;
  name: string;
  scheduleDate: string;
  scheduledTime: string;
  timezone: string;
  lastRun: string;
  nextRun: string;
  endRun: string;
  status: 'active' | 'paused' | 'error' | 'completed';
  type: 'payment' | 'file' | 'report' | 'sync' | 'maintenance' | 'notification';
}
