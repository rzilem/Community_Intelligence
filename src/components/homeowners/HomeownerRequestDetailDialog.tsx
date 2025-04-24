
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/date-utils';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{request.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                  {request.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {request.priority}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {request.type}
                </Badge>
              </div>
            </div>
            <div className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1">
              {request.tracking_number || 'No tracking #'}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Description</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {request.html_content && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Rich Content</p>
              <div 
                className="text-sm text-muted-foreground prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: request.html_content }}
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm">{formatRelativeDate(request.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm">{formatRelativeDate(request.updated_at)}</p>
            </div>
            {request.resolved_at && (
              <div>
                <p className="text-sm font-medium">Resolved</p>
                <p className="text-sm">{formatRelativeDate(request.resolved_at)}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onStatusChange(request.id, request.status === 'open' ? 'in-progress' : 'open')}
            >
              {request.status === 'open' ? 'Mark In Progress' : 'Mark as Open'}
            </Button>
            <Button 
              variant="default" 
              onClick={() => onStatusChange(request.id, 'resolved')}
              disabled={request.status === 'resolved'}
            >
              {request.status === 'resolved' ? 'Resolved' : 'Mark as Resolved'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestDetailDialog;
