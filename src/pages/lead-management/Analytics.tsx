
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
import { LineChart } from 'lucide-react';
import { useLeadAnalytics } from '@/hooks/analytics/useLeadAnalytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import LeadSourceChart from '@/components/analytics/LeadSourceChart';
import ConversionFunnelChart from '@/components/analytics/ConversionFunnelChart';
import LeadTimeSeriesChart from '@/components/analytics/LeadTimeSeriesChart';
import AnalyticsSummaryCards from '@/components/analytics/AnalyticsSummaryCards';

const Analytics = () => {
  const { 
    sourceDistribution, 
    conversionRates, 
    timeSeriesData, 
    analyticsSummary,
    statusDistribution,
    isLoading 
  } = useLeadAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <PageTemplate 
          title="Analytics" 
          icon={<LineChart className="h-8 w-8" />}
          description="View detailed marketing and lead conversion analytics."
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </PageTemplate>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTemplate 
        title="Analytics" 
        icon={<LineChart className="h-8 w-8" />}
        description="View detailed marketing and lead conversion analytics."
      >
        <div className="space-y-6">
          <AnalyticsSummaryCards data={analyticsSummary} />
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sources">Lead Sources</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeadTimeSeriesChart data={timeSeriesData} />
                <LeadSourceChart data={sourceDistribution} />
              </div>
              <ConversionFunnelChart data={conversionRates} />
            </TabsContent>
            
            <TabsContent value="sources">
              <LeadSourceChart data={sourceDistribution} className="h-[500px]" />
            </TabsContent>
            
            <TabsContent value="conversion">
              <ConversionFunnelChart data={conversionRates} className="h-[500px]" />
            </TabsContent>
            
            <TabsContent value="trends">
              <LeadTimeSeriesChart data={timeSeriesData} className="h-[500px]" />
            </TabsContent>
          </Tabs>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Analytics;
