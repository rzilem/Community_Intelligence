
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResaleAnalytics } from '@/hooks/resale/useResaleAnalytics';
import StatCard from '@/components/dashboard/StatCard';
import AnalyticsTabs from '@/components/resale/analytics/AnalyticsTabs';

const ResaleAnalytics = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const { 
    transactionStats,
    timeSeriesData,
    sourceData,
    conversionData,
    requestedDocuments,
    isLoading
  } = useResaleAnalytics(timeRange);

  // Mock data for additional reports
  const monthlyTrendData = [
    { month: 'Jan', certificates: 12, questionnaires: 8, inspections: 5 },
    { month: 'Feb', certificates: 15, questionnaires: 10, inspections: 7 },
    { month: 'Mar', certificates: 18, questionnaires: 12, inspections: 9 },
    { month: 'Apr', certificates: 22, questionnaires: 15, inspections: 12 },
    { month: 'May', certificates: 28, questionnaires: 18, inspections: 14 },
    { month: 'Jun', certificates: 32, questionnaires: 22, inspections: 16 },
  ];

  const paymentData = [
    { month: 'Jan', collected: 3500, pending: 1200 },
    { month: 'Feb', collected: 4200, pending: 1500 },
    { month: 'Mar', collected: 4800, pending: 1800 },
    { month: 'Apr', collected: 5500, pending: 2100 },
    { month: 'May', collected: 6300, pending: 1700 },
    { month: 'Jun', collected: 7200, pending: 2300 },
  ];

  const communityData = [
    { name: 'Oakwood Heights', certificates: 28, questionnaires: 22 },
    { name: 'Riverdale Gardens', certificates: 22, questionnaires: 18 },
    { name: 'Highland Park', certificates: 18, questionnaires: 14 },
    { name: 'Meadowbrook', certificates: 15, questionnaires: 12 },
    { name: 'Sunset Ridge', certificates: 12, questionnaires: 10 },
  ];

  return (
    <PageTemplate 
      title="Resale Analytics" 
      icon={<BarChart className="h-8 w-8" />}
      description="Track performance metrics and reports for resale operations."
      actions={
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard
          title="Total Transactions"
          value={transactionStats?.totalTransactions.toString() || "0"}
          icon={props => <BarChart {...props} />}
          trend={{ 
            value: 12, 
            isPositive: true
          }}
          description="From previous period"
        />

        <StatCard
          title="Total Revenue"
          value={`$${transactionStats?.totalRevenue.toLocaleString() || "0"}`}
          icon={props => <BarChart {...props} />}
          trend={{ 
            value: 8, 
            isPositive: true
          }}
          description="From previous period"
        />

        <StatCard
          title="Average Turnaround"
          value={`${transactionStats?.averageTime || "0"} days`}
          icon={props => <BarChart {...props} />}
          trend={{ 
            value: 0.5, 
            isPositive: false
          }}
          description="Faster than previous period"
        />

        <StatCard
          title="Conversion Rate"
          value={`${transactionStats?.conversionRate || "0"}%`}
          icon={props => <BarChart {...props} />}
          trend={{ 
            value: 5, 
            isPositive: true
          }}
          description="From previous period"
        />
      </div>

      <AnalyticsTabs
        timeSeriesData={timeSeriesData}
        sourceData={sourceData}
        conversionData={conversionData}
        requestedDocuments={requestedDocuments}
        monthlyTrendData={monthlyTrendData}
        paymentData={paymentData}
        communityData={communityData}
      />
    </PageTemplate>
  );
};

export default ResaleAnalytics;
