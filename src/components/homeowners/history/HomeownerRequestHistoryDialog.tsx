
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HomeownerRequestHistoryDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeownerRequestHistoryDialog: React.FC<HomeownerRequestHistoryDialogProps> = ({
  requestId,
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request History</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-muted-foreground">Viewing history for request ID: {requestId}</p>
          
          <div className="mt-4 space-y-4">
            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm font-medium">Request Created</p>
              <p className="text-sm text-muted-foreground">Initial request submitted</p>
            </div>
            
            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm font-medium">Status Changed</p>
              <p className="text-sm text-muted-foreground">Status updated from 'open' to 'in-progress'</p>
            </div>
            
            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm font-medium">Comment Added</p>
              <p className="text-sm text-muted-foreground">Admin commented: "Working on this issue now."</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestHistoryDialog;
