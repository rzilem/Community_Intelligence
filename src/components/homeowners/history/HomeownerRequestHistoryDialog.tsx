
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface HomeownerRequestHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

const HomeownerRequestHistoryDialog: React.FC<HomeownerRequestHistoryDialogProps> = ({
  open,
  onOpenChange,
  requestId
}) => {
  // This would be a placeholder for a real implementation
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request History</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Showing history for request ID: {requestId}
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="border-l-2 border-primary pl-4 py-2">
              <p className="text-sm font-medium">Status changed to "Open"</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="border-l-2 border-primary pl-4 py-2">
              <p className="text-sm font-medium">Request created</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestHistoryDialog;
