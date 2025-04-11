
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';
import HomeownerRequestsHeader from '@/components/homeowners/queue/HomeownerRequestsHeader';
import RequestsCardHeader from '@/components/homeowners/queue/RequestsCardHeader';
import RequestsTabsList from '@/components/homeowners/queue/RequestsTabsList';
import RequestsTabContent from '@/components/homeowners/queue/RequestsTabContent';
import RequestsStatusFooter from '@/components/homeowners/queue/RequestsStatusFooter';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';

const HomeownerRequestsQueue = () => {
  const [open, setOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    HOMEOWNER_REQUEST_COLUMNS.filter(col => col.defaultVisible).map(col => col.id)
  );

  const {
    filteredRequests,
    isLoading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    priority,
    setPriority,
    type,
    setType,
    lastRefreshed,
    handleRefresh,
    homeownerRequests,
    refetch
  } = useHomeownerRequests();

  const handleFormSuccess = () => {
    setOpen(false);
    refetch();
    toast.success('Request created successfully');
  };

  const handleExport = () => {
    toast.success('Export functionality will be implemented soon');
  };

  const handleColumnChange = (selectedColumnIds: string[]) => {
    setVisibleColumnIds(selectedColumnIds);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(selectedColumnIds));
  };

  const handleReorderColumns = (sourceIndex: number, destinationIndex: number) => {
    const newVisibleColumns = [...visibleColumnIds];
    const [removed] = newVisibleColumns.splice(sourceIndex, 1);
    newVisibleColumns.splice(destinationIndex, 0, removed);
    
    setVisibleColumnIds(newVisibleColumns);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(newVisibleColumns));
  };

  // Load column preferences from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('homeownerRequestColumns');
    if (savedColumns) {
      setVisibleColumnIds(JSON.parse(savedColumns));
    }
  }, []);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <HomeownerRequestsHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          open={open}
          setOpen={setOpen}
          onSuccess={handleFormSuccess}
        />

        <Card>
          <CardHeader>
            <RequestsCardHeader
              visibleColumnIds={visibleColumnIds}
              columns={HOMEOWNER_REQUEST_COLUMNS}
              onColumnChange={handleColumnChange}
              onReorderColumns={handleReorderColumns}
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <RequestsTabsList 
                activeTab={activeTab} 
                onTabChange={(value) => setActiveTab(value as any)} 
              />
              
              <HomeownerRequestFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                status={activeTab}
                setStatus={setActiveTab}
                priority={priority}
                setPriority={setPriority}
                type={type}
                setType={setType}
              />
              
              <RequestsTabContent 
                value="all" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds} 
              />
              
              <RequestsTabContent 
                value="open" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds} 
              />
              
              <RequestsTabContent 
                value="in-progress" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds} 
              />
              
              <RequestsTabContent 
                value="resolved" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds} 
              />
              
              <RequestsTabContent 
                value="closed" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds} 
              />
            </Tabs>
            
            <RequestsStatusFooter
              filteredCount={filteredRequests.length}
              totalCount={homeownerRequests.length}
              lastRefreshed={lastRefreshed}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HomeownerRequestsQueue;
