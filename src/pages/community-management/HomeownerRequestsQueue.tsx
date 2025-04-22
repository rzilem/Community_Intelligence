
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
import HomeownerRequestAdvancedFilters from '@/components/homeowners/HomeownerRequestAdvancedFilters';
import HomeownerRequestBulkActions from '@/components/homeowners/HomeownerRequestBulkActions';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, Bug, Plus, RefreshCw, Loader2 } from 'lucide-react';

const HomeownerRequestsQueue = () => {
  const [open, setOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
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
    createDummyRequest,
    error,
    applyAdvancedFilters,
    resetFilters,
    selectedRequests,
    toggleRequestSelection,
    selectAllRequests,
    clearSelection,
    handleBulkStatusChange,
    handleBulkPriorityChange,
    handleBulkAssign
  } = useHomeownerRequests();

  // Load column preferences from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('homeownerRequestColumns');
    if (savedColumns) {
      setVisibleColumnIds(JSON.parse(savedColumns));
    } else {
      // Default to columns marked as defaultVisible
      setVisibleColumnIds(HOMEOWNER_REQUEST_COLUMNS.filter(col => col.defaultVisible).map(col => col.id));
    }
  }, []);

  const handleFormSuccess = () => {
    setOpen(false);
    handleRefresh();
    toast.success('Request created successfully');
  };

  const handleExport = () => {
    toast.success('Export functionality will be implemented soon');
  };

  const handleColumnChange = (selectedColumnIds: string[]) => {
    console.log("Column selection changed:", selectedColumnIds);
    setVisibleColumnIds(selectedColumnIds);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(selectedColumnIds));
  };

  const handleReorderColumns = (sourceIndex: number, destinationIndex: number) => {
    console.log("Reordering columns:", sourceIndex, "to", destinationIndex);
    const newVisibleColumns = [...visibleColumnIds];
    const [removed] = newVisibleColumns.splice(sourceIndex, 1);
    newVisibleColumns.splice(destinationIndex, 0, removed);
    setVisibleColumnIds(newVisibleColumns);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(newVisibleColumns));
  };

  const handleResetColumns = () => {
    console.log("Resetting columns to default");
    const defaultColumns = HOMEOWNER_REQUEST_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumnIds(defaultColumns);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(defaultColumns));
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <HomeownerRequestsHeader onRefresh={handleRefresh} onExport={handleExport} open={open} setOpen={setOpen} onSuccess={handleFormSuccess} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
              <Bug className="h-4 w-4 mr-2" /> 
              {showDebug ? 'Hide Debug' : 'Debug'}
            </Button>
          </div>
        </div>

        {showDebug && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
              <div className="text-xs space-y-1">
                <p><strong>Total Requests:</strong> {homeownerRequests.length}</p>
                <p><strong>Filtered Requests:</strong> {filteredRequests.length}</p>
                <p><strong>Active Tab:</strong> {activeTab}</p>
                <p><strong>Loading State:</strong> {isLoading ? 'Loading...' : 'Done'}</p>
                <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
                <p><strong>Last Refreshed:</strong> {lastRefreshed.toLocaleTimeString()}</p>
                <p><strong>Visible Columns:</strong> {visibleColumnIds.join(', ')}</p>
                <p><strong>Selected Requests:</strong> {selectedRequests.length}</p>
                <div className="mt-2">
                  <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                    Force Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {homeownerRequests.length === 0 && !isLoading && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No requests found</AlertTitle>
            <AlertDescription>
              There are no homeowner requests in the system yet. You can create a test request using the "Create Test Request" button, or wait for email requests to come in.
            </AlertDescription>
          </Alert>
        )}

        {/* Show bulk actions when requests are selected */}
        {selectedRequests.length > 0 && (
          <HomeownerRequestBulkActions
            selectedRequests={selectedRequests}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkPriorityChange={handleBulkPriorityChange}
            onBulkAssign={handleBulkAssign}
            onSelectionClear={clearSelection}
          />
        )}

        <Card>
          <CardHeader>
            <RequestsCardHeader 
              visibleColumnIds={visibleColumnIds} 
              columns={HOMEOWNER_REQUEST_COLUMNS} 
              onColumnChange={handleColumnChange} 
              onReorderColumns={handleReorderColumns} 
              onResetColumns={handleResetColumns} 
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={value => setActiveTab(value as any)}>
              <RequestsTabsList activeTab={activeTab} onTabChange={value => setActiveTab(value as any)} />
              
              <div className="flex flex-col gap-2 sm:flex-row justify-between items-start sm:items-center my-4">
                {/* Basic filters */}
                <HomeownerRequestFilters 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  priority={priority} 
                  setPriority={(value) => setPriority(value as any)} 
                  type={type} 
                  setType={(value) => setType(value as any)}
                />
                
                {/* Advanced filters */}
                <div className="flex items-center gap-2">
                  <HomeownerRequestAdvancedFilters 
                    onApplyFilters={applyAdvancedFilters}
                    onResetFilters={resetFilters}
                  />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={selectAllRequests}
                    disabled={filteredRequests.length === 0}
                  >
                    Select All
                  </Button>
                </div>
              </div>
              
              <RequestsTabContent 
                value="all" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds}
                selectedRequests={selectedRequests}
                onToggleSelection={toggleRequestSelection}
              />
              
              <RequestsTabContent 
                value="active" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds}
                selectedRequests={selectedRequests}
                onToggleSelection={toggleRequestSelection}
              />
              
              <RequestsTabContent 
                value="open" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds}
                selectedRequests={selectedRequests}
                onToggleSelection={toggleRequestSelection}
              />
              
              <RequestsTabContent 
                value="in-progress" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds}
                selectedRequests={selectedRequests}
                onToggleSelection={toggleRequestSelection}
              />
              
              <RequestsTabContent 
                value="resolved" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds}
                selectedRequests={selectedRequests}
                onToggleSelection={toggleRequestSelection}
              />
              
              <RequestsTabContent 
                value="closed" 
                isLoading={isLoading} 
                requests={filteredRequests} 
                columns={HOMEOWNER_REQUEST_COLUMNS} 
                visibleColumnIds={visibleColumnIds}
                selectedRequests={selectedRequests}
                onToggleSelection={toggleRequestSelection}
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
