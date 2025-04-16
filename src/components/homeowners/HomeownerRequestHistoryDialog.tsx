
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ date, title, description }) => {
  return (
    <div className="relative pb-8">
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-white">
            <span className="text-xs font-medium text-white">{date.substring(8, 10)}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">{title}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{formatDate(date)}</p>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HistoryDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeownerRequestHistoryDialog: React.FC<HistoryDialogProps> = ({
  request,
  open,
  onOpenChange
}) => {
  // Mock history data
  const historyItems = React.useMemo(() => {
    if (!request) return [];
    
    // Basic history based on request data
    const history = [
      {
        date: request.created_at,
        title: 'Request Created',
        description: `Request was created with status "${request.status}" and priority "${request.priority}".`
      }
    ];
    
    // Add assignment history if assigned
    if (request.assigned_to) {
      history.push({
        date: request.updated_at,
        title: 'Request Assigned',
        description: `Request was assigned to ${request.assigned_to}.`
      });
    }
    
    // Add resolution history if resolved
    if (request.resolved_at) {
      history.push({
        date: request.resolved_at,
        title: 'Request Resolved',
        description: 'Request was marked as resolved.'
      });
    }
    
    // Add mock status updates (just for demonstration)
    if (request.status === 'in-progress') {
      const statusDate = new Date(request.created_at);
      statusDate.setDate(statusDate.getDate() + 1);
      
      history.push({
        date: statusDate.toISOString(),
        title: 'Status Updated',
        description: 'Status was changed from "open" to "in-progress".'
      });
    }
    
    // Sort by date (most recent first)
    return history.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [request]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request History</DialogTitle>
        </DialogHeader>
        
        {request ? (
          <div className="mt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Request #{request.id.substring(0, 8)}</h3>
              <p className="text-lg font-semibold">{request.title}</p>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="flow-root">
                <ul className="space-y-6">
                  {historyItems.map((item, index) => (
                    <li key={index}>
                      <TimelineItem
                        date={item.date}
                        title={item.title}
                        description={item.description}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Request data not available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestHistoryDialog;
