
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestEditDialog from '@/components/homeowners/dialog/HomeownerRequestEditDialog';
import HomeownerRequestCommentDialog from '@/components/homeowners/HomeownerRequestCommentDialog';
import HomeownerRequestHistoryDialog from '@/components/homeowners/history/HomeownerRequestHistoryDialog';
import NewRequestDialog from '@/components/homeowners/dialog/NewRequestDialog';
import HomeownerRequestActions from '@/components/homeowners/actions/HomeownerRequestActions';
import HomeownerRequestDebugInfo from '@/components/homeowners/debug/HomeownerRequestDebugInfo';
import { HOMEOWNER_REQUEST_COLUMNS, HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import { useUserColumns } from '@/hooks/useUserColumns';

const HomeownerRequestsPage = () => {
  const { currentAssociation } = useAuth();
  const {
    filteredRequests,
    homeownerRequests,
    isLoading,
    error,
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
    createDummyRequest
  } = useHomeownerRequests();

  // Setup visibleColumnIds state
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  
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

  const updateVisibleColumns = (columnIds: string[]) => {
    console.log("Updating visible columns:", columnIds);
    setVisibleColumnIds(columnIds);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(columnIds));
  };

  const reorderColumns = (startIndex: number, endIndex: number) => {
    console.log("Reordering columns:", startIndex, "to", endIndex);
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setVisibleColumnIds(result);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(result));
  };

  const resetToDefaults = () => {
    console.log("Resetting columns to default");
    const defaultColumns = HOMEOWNER_REQUEST_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumnIds(defaultColumns);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(defaultColumns));
  };

  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  const handleViewRequest = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleEditRequest = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsEditOpen(true);
  };

  const handleAddComment = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsCommentOpen(true);
  };

  const handleViewHistory = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsHistoryOpen(true);
  };

  const handleNewRequestSuccess = () => {
    setIsNewRequestFormOpen(false);
    toast.success("Request created successfully!");
    handleRefresh();
  };

  console.log("HomeownerRequestsPage rendering with visibleColumnIds:", visibleColumnIds);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Homeowner Requests</h1>
          <p className="text-muted-foreground">
            Manage and respond to homeowner requests
          </p>
        </div>
        <HomeownerRequestActions
          isLoading={isLoading}
          showDebugInfo={showDebugInfo}
          onRefresh={handleRefresh}
          onNewRequest={() => setIsNewRequestFormOpen(true)}
          onToggleDebug={() => setShowDebugInfo(!showDebugInfo)}
          onCreateTest={createDummyRequest}
          columns={HOMEOWNER_REQUEST_COLUMNS}
          selectedColumns={visibleColumnIds}
          onColumnChange={updateVisibleColumns}
          onColumnReorder={reorderColumns}
          onColumnReset={resetToDefaults}
        />
      </div>

      {showDebugInfo && (
        <HomeownerRequestDebugInfo
          currentAssociation={currentAssociation}
          totalRequests={homeownerRequests.length}
          filteredRequests={filteredRequests.length}
          activeTab={activeTab}
          isLoading={isLoading}
          error={error}
          lastRefreshed={lastRefreshed}
          visibleColumns={visibleColumnIds}
        />
      )}

      <HomeownerRequestFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priority={priority}
        setPriority={setPriority}
        type={type}
        setType={setType}
      />

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as any)}
        className="mt-6"
      >
        <TabsContent value={activeTab}>
          <HomeownerRequestsTable 
            requests={filteredRequests}
            isLoading={isLoading}
            error={error}
            columns={HOMEOWNER_REQUEST_COLUMNS}
            visibleColumnIds={visibleColumnIds}
            onViewRequest={handleViewRequest}
            onEditRequest={handleEditRequest}
            onAddComment={handleAddComment}
            onViewHistory={handleViewHistory}
          />
        </TabsContent>
      </Tabs>

      <HomeownerRequestDetailDialog
        request={selectedRequest}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <HomeownerRequestEditDialog
        request={selectedRequest}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleRefresh}
      />

      <HomeownerRequestCommentDialog
        request={selectedRequest}
        open={isCommentOpen}
        onOpenChange={setIsCommentOpen}
        onSuccess={handleRefresh}
      />

      <HomeownerRequestHistoryDialog
        request={selectedRequest}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      <NewRequestDialog
        isOpen={isNewRequestFormOpen}
        onClose={() => setIsNewRequestFormOpen(false)}
        onSuccess={handleNewRequestSuccess}
      />
    </div>
  );
};

export default HomeownerRequestsPage;
