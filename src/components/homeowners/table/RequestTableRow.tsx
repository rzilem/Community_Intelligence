
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare, History, Edit } from 'lucide-react';

interface RequestTableRowProps {
  request: HomeownerRequest;
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
  onViewRequest: (request: HomeownerRequest) => void;
  onEditRequest: (request: HomeownerRequest) => void;
  onAddComment: (request: HomeownerRequest) => void;
  onViewHistory: (request: HomeownerRequest) => void;
}

const RequestTableRow: React.FC<RequestTableRowProps> = ({
  request,
  columns,
  visibleColumnIds,
  onViewRequest,
  onEditRequest,
  onAddComment,
  onViewHistory
}) => {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'in_progress': return 'warning';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const formatDescription = (description: string) => {
    if (!description) return 'No description provided';
    
    const lines = description.split('\n');
    const truncated = lines.slice(0, 2).join('\n');
    return lines.length > 2 ? `${truncated}...` : truncated;
  };

  const getDescription = () => {
    if (request.html_content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = request.html_content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      return formatDescription(plainText);
    }
    
    return formatDescription(request.description);
  };

  const truncateToTwoLines = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    const lines = text.split('\n');
    const truncatedLines = lines.slice(0, 2);
    const truncatedText = truncatedLines.join(' ').substring(0, maxLength);
    return truncatedText + (lines.length > 2 || truncatedText.length === maxLength ? '...' : '');
  };

  return (
    <tr className="hover:bg-muted/50 border-b">
      {visibleColumnIds.includes('title') && (
        <td className="py-2 px-4">
          <div className="font-medium line-clamp-2">
            {truncateToTwoLines(request.title, 50)}
          </div>
        </td>
      )}

      {visibleColumnIds.includes('description') && (
        <td className="py-2 px-4">
          <div className="text-sm text-muted-foreground max-w-xl line-clamp-2">
            {getDescription()}
          </div>
        </td>
      )}

      {visibleColumnIds.includes('status') && (
        <td className="py-2 px-4">
          <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
        </td>
      )}

      {visibleColumnIds.includes('priority') && (
        <td className="py-2 px-4">
          <Badge variant={getPriorityVariant(request.priority)}>{request.priority}</Badge>
        </td>
      )}

      {visibleColumnIds.includes('type') && (
        <td className="py-2 px-4">
          <div className="text-sm">{request.type}</div>
        </td>
      )}

      {visibleColumnIds.includes('created_at') && (
        <td className="py-2 px-4">
          <div className="text-sm text-muted-foreground">
            {request.created_at ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) : 'Unknown'}
          </div>
        </td>
      )}

      {visibleColumnIds.includes('tracking_number') && (
        <td className="py-2 px-4">
          <div className="text-sm font-mono">{request.tracking_number || 'N/A'}</div>
        </td>
      )}

      <td className="py-2 px-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onViewRequest(request)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEditRequest(request)}
            title="Edit request"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onAddComment(request)}
            title="Add comment"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onViewHistory(request)}
            title="View history"
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default RequestTableRow;
