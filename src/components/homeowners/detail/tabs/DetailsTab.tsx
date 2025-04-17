
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { StatusBadge } from '../../history/badges/StatusBadge';
import { PriorityBadge } from '../../history/badges/PriorityBadge';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { Card, CardContent } from '@/components/ui/card';

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
    <ScrollArea className="h-[60vh]">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/50 border-slate-200">
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-4 text-slate-900">Request Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-slate-500">Title:</div>
                <div className="font-medium text-slate-900">{request.title}</div>
                
                <div className="text-slate-500">Type:</div>
                <div className="capitalize text-slate-900">{request.type}</div>
                
                <div className="text-slate-500">Status:</div>
                <div><StatusBadge status={request.status} /></div>
                
                <div className="text-slate-500">Priority:</div>
                <div><PriorityBadge priority={request.priority} /></div>
                
                <div className="text-slate-500">Created:</div>
                <div className="text-slate-900">{formatDate(request.created_at)}</div>

                <div className="text-slate-500">Tracking Number:</div>
                <div className="font-mono text-sm text-slate-900">{request.tracking_number || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 border-slate-200">
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-4 text-slate-900">Property Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-slate-500">Property ID:</div>
                <div className="text-slate-900">{request.property_id || 'Not specified'}</div>
                
                <div className="text-slate-500">Association:</div>
                <div className="text-slate-900">{association?.name || 'Not specified'}</div>
                
                <div className="text-slate-500">Resident ID:</div>
                <div className="text-slate-900">{request.resident_id || 'N/A'}</div>
                
                <div className="text-slate-500">Assigned To:</div>
                <div className="text-slate-900">{request.assigned_to || 'Unassigned'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};

export default DetailsTab;
