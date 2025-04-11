
import { TimeSeriesData, LeadSourceData, ConversionRateData } from '@/types/analytics-types';

export const fetchResaleTransactionData = async (timeRange: string, associationId?: string) => {
  // Mock implementation for resale transaction data
  return {
    totalTransactions: 58,
    totalRevenue: 17500,
    averageTime: 4.3,
    conversionRate: 82
  };
};

export const fetchResaleTimeSeriesData = async (timeRange: string): Promise<TimeSeriesData[]> => {
  // Mock implementation for time series data
  return [
    { date: '2024-04', new_leads: 24, converted_leads: 18 },
    { date: '2024-05', new_leads: 32, converted_leads: 27 },
    { date: '2024-06', new_leads: 28, converted_leads: 22 },
    { date: '2024-07', new_leads: 35, converted_leads: 30 },
    { date: '2024-08', new_leads: 42, converted_leads: 35 },
    { date: '2024-09', new_leads: 38, converted_leads: 32 }
  ];
};

export const fetchResaleSourceData = async (): Promise<LeadSourceData[]> => {
  // Mock implementation for source distribution data
  return [
    { source: 'Real Estate Agents', count: 45, percentage: 45 },
    { source: 'Title Companies', count: 28, percentage: 28 },
    { source: 'Homeowners', count: 15, percentage: 15 },
    { source: 'Property Managers', count: 8, percentage: 8 },
    { source: 'Other', count: 4, percentage: 4 }
  ];
};

export const fetchResaleConversionData = async (): Promise<ConversionRateData[]> => {
  // Mock implementation for conversion funnel data
  return [
    { stage: 'Inquiry', rate: 100, count: 100 },
    { stage: 'Form Submission', rate: 85, count: 85 },
    { stage: 'Document Review', rate: 70, count: 70 },
    { stage: 'Payment', rate: 60, count: 60 },
    { stage: 'Completion', rate: 55, count: 55 }
  ];
};

export const fetchMostRequestedDocuments = async () => {
  // Mock implementation for most requested documents
  return [
    { document: 'Association Bylaws', count: 58, percentage: 95 },
    { document: 'Financial Statements', count: 54, percentage: 88 },
    { document: 'Rules & Regulations', count: 49, percentage: 80 },
    { document: 'Insurance Certificate', count: 45, percentage: 74 },
    { document: 'Board Meeting Minutes', count: 38, percentage: 62 }
  ];
};
