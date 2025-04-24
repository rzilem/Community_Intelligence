
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import { useUserColumns } from '@/hooks/useUserColumns';
import { HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import LiveStatusDot from "@/components/common/LiveStatusDot";
import { useHomeownerRequestsRealtime } from "@/hooks/homeowners/useHomeownerRequestsRealtime";
import { useAuth } from "@/contexts/auth";
import { openDetailDialog, openHistoryDialog } from './HomeownerRequestDialogs';

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
  const { currentAssociation } = useAuth();
  const [realtimeActive, setRealtimeActive] = React.useState(false);

  useHomeownerRequestsRealtime(currentAssociation?.id, () => {
    setRealtimeActive(true);
    setTimeout(() => setRealtimeActive(false), 2000);
  });

  // Handle view request (eye icon button)
  const handleViewRequest = (request: HomeownerRequest) => {
    openDetailDialog(request);
  };

  // Handle edit request (edit icon button)
  const handleEditRequest = (request: HomeownerRequest) => {
    openHistoryDialog(request);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <HomeownerRequestFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          priority={priority as any}
          setPriority={setPriority as any}
          type={type as any}
          setType={setType as any}
        />
        <div>
          {realtimeActive && <LiveStatusDot />}
        </div>
      </div>
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
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default HomeownerRequestContent;
