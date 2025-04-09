
import { useState, useEffect } from 'react';
import { 
  OperationsTimeSeriesData, 
  RequestDistributionData, 
  OfficeMetricsData,
  RequestTypeData,
  OperationsDashboardFilters
} from '@/types/operations-types';
import { getMonthsRange, getRandomInt } from '@/lib/utils';

export const useOperationsData = (filters: OperationsDashboardFilters) => {
  const [timeSeriesData, setTimeSeriesData] = useState<OperationsTimeSeriesData[]>([]);
  const [distributionData, setDistributionData] = useState<RequestDistributionData[]>([]);
  const [officeMetricsData, setOfficeMetricsData] = useState<OfficeMetricsData[]>([]);
  const [requestTypesData, setRequestTypesData] = useState<RequestTypeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      // Generate time series data
      const months = getMonthsRange(7); // Last 7 months
      const generatedTimeSeriesData = months.map(month => ({
        month,
        invoices: getRandomInt(30, 80),
        arcRequests: getRandomInt(20, 40),
        gateRequests: getRandomInt(25, 50),
        poolRequests: getRandomInt(20, 40),
        generalInquiries: getRandomInt(40, 60)
      }));
      
      // Generate distribution data
      const generatedDistributionData = [
        { type: 'Single-Family', percentage: 45, color: '#0088FE' },
        { type: 'Condos', percentage: 30, color: '#00C49F' },
        { type: 'Townhomes', percentage: 15, color: '#FFBB28' },
        { type: 'Mixed-Use', percentage: 10, color: '#FF8042' }
      ];
      
      // Generate office metrics data
      const generatedOfficeMetricsData = [
        { office: 'Austin', openRequests: getRandomInt(130, 180), color: '#8884d8' },
        { office: 'Round Rock', openRequests: getRandomInt(100, 140), color: '#82ca9d' }
      ];
      
      // Generate request types data
      const generatedRequestTypesData = [
        { type: 'Invoices', count: 125, percentage: 40, color: '#8884d8' },
        { type: 'ARC Requests', count: 98, percentage: 25, color: '#82ca9d' },
        { type: 'Gate Requests', count: 65, percentage: 15, color: '#ffc658' },
        { type: 'Pool Requests', count: 48, percentage: 12, color: '#ff8042' },
        { type: 'General', count: 32, percentage: 8, color: '#0088fe' }
      ];
      
      setTimeSeriesData(generatedTimeSeriesData);
      setDistributionData(generatedDistributionData);
      setOfficeMetricsData(generatedOfficeMetricsData);
      setRequestTypesData(generatedRequestTypesData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [filters]);
  
  return { timeSeriesData, distributionData, officeMetricsData, requestTypesData, loading };
};
