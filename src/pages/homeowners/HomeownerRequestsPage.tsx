
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequestsTable } from '@/components/homeowners/HomeownerRequestsTable';
import { HomeownerRequestFilters } from '@/components/homeowners/HomeownerRequestFilters';
import { HomeownerRequestDetailDialog } from '@/components/homeowners/HomeownerRequestDetailDialog';
import { HomeownerRequestEditDialog } from '@/components/homeowners/dialog/HomeownerRequestEditDialog';
import { HomeownerRequestCommentDialog } from '@/components/homeowners/HomeownerRequestCommentDialog';
import { HomeownerRequestHistoryDialog } from '@/components/homeowners/HomeownerRequestHistoryDialog';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import { HOMEOWNER_REQUEST_COLUMNS, HomeownerRequest } from '@/types/homeowner-request-types';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { HomeownerRequestForm } from '@/components/homeowners/HomeownerRequestForm';
import { toast } from 'sonner';

const HomeownerRequestsPage = () => {
  const {
    filteredRequests,
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
    handleRefresh
  } = useHomeownerRequests();

  const [selectedRequest, setSelectedRequest] = React.useState<HomeownerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isCommentOpen, setIsCommentOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = React.useState(false);

  // Handle view request
  const handleViewRequest = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // Handle edit request
  const handleEditRequest = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsEditOpen(true);
  };

  // Handle add comment
  const handleAddComment = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsCommentOpen(true);
  };

  // Handle view history
  const handleViewHistory = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsHistoryOpen(true);
  };

  // Handle new request form success
  const handleNewRequestSuccess = () => {
    setIsNewRequestFormOpen(false);
    toast.success("Request created successfully!");
    handleRefresh();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Homeowner Requests</h1>
          <p className="text-muted-foreground">
            Manage and respond to homeowner requests
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button onClick={() => setIsNewRequestFormOpen(true)}>New Request</Button>
        </div>
      </div>

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
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <HomeownerRequestsTable 
            requests={filteredRequests}
            isLoading={isLoading}
            error={error}
            columns={HOMEOWNER_REQUEST_COLUMNS}
            onViewRequest={handleViewRequest}
            onEditRequest={handleEditRequest}
            onAddComment={handleAddComment}
            onViewHistory={handleViewHistory}
          />
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <HomeownerRequestDetailDialog
        request={selectedRequest}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Edit Dialog */}
      <HomeownerRequestEditDialog
        request={selectedRequest}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleRefresh}
      />

      {/* Comment Dialog */}
      <HomeownerRequestCommentDialog
        request={selectedRequest}
        open={isCommentOpen}
        onOpenChange={setIsCommentOpen}
        onSuccess={handleRefresh}
      />

      {/* History Dialog */}
      <HomeownerRequestHistoryDialog
        request={selectedRequest}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      {/* New Request Dialog */}
      {isNewRequestFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Request</h2>
            <HomeownerRequestForm onSuccess={handleNewRequestSuccess} />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsNewRequestFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeownerRequestsPage;
