import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { StatusBadge } from '../../history/badges/StatusBadge';
import { PriorityBadge } from '../../history/badges/PriorityBadge';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { cn } from '@/lib/utils';

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
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-3 gap-6">
          {/* Request Information - Column 1 */}
          <div className="space-y-3 bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="font-medium text-base border-b pb-2">Request Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Title</span>
                <span className="text-sm font-medium">{request.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm capitalize">{request.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          {/* Request Status - Column 2 */}
          <div className="space-y-3 bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="font-medium text-base border-b pb-2">Status Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Priority</span>
                <PriorityBadge priority={request.priority} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(request.created_at)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tracking #</span>
                <span className="text-sm font-mono">{request.tracking_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Property Information - Column 3 */}
          <div className="space-y-3 bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="font-medium text-base border-b pb-2">Property Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Property ID</span>
                <span className="text-sm font-mono">{request.property_id || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Association</span>
                <span className="text-sm">{association?.name || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Assigned To</span>
                <span className="text-sm">{request.assigned_to || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-base">Description</h3>
          <div
            className={cn(
              "border rounded-lg p-4 whitespace-pre-wrap text-sm",
              "bg-gradient-to-br from-hoa-blue-50 to-hoa-silver-100",
              "shadow-sm hover:shadow-md transition-all duration-300",
              "text-hoa-blue-900 dark:text-white",
              "dark:from-hoa-blue-800/50 dark:to-hoa-silver-900/50"
            )}
          >
            {processedDescription}
          </div>
        </div>

        {request._aiConfidence && (
          <div className="space-y-3">
            <h3 className="font-medium text-base">AI Extraction Confidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center justify-between border rounded-md p-2 bg-card text-sm">
                <span className="text-muted-foreground">Title ({(request._aiConfidence.title * 100).toFixed(0)}%)</span>
                <span>{request.title}</span>
              </div>
              <div className="flex items-center justify-between border rounded-md p-2 bg-card text-sm">
                <span className="text-muted-foreground">Type ({(request._aiConfidence.type * 100).toFixed(0)}%)</span>
                <span className="capitalize">{request.type}</span>
              </div>
              <div className="flex items-center justify-between border rounded-md p-2 bg-card text-sm">
                <span className="text-muted-foreground">Priority ({(request._aiConfidence.priority * 100).toFixed(0)}%)</span>
                <span className="capitalize">{request.priority}</span>
              </div>
              <div className="flex items-center justify-between border rounded-md p-2 bg-card text-sm md:col-span-2">
                <span className="text-muted-foreground">Description ({(request._aiConfidence.description * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Resolution Section - Only show if resolved */}
        {request.resolved_at && (
          <div className="space-y-3">
            <h3 className="font-medium text-base">Resolution</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between border rounded-md p-4 bg-card">
                <span className="text-sm text-muted-foreground">Resolved At</span>
                <span className="text-sm">{formatDate(request.resolved_at)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default DetailsTab;
