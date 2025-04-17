
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { StatusBadge } from '../../history/badges/StatusBadge';
import { PriorityBadge } from '../../history/badges/PriorityBadge';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';

interface DetailsTabProps {
  request: HomeownerRequest;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ request }) => {
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Title:</div>
                <div className="font-medium">{request.title}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Type:</div>
                <div className="capitalize">{request.type}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Status:</div>
                <StatusBadge status={request.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Priority:</div>
                <PriorityBadge priority={request.priority} />
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Created:</div>
                <div>{formatDate(request.created_at)}</div>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Tracking Number:</div>
                <div>{request.tracking_number || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Property Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Property ID:</div>
                <div>{request.property_id || 'Not specified'}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Association:</div>
                <div>{association?.name || 'Not specified'}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Resident ID:</div>
                <div>{request.resident_id || 'N/A'}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <div className="text-muted-foreground">Assigned To:</div>
                <div>{request.assigned_to || 'Unassigned'}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <div className="border rounded-lg p-4 bg-muted/10">
            <p className="whitespace-pre-wrap">{request.description}</p>
          </div>
        </div>
      </div>

      {request.resolved_at && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Resolution</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 max-w-md">
              <div className="text-muted-foreground">Resolved At:</div>
              <div>{formatDate(request.resolved_at)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsTab;
