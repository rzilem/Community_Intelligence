
import React, { useState, useEffect } from 'react';
import { 
  HomeownerRequestStatus, 
  HomeownerRequestPriority,
  HomeownerRequestType
} from '@/types/homeowner-request-types';
import { FileText, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageTemplate from '@/components/layout/PageTemplate';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import RequestsTabsList from '@/components/homeowners/queue/RequestsTabsList';
import RequestsTabContent from '@/components/homeowners/queue/RequestsTabContent';
import NewRequestDialog from '@/components/homeowners/dialog/NewRequestDialog';
import HomeownerRequestAdvancedFilters from '@/components/homeowners/HomeownerRequestAdvancedFilters';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import { useRequestColumns } from '@/hooks/homeowners/useRequestColumns';

const HomeownerRequestsQueue = () => {
  const [view, setView] = useState<'table' | 'queue'>('table');
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in-progress' | 'closed' | 'rejected'>('open');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<HomeownerRequestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<HomeownerRequestPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<HomeownerRequestType | 'all'>('all');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  });
  
  // Get columns config and requests data
  const { columns, visibleColumns, toggleColumn } = useRequestColumns();
  const { 
    homeownerRequests: requests, 
    filteredRequests,
    isLoading, 
    error,
    handleRefresh: refreshRequests,
    handleBulkStatusChange: updateRequestStatus, // Using handleBulkStatusChange as onStatusChange
    activeTab: requestsActiveTab,
    setActiveTab: setRequestsActiveTab,
    // Using dummy data for requestCounts if not available
    lastRefreshed
  } = useHomeownerRequests();
  
  // Set up request counts object based on filtered data
  const requestCounts = {
    all: filteredRequests.length,
    open: filteredRequests.filter(r => r.status === 'open').length,
    inProgress: filteredRequests.filter(r => r.status === 'in-progress').length,
    closed: filteredRequests.filter(r => r.status === 'closed').length,
    rejected: filteredRequests.filter(r => r.status === 'rejected').length
  };
  
  // Reset selected requests when tab or filters change
  useEffect(() => {
    setSelectedRequestIds([]);
  }, [activeTab, statusFilter, priorityFilter, typeFilter, searchTerm]);
  
  const getStatusFromTab = (tab: string): HomeownerRequestStatus | 'all' | 'active' => {
    switch(tab) {
      case 'open': return 'open';
      case 'in-progress': return 'in-progress'; 
      case 'closed': return 'closed';
      case 'rejected': return 'rejected';
      default: return 'all';
    }
  };

  const getFilteredRequests = () => {
    if (view === 'table') {
      return filteredRequests;
    }
    
    // For queue view, filter by active tab
    if (activeTab === 'all') {
      return filteredRequests;
    }
    
    const tabStatus = getStatusFromTab(activeTab);
    if (tabStatus === 'all' || tabStatus === 'active') {
      return filteredRequests;
    }
    
    return filteredRequests.filter(req => req.status === tabStatus);
  };

  const handleToggleRequestSelection = (id: string) => {
    if (selectedRequestIds.includes(id)) {
      setSelectedRequestIds(selectedRequestIds.filter(requestId => requestId !== id));
    } else {
      setSelectedRequestIds([...selectedRequestIds, id]);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setAssignedToFilter('');
    setDateRangeFilter({
      startDate: null,
      endDate: null
    });
  };

  // Function to handle status changes for individual requests
  const handleStatusChange = (id: string, status: string) => {
    updateRequestStatus(status, [id]);
  };

  return (
    <PageTemplate
      title="Homeowner Requests"
      icon={<FileText className="h-8 w-8" />}
      description="Manage and respond to homeowner requests and inquiries."
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowNewRequestDialog(true)}
          >
            New Request
          </Button>
        </div>
      }
    >
      {/* Basic filters */}
      <HomeownerRequestFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />
      
      {/* Advanced filters */}
      {showFilters && (
        <HomeownerRequestAdvancedFilters
          assignedToFilter={assignedToFilter}
          onAssignedToChange={setAssignedToFilter}
          dateRangeFilter={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          onClearFilters={handleClearFilters}
        />
      )}
      
      {/* View toggle */}
      <Tabs 
        value={view} 
        onValueChange={(v) => setView(v as 'table' | 'queue')}
        className="mt-4"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="queue">Queue View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="mt-0">
          <HomeownerRequestsTable
            requests={getFilteredRequests()}
            isLoading={isLoading}
            error={error}
            columns={visibleColumns}
            visibleColumnIds={visibleColumns.map(col => col.id)}
            onViewRequest={(req) => console.log('View request', req.id)}
            onEditRequest={(req) => console.log('Edit request', req.id)}
            onStatusChange={handleStatusChange}
            onRefresh={refreshRequests}
            selectedRequestIds={selectedRequestIds}
            setSelectedRequestIds={setSelectedRequestIds}
            toggleSelectRequest={handleToggleRequestSelection}
            onToggleColumn={toggleColumn}
          />
        </TabsContent>
        
        <TabsContent value="queue" className="mt-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <RequestsTabsList
              requestCounts={requestCounts}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as any)}
            />
            
            <div className="mt-4 grid gap-4 grid-cols-1">
              <RequestsTabContent
                status={getStatusFromTab(activeTab) as string}
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests`}
                requests={getFilteredRequests()}
                totalCount={
                  activeTab === 'all'
                    ? requestCounts.all
                    : activeTab === 'open'
                    ? requestCounts.open
                    : activeTab === 'in-progress'
                    ? requestCounts.inProgress
                    : activeTab === 'closed'
                    ? requestCounts.closed
                    : requestCounts.rejected
                }
                isLoading={isLoading}
                onStatusChange={handleStatusChange}
                columns={visibleColumns}
                selectedRequestIds={selectedRequestIds}
                setSelectedRequestIds={setSelectedRequestIds}
                toggleSelectRequest={handleToggleRequestSelection}
              />
            </div>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      <NewRequestDialog
        isOpen={showNewRequestDialog}
        onClose={() => setShowNewRequestDialog(false)}
        onSuccess={() => {
          refreshRequests();
          setShowNewRequestDialog(false);
          return Promise.resolve(true);
        }}
      />
    </PageTemplate>
  );
};

export default HomeownerRequestsQueue;
