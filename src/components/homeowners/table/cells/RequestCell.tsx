
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/date-utils';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface RequestCellProps {
  request: HomeownerRequest;
  columnId: string;
  resident?: any;
  property?: string;
  association?: string;
  email?: string;
  senderEmail?: string;
  description?: string;
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
    case 'title':
      return <div className="font-medium">{request.title}</div>;
    case 'status':
      return (
        <Badge 
          variant={
            request.status === 'open' ? 'default' :
            request.status === 'in-progress' ? 'secondary' :
            request.status === 'resolved' ? 'outline' : // Changed from 'success' to 'outline'
            request.status === 'closed' ? 'outline' :
            'destructive'
          }
          className={`capitalize ${
            request.status === 'resolved' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
          }`}
        >
          {request.status}
        </Badge>
      );
    case 'priority':
      return (
        <Badge 
          variant="outline" 
          className={`capitalize ${
            request.priority === 'high' ? 'border-orange-500 text-orange-600' :
            request.priority === 'urgent' ? 'border-red-500 text-red-600' :
            request.priority === 'low' ? 'border-green-500 text-green-600' :
            ''
          }`}
        >
          {request.priority}
        </Badge>
      );
    case 'type':
      return <span className="capitalize">{request.type}</span>;
    case 'tracking_number':
      return <span>{request.tracking_number || 'N/A'}</span>;
    case 'created_at':
      return <span>{formatRelativeDate(request.created_at)}</span>;
    case 'updated_at':
      return <span>{formatRelativeDate(request.updated_at)}</span>;
    case 'resident_id':
      return <span>{resident?.name || 'Unknown'}</span>;
    case 'property_id':
      return <span>{property || 'Unknown'}</span>;
    case 'association_id':
      return <span>{association || 'Unknown'}</span>;
    case 'email':
      return <span>{email || 'No email'}</span>;
    case 'description':
      return <span className="line-clamp-1">{description}</span>;
    case 'assigned_to':
      return <span>{request.assigned_to || 'Unassigned'}</span>;
    case 'resolved_at':
      return <span>{request.resolved_at ? formatRelativeDate(request.resolved_at) : 'Unresolved'}</span>;
    default:
      return <span>-</span>;
  }
};
