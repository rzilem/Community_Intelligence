
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

// Export the component and the dialog functions
const dialogHelpers = {
  openDetailDialog: null as ((request: HomeownerRequest) => void) | null,
  openHistoryDialog: null as ((request: HomeownerRequest) => void) | null,
};

// These are the functions that will be called from outside components
export const openDetailDialog = (request: HomeownerRequest) => {
  if (dialogHelpers.openDetailDialog) {
    dialogHelpers.openDetailDialog(request);
  } else {
    console.error("Detail dialog helper is not initialized");
  }
};

export const openHistoryDialog = (request: HomeownerRequest) => {
  if (dialogHelpers.openHistoryDialog) {
    dialogHelpers.openHistoryDialog(request);
  } else {
    console.error("History dialog helper is not initialized");
  }
};

// Update the component to expose its functions via the helpers
const HomeownerRequestDialogsWithHelpers: React.FC<HomeownerRequestDialogsProps> = (props) => {
  const dialogsRef = React.useRef<{
    openDetailDialog: (request: HomeownerRequest) => void;
    openHistoryDialog: (request: HomeownerRequest) => void;
  } | null>(null);

  const dialogsComponent = <HomeownerRequestDialogs {...props} ref={dialogsRef} />;

  React.useEffect(() => {
    if (dialogsRef.current) {
      dialogHelpers.openDetailDialog = dialogsRef.current.openDetailDialog;
      dialogHelpers.openHistoryDialog = dialogsRef.current.openHistoryDialog;
    }
  }, [dialogsRef.current]);

  return dialogsComponent;
};

// Export both the component and the dialog functions
export { openDetailDialog as viewDetailDialog, openHistoryDialog as viewHistoryDialog };
export default HomeownerRequestDialogs;
