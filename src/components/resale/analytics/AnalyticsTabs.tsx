
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Calendar, FileText, ClipboardList, Search, Receipt, ListOrdered } from 'lucide-react';
import OverviewTab from './OverviewTab';
import CertificatesTab from './CertificatesTab';
import QuestionnairesTab from './QuestionnairesTab';
import InspectionsTab from './InspectionsTab';
import StatementsTab from './StatementsTab';
import OrderQueueTab from './OrderQueueTab';
import { TimeSeriesData, LeadSourceData, ConversionRateData } from '@/types/analytics-types';

interface AnalyticsTabsProps {
  timeSeriesData: TimeSeriesData[];
  sourceData: LeadSourceData[];
  conversionData: ConversionRateData[];
  requestedDocuments: any[];
  monthlyTrendData: any[];
  paymentData: any[];
  communityData: any[];
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  timeSeriesData,
  sourceData,
  conversionData,
  requestedDocuments,
  monthlyTrendData,
  paymentData,
  communityData
}) => {
  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="w-full border-b pb-0 mb-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" /> Overview
        </TabsTrigger>
        <TabsTrigger value="certificates" className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> Certificates
        </TabsTrigger>
        <TabsTrigger value="questionnaires" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" /> Questionnaires
        </TabsTrigger>
        <TabsTrigger value="inspections" className="flex items-center gap-2">
          <Search className="h-4 w-4" /> Inspections
        </TabsTrigger>
        <TabsTrigger value="statements" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" /> Statements
        </TabsTrigger>
        <TabsTrigger value="orderqueue" className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4" /> Order Queue
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTab 
          timeSeriesData={timeSeriesData}
          sourceData={sourceData}
          conversionData={conversionData}
          requestedDocuments={requestedDocuments}
        />
      </TabsContent>
      
      <TabsContent value="certificates">
        <CertificatesTab 
          monthlyTrendData={monthlyTrendData}
          communityData={communityData}
        />
      </TabsContent>
      
      <TabsContent value="questionnaires">
        <QuestionnairesTab 
          monthlyTrendData={monthlyTrendData}
          communityData={communityData}
        />
      </TabsContent>
      
      <TabsContent value="inspections">
        <InspectionsTab
          monthlyTrendData={monthlyTrendData}
        />
      </TabsContent>
      
      <TabsContent value="statements">
        <StatementsTab
          paymentData={paymentData}
        />
      </TabsContent>
      
      <TabsContent value="orderqueue">
        <OrderQueueTab />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsTabs;
