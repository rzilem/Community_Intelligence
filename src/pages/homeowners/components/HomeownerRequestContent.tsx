
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import { useUserColumns } from '@/hooks/useUserColumns';
import { HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';

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
}) => {
  const { visibleColumnIds } = useUserColumns(HOMEOWNER_REQUEST_COLUMNS, 'homeowner-requests');

  return (
    <>
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
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsContent value={activeTab}>
          <HomeownerRequestsTable 
            requests={filteredRequests}
            isLoading={isLoading}
            error={error}
            columns={HOMEOWNER_REQUEST_COLUMNS}
            visibleColumnIds={visibleColumnIds}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default HomeownerRequestContent;
