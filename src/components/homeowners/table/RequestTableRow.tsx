import React from 'react';
import { formatRelativeDate } from '@/lib/date-utils';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { useResidentFromEmail } from '@/hooks/homeowners/useResidentFromEmail';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestActions } from './RequestActions';

export interface RequestTableRowProps {
  request: HomeownerRequest;
  columns: HomeownerRequestColumn[];
  visibleColumnIds?: string[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onViewRequest?: (request: HomeownerRequest) => void;
  onEditRequest?: (request: HomeownerRequest) => void;
  onViewDetails?: () => void;
  onViewHistory?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

export const RequestTableRow: React.FC<RequestTableRowProps> = ({
  request,
  columns,
  visibleColumnIds,
  isSelected,
  onToggleSelect,
  onViewRequest,
  onEditRequest,
  onViewDetails,
  onViewHistory,
  onStatusChange,
}) => {
  const senderEmail = extractPrimarySenderEmail(request);
  
  const { data: association } = useSupabaseQuery(
    'associations',
    {
      select: 'name',
      filter: [{ column: 'id', value: request.association_id }],
      single: true
    },
    !!request.association_id
  );

  const { resident, property, email, association: residentAssociation } = useResidentFromEmail(
    request.html_content,
    senderEmail
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

  React.useEffect(() => {
    const shouldUpdateRequest = (
      resident && 
      property && 
      (!request.resident_id || !request.property_id || !request.association_id)
    );
    
    if (shouldUpdateRequest && onEditRequest) {
      console.log('Resident info found that could update request:', {
        resident_id: resident.id,
        property_id: property.id,
        association_id: property.association_id
      });
    }
  }, [resident, property, request, onEditRequest]);

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
        return <div className="text-sm">{association?.name || residentAssociation?.name || 'Not assigned'}</div>;
      case 'email':
        return <div className="text-sm">{email || senderEmail || 'No email found'}</div>;
      default:
        return <div>-</div>;
    }
  };

  // Support both the queue view and table view formats
  if (visibleColumnIds) {
    // Table view format
    return (
      <tr className="hover:bg-muted/50">
        {visibleColumnIds.map((columnId) => (
          <td 
            key={columnId} 
            className="py-2 px-4 last:border-r-0"
          >
            {renderCell(columnId)}
          </td>
        ))}
        <td className="py-2 px-4 text-center border-l border-border/20">
          <RequestActions 
            request={request}
            onViewRequest={onViewRequest ? () => onViewRequest(request) : undefined}
            onEditRequest={onEditRequest ? () => onEditRequest(request) : undefined}
            onViewDetails={onViewDetails}
            onViewHistory={onViewHistory}
            onStatusChange={onStatusChange}
          />
        </td>
      </tr>
    );
  }
  
  // Queue view format
  return (
    <div className={`p-4 flex items-center justify-between border-b hover:bg-muted/50 ${isSelected ? 'bg-muted/50' : ''}`}>
      <div className="flex items-start gap-3">
        {onToggleSelect && (
          <input 
            type="checkbox" 
            className="mt-1" 
            checked={isSelected} 
            onChange={onToggleSelect}
          />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="font-medium">{request.title || 'Untitled Request'}</div>
            <RequestStatusBadge status={request.status} type="status" />
            <RequestStatusBadge status={request.priority} type="priority" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>#{request.tracking_number || 'No tracking'}</span>
            <span className="text-xs">•</span>
            <span>{formatRelativeDate(request.created_at)}</span>
            <span className="text-xs">•</span>
            <span>{resident?.name || 'Unassigned'}</span>
          </div>
          <div className="text-sm text-muted-foreground max-w-[600px] line-clamp-1">
            {getDescription()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RequestActions 
          request={request}
          onViewDetails={onViewDetails}
          onViewHistory={onViewHistory} 
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
};

const extractPrimarySenderEmail = (request: HomeownerRequest): string | null => {
  if (request.html_content) {
    const pspropMatch = request.html_content.match(/([a-zA-Z0-9._-]+@psprop\.net)/i);
    if (pspropMatch) {
      console.log('Found psprop.net email:', pspropMatch[0]);
      return pspropMatch[0];
    }
  }
  
  if (request.tracking_number && request.tracking_number.includes('rickyz@psprop.net')) {
    console.log('Found rickyz@psprop.net in tracking number');
    return 'rickyz@psprop.net';
  }
  
  if (request.html_content) {
    const fromHeaderMatch = request.html_content.match(/From:\s*([^<\r\n]*?)<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i);
    if (fromHeaderMatch && fromHeaderMatch[2]) {
      console.log('Found email in From header:', fromHeaderMatch[2]);
      return fromHeaderMatch[2];
    }
  }
  
  if (request.tracking_number) {
    const emailMatch = request.tracking_number.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (emailMatch) {
      console.log('Found email in tracking number:', emailMatch[1]);
      return emailMatch[1];
    }
  }
  
  if (request.html_content) {
    const emailPatterns = [
      /Reply-To:\s*(?:[^<\r\n]*?)<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /Reply-To:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /Return-Path:\s*<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /envelope-from\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /email=([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i
    ];
    
    for (const pattern of emailPatterns) {
      const match = request.html_content.match(pattern);
      if (match && match[1]) {
        console.log('Found email using pattern:', pattern, match[1]);
        return match[1];
      }
    }
  }
  
  return null;
};

export default RequestTableRow;
