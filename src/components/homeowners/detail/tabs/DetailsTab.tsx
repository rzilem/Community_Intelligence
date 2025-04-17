
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { StatusBadge } from '../../history/badges/StatusBadge';
import { PriorityBadge } from '../../history/badges/PriorityBadge';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';

interface DetailsTabProps {
  request: HomeownerRequest;
  processedDescription: string;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ request, processedDescription }) => {
  const { data: association } = useSupabaseQuery(
    'associations',
    {
      select: 'name',
      filter: [{ column: 'id', value: request.association_id }],
      single: true
    },
    !!request.association_id
  );

  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Request Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Title:</div>
              <div className="font-medium">{request.title}</div>
              
              <div className="text-muted-foreground">Type:</div>
              <div className="capitalize">{request.type}</div>
              
              <div className="text-muted-foreground">Status:</div>
              <div><StatusBadge status={request.status} /></div>
              
              <div className="text-muted-foreground">Priority:</div>
              <div><PriorityBadge priority={request.priority} /></div>
              
              <div className="text-muted-foreground">Created:</div>
              <div>{formatDate(request.created_at)}</div>

              <div className="text-muted-foreground">Tracking Number:</div>
              <div>{request.tracking_number || 'N/A'}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Property Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Property ID:</div>
              <div>{request.property_id || 'Not specified'}</div>
              
              <div className="text-muted-foreground">Association:</div>
              <div>{association?.name || 'Not specified'}</div>
              
              <div className="text-muted-foreground">Resident ID:</div>
              <div>{request.resident_id || 'N/A'}</div>
              
              <div className="text-muted-foreground">Assigned To:</div>
              <div>{request.assigned_to || 'Unassigned'}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Description</h3>
          <div className="border rounded-md p-4 whitespace-pre-wrap">
            {processedDescription}
          </div>
        </div>
        
        {request.resolved_at && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Resolution</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-muted-foreground">Resolved At:</div>
              <div>{formatDate(request.resolved_at)}</div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default DetailsTab;
