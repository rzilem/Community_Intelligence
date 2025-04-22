import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';

export interface HomeownerRequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HomeownerRequest;
  onStatusChange: (id: string, status: string) => void;
}

const HomeownerRequestDetailDialog: React.FC<HomeownerRequestDetailDialogProps> = ({
  open,
  onOpenChange,
  request,
  onStatusChange
}) => {
  // This would be a placeholder for a real implementation
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-medium">{request.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {request.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm">{request.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Priority</p>
              <p className="text-sm">{request.priority}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm">{request.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm">{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestDetailDialog;
