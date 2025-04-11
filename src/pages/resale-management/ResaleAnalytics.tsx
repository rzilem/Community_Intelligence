
import React, { useState } from 'react';
import { BarChart, CircleDollarSign, FileBarChart, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/dashboard/StatCard';
import { useQuery } from '@tanstack/react-query';
import LeadTimeSeriesChart from '@/components/analytics/LeadTimeSeriesChart';
import LeadSourceChart from '@/components/analytics/LeadSourceChart';
import ConversionFunnelChart from '@/components/analytics/ConversionFunnelChart';
import { TimeSeriesData, LeadSourceData, ConversionRateData } from '@/types/analytics-types';

const ResaleAnalytics = () => {
  const [timeRange, setTimeRange] = useState<string>('monthly');
  
  // Mock data - in a real implementation, this would come from an API
  const { data: resaleStats } = useQuery({
    queryKey: ['resale-analytics', timeRange],
    queryFn: async (): Promise<{
      totalTransactions: number;
      revenue: number;
      averageProcessingTime: number;
      pendingOrders: number;
      transactionTrend: { value: number; isPositive: boolean };
      revenueTrend: { value: number; isPositive: boolean };
      processingTimeTrend: { value: number; isPositive: boolean };
      pendingOrdersTrend: { value: number; isPositive: boolean };
    }> => {
      // This would be replaced with an actual API call
      return {
        totalTransactions: 1284,
        revenue: 257950,
        averageProcessingTime: 2.5,
        pendingOrders: 38,
        transactionTrend: { value: 12.5, isPositive: true },
        revenueTrend: { value: 15.2, isPositive: true },
        processingTimeTrend: { value: 8.3, isPositive: false },
        pendingOrdersTrend: { value: 5.7, isPositive: false }
      };
    },
    placeholderData: {
      totalTransactions: 0,
      revenue: 0,
      averageProcessingTime: 0,
      pendingOrders: 0,
      transactionTrend: { value: 0, isPositive: true },
      revenueTrend: { value: 0, isPositive: true },
      processingTimeTrend: { value: 0, isPositive: true },
      pendingOrdersTrend: { value: 0, isPositive: true }
    }
  });

  const mockTimeSeriesData: TimeSeriesData[] = [
    { date: 'Jan', new_leads: 65, converted_leads: 45 },
    { date: 'Feb', new_leads: 80, converted_leads: 53 },
    { date: 'Mar', new_leads: 95, converted_leads: 68 },
    { date: 'Apr', new_leads: 120, converted_leads: 85 },
    { date: 'May', new_leads: 110, converted_leads: 80 },
    { date: 'Jun', new_leads: 140, converted_leads: 100 }
  ];

  const mockSourceData: LeadSourceData[] = [
    { source: 'Resale Certificate', count: 250 },
    { source: 'Condo Questionnaire', count: 175 },
    { source: 'Account Statements', count: 150 },
    { source: 'Property Inspection', count: 125 },
    { source: 'TREC Forms', count: 85 }
  ];

  const mockConversionData: ConversionRateData[] = [
    { stage: 'Request', count: 1250, rate: 100 },
    { stage: 'Processing', count: 1050, rate: 84 },
    { stage: 'Completed', count: 950, rate: 76 },
    { stage: 'Delivered', count: 900, rate: 72 },
    { stage: 'Paid', count: 875, rate: 70 }
  ];

  return (
    <PageTemplate
      title="Resale Analytics"
      icon={<BarChart className="h-8 w-8" />}
      description="Track performance metrics for resale documentation services"
    >
      <div className="mb-6">
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="ml-auto">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Transactions Stat Card */}
        <StatCard
          title="Total Transactions"
          value={resaleStats?.totalTransactions.toLocaleString() || "0"}
          icon={FileBarChart}
          trend={resaleStats?.transactionTrend}
        />
        
        {/* Revenue Stat Card */}
        <StatCard
          title="Revenue"
          value={`$${resaleStats?.revenue.toLocaleString() || "0"}`}
          icon={CircleDollarSign}
          trend={resaleStats?.revenueTrend}
        />
        
        {/* Average Processing Time Stat Card */}
        <StatCard
          title="Avg. Processing Time"
          value={`${resaleStats?.averageProcessingTime || "0"} days`}
          icon={Calendar}
          trend={resaleStats?.processingTimeTrend}
          trendDescription={resaleStats?.processingTimeTrend?.isPositive ? "Slower than last period" : "Faster than last period"}
          inverseTrend
        />
        
        {/* Pending Orders Stat Card */}
        <StatCard
          title="Pending Orders"
          value={resaleStats?.pendingOrders.toString() || "0"}
          icon={ArrowDown}
          trend={resaleStats?.pendingOrdersTrend}
          trendDescription={resaleStats?.pendingOrdersTrend?.isPositive ? "More than last period" : "Fewer than last period"}
          inverseTrend
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LeadTimeSeriesChart 
          data={mockTimeSeriesData} 
          className="h-[400px]"
        />

        <LeadSourceChart 
          data={mockSourceData} 
          className="h-[400px]"
        />
      </div>

      <ConversionFunnelChart 
        data={mockConversionData} 
        className="h-[400px] mb-8"
      />

      <Card>
        <CardHeader>
          <CardTitle>Document Fulfillment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Most Requested Documents</h3>
              <div className="bg-gray-50 rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span>Bylaws</span>
                  <span className="font-semibold">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>CC&Rs</span>
                  <span className="font-semibold">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Financial Statements</span>
                  <span className="font-semibold">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Reserve Study</span>
                  <span className="font-semibold">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Insurance Declarations</span>
                  <span className="font-semibold">62%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Revenue by Document Type</h3>
              <div className="bg-gray-50 rounded-md p-4 h-64 flex items-center justify-center">
                <p className="text-gray-500">Pie chart showing revenue distribution across document types</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default ResaleAnalytics;
