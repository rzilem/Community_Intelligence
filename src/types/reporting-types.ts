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