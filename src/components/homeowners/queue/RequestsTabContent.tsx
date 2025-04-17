
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestEditDialog from '@/components/homeowners/dialog/HomeownerRequestEditDialog';
import HomeownerRequestCommentDialog from '@/components/homeowners/HomeownerRequestCommentDialog';
import { toast } from 'sonner';

interface RequestsTabContentProps {
  value: string;
  isLoading: boolean;
  requests: HomeownerRequest[];
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({ 
  value, 
  isLoading, 
  requests, 
  columns, 
  visibleColumnIds 
}) => {
  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  
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
  
  const handleRequestUpdated = () => {
    toast.success('Request updated successfully');
    // The parent component will auto-refresh data
  };

  return (
    <TabsContent value={value} className="mt-0">
      {isLoading ? (
        <div className="py-8 text-center">Loading requests...</div>
      ) : (
        <>
          <HomeownerRequestsTable 
            requests={requests} 
            columns={columns}
            visibleColumnIds={visibleColumnIds}
            isLoading={isLoading}
            onViewRequest={handleViewRequest}
            onEditRequest={handleEditRequest}
            onAddComment={handleAddComment}
          />
          
          {/* Dialogs */}
          <HomeownerRequestDetailDialog
            request={selectedRequest}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
          />
          
          <HomeownerRequestEditDialog
            request={selectedRequest}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSuccess={handleRequestUpdated}
          />
          
          <HomeownerRequestCommentDialog
            request={selectedRequest}
            open={isCommentOpen}
            onOpenChange={setIsCommentOpen}
            onSuccess={handleRequestUpdated}
          />
        </>
      )}
    </TabsContent>
  );
};

export default RequestsTabContent;
