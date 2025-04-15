
import { useState, useEffect } from 'react';
import { 
  OperationsDashboardFilters, 
  OperationsTimeSeriesData, 
  RequestDistributionData, 
  OfficeMetricsData, 
  RequestTypeData 
} from '@/types/operations-types';

export const useOperationsData = (filters: OperationsDashboardFilters) => {
  const [loading, setLoading] = useState(true);
  const [timeSeriesData, setTimeSeriesData] = useState<OperationsTimeSeriesData[]>([]);
  const [distributionData, setDistributionData] = useState<RequestDistributionData[]>([]);
  const [officeMetricsData, setOfficeMetricsData] = useState<OfficeMetricsData[]>([]);
  const [requestTypesData, setRequestTypesData] = useState<RequestTypeData[]>([]);

  // Function to generate mock time series data
  const generateTimeSeriesData = () => {
    const days = filters.timeRange === 'Last 30 Days' ? 6 : 
                filters.timeRange === 'Last 90 Days' ? 9 : 3;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (days - i - 1));
      const month = date.toLocaleString('default', { month: 'short' });
      
      return {
        month,
        invoices: Math.floor(Math.random() * 50) + 20,
        arcRequests: Math.floor(Math.random() * 40) + 15,
        gateRequests: Math.floor(Math.random() * 30) + 10,
        poolRequests: Math.floor(Math.random() * 25) + 5,
        generalInquiries: Math.floor(Math.random() * 35) + 10
      };
    });
  };

  // Function to generate mock distribution data
  const generateDistributionData = () => {
    return [
      { type: 'Single-Family', percentage: 45, color: '#8884d8' },
      { type: 'Condos', percentage: 25, color: '#82ca9d' },
      { type: 'Townhomes', percentage: 20, color: '#ffc658' },
      { type: 'Mixed Use', percentage: 10, color: '#ff8042' }
    ];
  };

  // Function to generate mock office metrics
  const generateOfficeMetricsData = () => {
    const offices = filters.office === 'All Offices' 
      ? ['North Region', 'South Region', 'East Region', 'West Region'] 
      : [filters.office];
    
    return offices.map(office => ({
      office,
      openRequests: Math.floor(Math.random() * 100) + 20,
      color: office === 'North Region' ? '#8884d8' : 
             office === 'South Region' ? '#82ca9d' : 
             office === 'East Region' ? '#ffc658' : '#ff8042'
    }));
  };

  // Function to generate mock request types data
  const generateRequestTypesData = () => {
    return [
      { type: 'Repairs', count: 125, percentage: 35, color: '#8884d8' },
      { type: 'Inspections', count: 85, percentage: 25, color: '#82ca9d' },
      { type: 'Approvals', count: 65, percentage: 20, color: '#ffc658' },
      { type: 'Complaints', count: 45, percentage: 15, color: '#ff8042' },
      { type: 'Other', count: 25, percentage: 5, color: '#666' }
    ];
  };

  // Function to load all data
  const loadData = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTimeSeriesData(generateTimeSeriesData());
      setDistributionData(generateDistributionData());
      setOfficeMetricsData(generateOfficeMetricsData());
      setRequestTypesData(generateRequestTypesData());
    } catch (error) {
      console.error('Error loading operations data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data, exposed to components
  const refreshData = async () => {
    await loadData();
  };
  
  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [filters.timeRange, filters.portfolio, filters.office]);
  
  return {
    loading,
    timeSeriesData,
    distributionData,
    officeMetricsData,
    requestTypesData,
    refreshData
  };
};
