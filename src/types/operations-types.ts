
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
