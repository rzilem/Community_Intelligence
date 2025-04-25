
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { RequestStatusBadge } from './RequestStatusBadge';
import { formatRelativeDate } from '@/lib/date-utils';

interface RequestTableCellProps {
  columnId: string;
  request: HomeownerRequest;
  resident?: { name: string } | null;
  property?: { address: string; unit_number?: string } | null;
  association?: { name: string } | null;
  email?: string | null;
}

export const RequestTableCell: React.FC<RequestTableCellProps> = ({
  columnId,
  request,
  resident,
  property,
  association,
  email,
}) => {
  const getDescription = () => {
    if (!request.description && !request.html_content) return 'No description provided';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = request.html_content || request.description;
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    plainText = plainText.replace(/(\w+)\s*{[^}]*}/g, '');
    plainText = plainText.replace(/\[Image\]/gi, '');
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    const words = plainText.split(/\s+/);
    return words.length > 15 ? `${words.slice(0, 15).join(' ')}...` : plainText;
  };

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
          title={getDescription()}
        >
          {getDescription()}
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
      return <div className="text-sm">{email || 'No email found'}</div>;
    default:
      return <div>-</div>;
  }
};
