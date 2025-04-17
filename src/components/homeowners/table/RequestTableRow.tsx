
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';

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
      case 'in-progress': 
      case 'in_progress': return 'warning';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const formatDescription = (description: string) => {
    if (!description) return 'No description provided';
    
    // Create a temporary div to handle both HTML and plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Remove CSS styles often found in emails
    plainText = plainText.replace(/(\w+)\s*{[^}]*}/g, '');
    
    // Remove [Image] tags
    plainText = plainText.replace(/\[Image\]/gi, '');
    
    // Remove email signatures indicators
    const signatureIndicators = [
      'Thank you,', 'Thanks,', 'Regards,', 'Best regards,', 
      'Sincerely,', 'Cheers,', 'Best wishes,', '--', '---'
    ];
    
    for (const indicator of signatureIndicators) {
      const index = plainText.indexOf(indicator);
      if (index !== -1) {
        plainText = plainText.substring(0, index).trim();
      }
    }
    
    // Remove phone numbers and common email content
    plainText = plainText.replace(/\(\d{3}\)\s*\d{3}-\d{4}/g, ''); // Phone numbers like (512) 555-1234
    plainText = plainText.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, ''); // Email addresses
    plainText = plainText.replace(/http[s]?:\/\/\S+/g, ''); // URLs
    
    // Normalize whitespace
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    // Split into words and handle truncation
    const words = plainText.split(/\s+/);
    const truncated = words.slice(0, 15).join(' '); // Limit to 15 words for context
    
    return words.length > 15 ? `${truncated}...` : truncated;
  };

  const getDescription = () => {
    if (request.html_content) {
      return formatDescription(request.html_content);
    }
    
    return formatDescription(request.description);
  };

  // Render cell based on column ID
  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'priority':
        return (
          <Badge variant={getPriorityVariant(request.priority)}>{request.priority}</Badge>
        );
      case 'title':
        return <div className="text-sm font-medium">{request.title || 'Untitled Request'}</div>;
      case 'type':
        return <div className="text-sm">{request.type}</div>;
      case 'status':
        return (
          <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
        );
      case 'description':
        return <div className="text-sm text-muted-foreground">{getDescription()}</div>;
      case 'tracking_number':
        return (
          <div className="text-sm font-mono">{request.tracking_number || 'N/A'}</div>
        );
      case 'created_at':
        return (
          <div className="text-sm text-muted-foreground">
            {request.created_at ? formatRelativeDate(request.created_at) : 'Unknown'}
          </div>
        );
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
        </div>
      </td>
    </tr>
  );
};

export default RequestTableRow;
