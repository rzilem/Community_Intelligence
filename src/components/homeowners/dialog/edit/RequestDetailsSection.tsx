
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';

interface RequestDetailsSectionProps {
  request: HomeownerRequest;
}

const RequestDetailsSection: React.FC<RequestDetailsSectionProps> = ({ request }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Request Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Title:</div>
          <div>{request.title}</div>
          
          <div className="text-muted-foreground">Type:</div>
          <div className="capitalize">{request.type}</div>
          
          <div className="text-muted-foreground">Status:</div>
          <div>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
              {request.status}
            </span>
          </div>
          
          <div className="text-muted-foreground">Priority:</div>
          <div>
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              request.priority === 'urgent' ? 'bg-red-50 text-red-700' :
              request.priority === 'high' ? 'bg-orange-50 text-orange-700' :
              request.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }`}>
              {request.priority}
            </span>
          </div>
          
          <div className="text-muted-foreground">Created:</div>
          <div>{formatDate(request.created_at)}</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Property Information</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Property ID:</div>
          <div>{request.property_id || 'Not specified'}</div>
          
          <div className="text-muted-foreground">Association:</div>
          <div>{request.association_id || 'Not specified'}</div>
          
          <div className="text-muted-foreground">Resident ID:</div>
          <div>{request.resident_id || 'N/A'}</div>
          
          <div className="text-muted-foreground">Assigned To:</div>
          <div>{request.assigned_to || 'Unassigned'}</div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsSection;
