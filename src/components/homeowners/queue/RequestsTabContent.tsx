
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
  return (
    <TabsContent value={value} className="mt-0">
      {isLoading ? (
        <div className="py-8 text-center">Loading requests...</div>
      ) : (
        <HomeownerRequestsTable 
          requests={requests} 
          columns={columns}
          visibleColumnIds={visibleColumnIds}
        />
      )}
    </TabsContent>
  );
};

export default RequestsTabContent;
