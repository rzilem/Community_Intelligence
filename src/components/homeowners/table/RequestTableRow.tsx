
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatRelativeDate } from '@/lib/date-utils';
import { useRequestData } from './hooks/useRequestData';
import { RequestCell } from './cells/RequestCell';
import { RequestActions } from './RequestActions';

export interface RequestTableRowProps {
  request: HomeownerRequest;
  columns: any[];
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
  const {
    association,
    resident,
    property,
    email,
    residentAssociation,
    senderEmail
  } = useRequestData(request, onEditRequest);

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

  // Support both the queue view and table view formats
  if (visibleColumnIds) {
    // Table view format
    return (
      <tr className="hover:bg-muted/50">
        {visibleColumnIds.map((columnId) => (
          <td key={columnId} className="py-2 px-4 last:border-r-0">
            <RequestCell
              request={request}
              columnId={columnId}
              resident={resident}
              property={property}
              association={association}
              email={email}
              senderEmail={senderEmail}
              description={getDescription()}
            />
          </td>
        ))}
        <td className="py-2 px-4 text-center border-l border-border/20">
          <RequestActions 
            request={request}
            onViewRequest={onViewRequest}
            onEditRequest={onEditRequest}
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
            <RequestCell request={request} columnId="status" description={getDescription()} />
            <RequestCell request={request} columnId="priority" description={getDescription()} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>#{request.tracking_number || 'No tracking'}</span>
            <span className="text-xs">•</span>
            <span>{request.created_at ? formatRelativeDate(request.created_at) : 'Unknown'}</span>
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
          onViewRequest={onViewRequest}
          onEditRequest={onEditRequest}
          onViewDetails={onViewDetails}
          onViewHistory={onViewHistory}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
};

export default RequestTableRow;
