
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, FileEdit, MessageSquare, Clock } from 'lucide-react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import TooltipButton from '@/components/ui/tooltip-button';
import { formatDate, formatRelativeDate } from '@/lib/date-utils';

interface RequestTableRowProps {
  request: HomeownerRequest;
  visibleColumnIds: string[];
  onViewRequest: (request: HomeownerRequest) => void;
  onEditRequest: (request: HomeownerRequest) => void;
  onAddComment: (request: HomeownerRequest) => void;
  onViewHistory: (request: HomeownerRequest) => void;
}

const RequestTableRow: React.FC<RequestTableRowProps> = ({
  request,
  visibleColumnIds,
  onViewRequest,
  onEditRequest,
  onAddComment,
  onViewHistory
}) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const renderCellContent = (columnId: string) => {
    switch (columnId) {
      case 'title':
        return <span className="font-medium">{request.title}</span>;
      case 'type':
        return <span className="capitalize">{request.type}</span>;
      case 'status':
        return renderStatusBadge(request.status);
      case 'priority':
        return renderPriorityBadge(request.priority);
      case 'created_at':
        return formatDate(request.created_at);
      case 'updated_at':
        return formatRelativeDate(request.updated_at);
      case 'description':
        return <span className="truncate max-w-[200px] block">{request.description}</span>;
      case 'resident_id':
        return request.resident_id || 'N/A';
      case 'property_id':
        return <span className="truncate max-w-[120px] block">{request.property_id || 'N/A'}</span>;
      case 'association_id':
        return <span className="truncate max-w-[120px] block">{request.association_id || 'N/A'}</span>;
      case 'assigned_to':
        return request.assigned_to || 'Unassigned';
      case 'resolved_at':
        return request.resolved_at ? formatDate(request.resolved_at) : 'Not resolved';
      case 'tracking_number':
        return request.tracking_number || 'N/A';
      default:
        return '';
    }
  };

  return (
    <TableRow key={request.id}>
      {visibleColumnIds.map((columnId) => (
        <TableCell key={`${request.id}-${columnId}`}>
          {renderCellContent(columnId)}
        </TableCell>
      ))}
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <TooltipButton 
            variant="ghost" 
            size="icon" 
            tooltip="View Request Details"
            tooltipSide="left"
            onClick={() => onViewRequest(request)}
          >
            <Eye className="h-4 w-4" />
          </TooltipButton>
          <TooltipButton 
            variant="ghost" 
            size="icon" 
            tooltip="Edit Request"
            tooltipSide="left"
            onClick={() => onEditRequest(request)}
          >
            <FileEdit className="h-4 w-4" />
          </TooltipButton>
          <TooltipButton 
            variant="ghost" 
            size="icon" 
            tooltip="Add Comment"
            tooltipSide="left"
            onClick={() => onAddComment(request)}
          >
            <MessageSquare className="h-4 w-4" />
          </TooltipButton>
          <TooltipButton 
            variant="ghost" 
            size="icon" 
            tooltip="View History"
            tooltipSide="left"
            onClick={() => onViewHistory(request)}
          >
            <Clock className="h-4 w-4" />
          </TooltipButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RequestTableRow;
