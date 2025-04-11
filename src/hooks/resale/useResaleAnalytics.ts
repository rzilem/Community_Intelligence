
import { useQuery } from '@tanstack/react-query';
import { 
  fetchResaleTransactionData, 
  fetchResaleTimeSeriesData,
  fetchResaleSourceData,
  fetchResaleConversionData,
  fetchMostRequestedDocuments
} from '@/services/resale/resale-analytics-service';
import { TimeSeriesData, LeadSourceData, ConversionRateData } from '@/types/analytics-types';

export const useResaleAnalytics = (
  timeRange: string = 'monthly',
  associationId?: string
) => {
  // Query for overall stats
  const { 
    data: transactionStats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['resale-transaction-stats', timeRange, associationId],
    queryFn: () => fetchResaleTransactionData(timeRange, associationId),
  });

  // Query for time series data
  const {
    data: timeSeriesData = [],
    isLoading: isLoadingTimeSeries,
    error: timeSeriesError
  } = useQuery({
    queryKey: ['resale-time-series', timeRange],
    queryFn: () => fetchResaleTimeSeriesData(timeRange),
  });

  // Query for source distribution data
  const {
    data: sourceData = [],
    isLoading: isLoadingSourceData,
    error: sourceDataError
  } = useQuery({
    queryKey: ['resale-source-data'],
    queryFn: fetchResaleSourceData,
  });

  // Query for conversion funnel data
  const {
    data: conversionData = [],
    isLoading: isLoadingConversionData,
    error: conversionDataError
  } = useQuery({
    queryKey: ['resale-conversion-data'],
    queryFn: fetchResaleConversionData,
  });

  // Query for most requested documents
  const {
    data: requestedDocuments = [],
    isLoading: isLoadingRequestedDocs,
    error: requestedDocsError
  } = useQuery({
    queryKey: ['resale-requested-documents'],
    queryFn: fetchMostRequestedDocuments,
  });

  return {
    transactionStats,
    timeSeriesData,
    sourceData,
    conversionData,
    requestedDocuments,
    isLoading: 
      isLoadingStats || 
      isLoadingTimeSeries || 
      isLoadingSourceData || 
      isLoadingConversionData || 
      isLoadingRequestedDocs,
    error: 
      statsError || 
      timeSeriesError || 
      sourceDataError || 
      conversionDataError || 
      requestedDocsError
  };
};
