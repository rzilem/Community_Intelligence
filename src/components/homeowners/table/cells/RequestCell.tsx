
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatRelativeDate } from '@/lib/date-utils';
import { RequestStatusBadge } from '../RequestStatusBadge';

interface RequestCellProps {
  request: HomeownerRequest;
  columnId: string;
  resident?: any;
  property?: any;
  association?: any;
  email?: string;
  senderEmail?: string;
  description: string;
}

export const RequestCell: React.FC<RequestCellProps> = ({
  request,
  columnId,
  resident,
  property,
  association,
  email,
  senderEmail,
  description
}) => {
  switch (columnId) {
    case 'priority':
      return <RequestStatusBadge status={request.priority} type="priority" />;
    case 'status':
      return <RequestStatusBadge status={request.status} type="status" />;
    case 'title':
      return <div className="text-sm font-medium">{request.title || 'Untitled Request'}</div>;
    case 'type':
      return <div className="text-sm">{request.type}</div>;
    case 'description':
      return (
        <div 
          className="text-sm text-muted-foreground max-w-[200px] truncate" 
          title={description}
        >
          {description}
        </div>
      );
    case 'tracking_number':
      return <div className="text-sm font-mono">{request.tracking_number || 'N/A'}</div>;
    case 'created_at':
      return (
        <div className="text-sm text-muted-foreground">
          {request.created_at ? formatRelativeDate(request.created_at) : 'Unknown'}
        </div>
      );
    case 'resident_id':
      return <div className="text-sm">{resident?.name || 'Not assigned'}</div>;
    case 'property_id':
      return (
        <div className="text-sm">
          {property ? `${property.address}${property.unit_number ? ` #${property.unit_number}` : ''}` : 'Not assigned'}
        </div>
      );
    case 'association_id':
      return <div className="text-sm">{association?.name || 'Not assigned'}</div>;
    case 'email':
      return <div className="text-sm">{email || senderEmail || 'No email found'}</div>;
    default:
      return <div>-</div>;
  }
};
