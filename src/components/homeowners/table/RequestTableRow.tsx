
import React from 'react';
import { formatRelativeDate } from '@/lib/date-utils';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { useResidentFromEmail } from '@/hooks/homeowners/useResidentFromEmail';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestActions } from './RequestActions';

interface RequestTableRowProps {
  request: HomeownerRequest;
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
  onViewRequest: (request: HomeownerRequest) => void;
  onEditRequest: (request: HomeownerRequest) => void;
}

const RequestTableRow: React.FC<RequestTableRowProps> = ({
  request,
  columns,
  visibleColumnIds,
  onViewRequest,
  onEditRequest,
}) => {
  // Extract sender email from tracking number or directly from the 'from' field if available
  const emailInfo = extractSenderEmail(request);
  
  // Fetch association data
  const { data: association } = useSupabaseQuery(
    'associations',
    {
      select: 'name',
      filter: [{ column: 'id', value: request.association_id }],
      single: true
    },
    !!request.association_id
  );

  // Pass both HTML content and direct email to the hook
  const { resident, property, email } = useResidentFromEmail(
    request.html_content,
    emailInfo
  );

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

  const renderCell = (columnId: string) => {
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

  return (
    <tr className="hover:bg-muted/50 border-b">
      {visibleColumnIds.map((columnId) => (
        <td key={columnId} className="py-2 px-4">
          {renderCell(columnId)}
        </td>
      ))}
      <td className="py-2 px-4">
        <RequestActions 
          request={request}
          onViewRequest={onViewRequest}
          onEditRequest={onEditRequest}
        />
      </td>
    </tr>
  );
};

// Helper function to extract email from tracking number or from the HTML content
const extractSenderEmail = (request: HomeownerRequest): string | null => {
  // If we have a tracking number, try to extract email from it
  if (request.tracking_number) {
    // Check if the tracking number contains an email (like "HOR-123456-user@example.com")
    const emailMatch = request.tracking_number.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (emailMatch) {
      return emailMatch[1];
    }
  }
  
  // If we have HTML content, try to find a "From:" header
  if (request.html_content) {
    const fromMatch = request.html_content.match(/From:.*?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (fromMatch) {
      return fromMatch[1];
    }
  }
  
  return null;
};

export default RequestTableRow;
