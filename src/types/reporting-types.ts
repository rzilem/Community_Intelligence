
export interface ReportDefinition {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  report_type: 'financial' | 'compliance' | 'maintenance' | 'resident' | 'custom';
  data_sources: string[];
  filters: ReportFilter[];
  grouping: ReportGrouping[];
  columns: ReportColumn[];
  chart_config?: ChartConfig;
  schedule?: ReportSchedule;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  data_type: 'string' | 'number' | 'date' | 'boolean';
}

export interface ReportGrouping {
  field: string;
  sort_order: 'asc' | 'desc';
}

export interface ReportColumn {
  field: string;
  label: string;
  data_type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  format?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  width?: number;
  is_visible: boolean;
}

export interface ChartConfig {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  x_axis: string;
  y_axis: string[];
  colors?: string[];
  title?: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportExecution {
  id: string;
  report_definition_id: string;
  status: 'running' | 'completed' | 'failed';
  result_data?: any[];
  result_url?: string;
  error_message?: string;
  execution_time_ms?: number;
  created_at: string;
  completed_at?: string;
}
