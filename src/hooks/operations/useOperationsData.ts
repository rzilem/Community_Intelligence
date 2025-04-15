
import { useState, useEffect } from 'react';
import { OperationsDashboardFilters } from '@/types/operations-types';

export interface TimeSeriesItem {
  date: string;
  openItems: number;
  closedItems: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface OfficeMetric {
  office: string;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface RequestTypeItem {
  name: string;
  value: number;
}

export const useOperationsData = (filters: OperationsDashboardFilters) => {
  const [loading, setLoading] = useState(true);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesItem[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionItem[]>([]);
  const [officeMetricsData, setOfficeMetricsData] = useState<OfficeMetric[]>([]);
  const [requestTypesData, setRequestTypesData] = useState<RequestTypeItem[]>([]);

  // Function to generate mock time series data
  const generateTimeSeriesData = () => {
    const days = filters.timeRange === 'Last 30 Days' ? 30 : 
                filters.timeRange === 'Last 90 Days' ? 90 : 7;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        openItems: Math.floor(Math.random() * 50) + 20,
        closedItems: Math.floor(Math.random() * 30) + 10
      };
    });
  };

  // Function to generate mock distribution data
  const generateDistributionData = () => {
    return [
      { name: 'Maintenance', value: Math.floor(Math.random() * 50) + 30 },
      { name: 'Compliance', value: Math.floor(Math.random() * 40) + 20 },
      { name: 'Accounting', value: Math.floor(Math.random() * 30) + 15 },
      { name: 'Admin', value: Math.floor(Math.random() * 20) + 10 }
    ];
  };

  // Function to generate mock office metrics
  const generateOfficeMetricsData = () => {
    const offices = filters.office === 'All Offices' 
      ? ['North Region', 'South Region', 'East Region', 'West Region'] 
      : [filters.office];
    
    return offices.map(office => ({
      office,
      pending: Math.floor(Math.random() * 30) + 5,
      inProgress: Math.floor(Math.random() * 25) + 10,
      completed: Math.floor(Math.random() * 40) + 30
    }));
  };

  // Function to generate mock request types data
  const generateRequestTypesData = () => {
    return [
      { name: 'Repairs', value: Math.floor(Math.random() * 40) + 30 },
      { name: 'Inspections', value: Math.floor(Math.random() * 30) + 20 },
      { name: 'Approvals', value: Math.floor(Math.random() * 25) + 15 },
      { name: 'Complaints', value: Math.floor(Math.random() * 20) + 10 },
      { name: 'Other', value: Math.floor(Math.random() * 15) + 5 }
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
