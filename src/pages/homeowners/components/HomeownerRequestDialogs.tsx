
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestHistoryDialog from '@/components/homeowners/history/HomeownerRequestHistoryDialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';

interface HomeownerRequestDialogsProps {
  handleRefresh: () => void;
}

// Define a type for the ref that will be exposed
export interface HomeownerRequestDialogsRef {
  openDetailDialog: (request: HomeownerRequest) => void;
  openHistoryDialog: (request: HomeownerRequest) => void;
}

const HomeownerRequestDialogs = forwardRef<HomeownerRequestDialogsRef, HomeownerRequestDialogsProps>(
  ({ handleRefresh }, ref) => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
    
    // This function will be called when status changes
    const handleStatusChange = (id: string, status: string) => {
      console.log(`Changing status of request ${id} to ${status}`);
      toast.success(`Status updated to ${status}`);
      handleRefresh();
    };

    // These functions are exposed via the ref
    const openDetailDialog = (request: HomeownerRequest) => {
      setSelectedRequest(request);
      setDetailOpen(true);
    };
    
    const openHistoryDialog = (request: HomeownerRequest) => {
      setSelectedRequest(request);
      setHistoryOpen(true);
    };

    // Expose the functions via useImperativeHandle
    useImperativeHandle(ref, () => ({
      openDetailDialog,
      openHistoryDialog
    }));

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
  }
);

// Define a name for the component for better debugging
HomeownerRequestDialogs.displayName = 'HomeownerRequestDialogs';

// Create helper functions to access the dialogs from outside components
const dialogRef = React.createRef<HomeownerRequestDialogsRef>();

export const openDetailDialog = (request: HomeownerRequest) => {
  if (dialogRef.current) {
    dialogRef.current.openDetailDialog(request);
  } else {
    console.error("Detail dialog ref is not initialized");
  }
};

export const openHistoryDialog = (request: HomeownerRequest) => {
  if (dialogRef.current) {
    dialogRef.current.openHistoryDialog(request);
  } else {
    console.error("History dialog ref is not initialized");
  }
};

// Create a wrapper component that renders the HomeownerRequestDialogs with the ref
const HomeownerRequestDialogsWithRef: React.FC<HomeownerRequestDialogsProps> = (props) => {
  return <HomeownerRequestDialogs {...props} ref={dialogRef} />;
};

export default HomeownerRequestDialogsWithRef;
