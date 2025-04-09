
export interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface ConversionRateData {
  stage: string;
  rate: number;
  count: number;
}

export interface TimeSeriesData {
  date: string;
  new_leads: number;
  converted_leads: number;
}

export interface LeadStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  total_leads: number;
  leads_this_month: number;
  conversion_rate: number;
  average_time_to_convert: number; // in days
}
