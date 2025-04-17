
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import { useUserColumns } from '@/hooks/useUserColumns';
import { HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';

interface HomeownerRequestContentProps {
  filteredRequests: HomeownerRequest[];
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<HomeownerRequestStatus | 'all' | 'active'>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  type: string;
  setType: (type: string) => void;
}

const HomeownerRequestContent = ({
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
  setType
}: HomeownerRequestContentProps) => {
  const { visibleColumnIds } = useUserColumns(HOMEOWNER_REQUEST_COLUMNS, 'homeowner-requests');

  // Since we're in the content component, we'll create stub handlers that would be 
  // implemented by a parent component in a real scenario
  const handleViewRequest = (request: HomeownerRequest) => {
    console.log('View request', request.id);
  };

  const handleEditRequest = (request: HomeownerRequest) => {
    console.log('Edit request', request.id);
  };

  const handleAddComment = (request: HomeownerRequest) => {
    console.log('Add comment to request', request.id);
  };

  return (
    <>
      <HomeownerRequestFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priority={priority as any}
        setPriority={setPriority as any}
        type={type as any}
        setType={setType as any}
      />

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as HomeownerRequestStatus | 'all' | 'active')}
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
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default HomeownerRequestContent;
