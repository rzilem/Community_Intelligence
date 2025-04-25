
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { RequestActions } from './RequestActions';
import { RequestStatusBadge } from './RequestStatusBadge';
import { formatRelativeDate } from '@/lib/date-utils';

interface RequestQueueViewProps {
  request: HomeownerRequest;
  resident?: { name: string } | null;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onViewDetails?: () => void;
  onViewHistory?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

export const RequestQueueView: React.FC<RequestQueueViewProps> = ({
  request,
  resident,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onViewHistory,
  onStatusChange,
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
