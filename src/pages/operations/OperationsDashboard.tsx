
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardFilters from '@/components/operations/DashboardFilters';
import DashboardTabs from '@/components/operations/DashboardTabs';
import OpenItemsChart from '@/components/operations/OpenItemsChart';
import RequestDistributionChart from '@/components/operations/RequestDistributionChart';
import OfficeMetricsChart from '@/components/operations/OfficeMetricsChart';
import RequestTypesChart from '@/components/operations/RequestTypesChart';
import { OperationsDashboardFilters } from '@/types/operations-types';
import { useOperationsData } from '@/hooks/operations/useOperationsData';
import { toast } from 'sonner';

const OperationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [filters, setFilters] = useState<OperationsDashboardFilters>({
    timeRange: 'Last 30 Days',
    portfolio: 'All Portfolios',
    office: 'All Offices'
  });
  
  const handleFilterChange = (name: keyof OperationsDashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const { 
    timeSeriesData, 
    distributionData, 
    officeMetricsData, 
    requestTypesData, 
    loading 
  } = useOperationsData(filters);

  const handleRefresh = () => {
    toast.success("Dashboard data refreshed");
  };

  const handleExport = () => {
    toast.success("Dashboard data exported");
  };

  const tabs = ['Overview', 'Requests', 'Invoices', 'Team Performance', 'CI Insights'];

  return (
    <PageTemplate 
      title="Operations Dashboard" 
      icon={<BarChart className="h-8 w-8" />}
      description="Track all open items across associations and portfolios"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" /> 
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> 
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <DashboardFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          className="mt-4"
        />
        
        <DashboardTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OpenItemsChart data={timeSeriesData} />
            <RequestDistributionChart data={distributionData} />
            <OfficeMetricsChart data={officeMetricsData} />
            <RequestTypesChart data={requestTypesData} />
          </div>
        )}
        
        {activeTab === 'Requests' && (
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Requests Dashboard</h2>
            <p>Detailed view of all requests across associations and portfolios.</p>
            <p className="text-muted-foreground mt-4">This tab is currently under development.</p>
          </div>
        )}
        
        {activeTab === 'Invoices' && (
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Invoices Dashboard</h2>
            <p>Detailed view of all invoices across associations and portfolios.</p>
            <p className="text-muted-foreground mt-4">This tab is currently under development.</p>
          </div>
        )}
        
        {activeTab === 'Team Performance' && (
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Team Performance Dashboard</h2>
            <p>Detailed view of team performance metrics and KPIs.</p>
            <p className="text-muted-foreground mt-4">This tab is currently under development.</p>
          </div>
        )}
        
        {activeTab === 'CI Insights' && (
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-bold mb-4">CI Insights Dashboard</h2>
            <p>AI-powered insights and recommendations for operations improvement.</p>
            <p className="text-muted-foreground mt-4">This tab is currently under development.</p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default OperationsDashboard;
