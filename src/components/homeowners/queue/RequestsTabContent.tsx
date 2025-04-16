
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';

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
  // Mock handlers - these should be passed from parent in a real implementation
  const handleViewRequest = (request: HomeownerRequest) => {
    console.log('View request:', request);
  };
  
  const handleEditRequest = (request: HomeownerRequest) => {
    console.log('Edit request:', request);
  };
  
  const handleAddComment = (request: HomeownerRequest) => {
    console.log('Add comment:', request);
  };
  
  const handleViewHistory = (request: HomeownerRequest) => {
    console.log('View history:', request);
  };

  return (
    <TabsContent value={value} className="mt-0">
      {isLoading ? (
        <div className="py-8 text-center">Loading requests...</div>
      ) : (
        <HomeownerRequestsTable 
          requests={requests} 
          columns={columns}
          visibleColumnIds={visibleColumnIds}
          isLoading={isLoading}
          onViewRequest={handleViewRequest}
          onEditRequest={handleEditRequest}
          onAddComment={handleAddComment}
          onViewHistory={handleViewHistory}
        />
      )}
    </TabsContent>
  );
};

export default RequestsTabContent;
