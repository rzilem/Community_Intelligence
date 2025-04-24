
import React, { useState } from 'react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestHistoryDialog from '@/components/homeowners/history/HomeownerRequestHistoryDialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';

interface HomeownerRequestDialogsProps {
  handleRefresh: () => void;
}

const HomeownerRequestDialogs: React.FC<HomeownerRequestDialogsProps> = ({ handleRefresh }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
  
  // This function will be called when status changes
  const handleStatusChange = (id: string, status: string) => {
    console.log(`Changing status of request ${id} to ${status}`);
    toast.success(`Status updated to ${status}`);
    handleRefresh();
  };

  // These functions are exported to be called from outside components
  const openDetailDialog = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };
  
  const openHistoryDialog = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setHistoryOpen(true);
  };

  return (
    <>
      {selectedRequest && (
        <>
          <HomeownerRequestDetailDialog
            request={selectedRequest}
            open={detailOpen}
            onOpenChange={setDetailOpen}
            onStatusChange={handleStatusChange}
          />
          
          <HomeownerRequestHistoryDialog
            requestId={selectedRequest.id}
            open={historyOpen}
            onOpenChange={setHistoryOpen}
          />
        </>
      )}
    </>
  );
};

// Export the component and dialog functions
export { openDetailDialog, openHistoryDialog };
export default HomeownerRequestDialogs;
