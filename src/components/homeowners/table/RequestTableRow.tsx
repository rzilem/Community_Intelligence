
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit2, MessageSquare, History } from 'lucide-react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import StatusBadge from '../history/badges/StatusBadge';
import PriorityBadge from '../history/badges/PriorityBadge';
import { formatDistanceToNow } from 'date-fns';

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
  // Function to render cell content based on column id
  const renderCellContent = (columnId: string) => {
    switch (columnId) {
      case 'title':
        return request.title;
      case 'status':
        return <StatusBadge status={request.status} />;
      case 'priority':
        return <PriorityBadge priority={request.priority} />;
      case 'type':
        return request.type;
      case 'tracking_number':
        return request.tracking_number || 'N/A';
      case 'created_at':
        return request.created_at 
          ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) 
          : 'N/A';
      case 'updated_at':
        return request.updated_at 
          ? formatDistanceToNow(new Date(request.updated_at), { addSuffix: true }) 
          : 'N/A';
      case 'description':
        return (
          <div className="max-w-xs truncate">
            {request.description}
          </div>
        );
      case 'resident_id':
        return request.resident_id || 'Unassigned';
      case 'property_id':
        return request.property_id || 'Unassigned';
      case 'association_id':
        return request.association_id || 'Unassigned';
      case 'assigned_to':
        return request.assigned_to || 'Unassigned';
      case 'resolved_at':
        return request.resolved_at 
          ? formatDistanceToNow(new Date(request.resolved_at), { addSuffix: true }) 
          : 'N/A';
      default:
        return 'N/A';
    }
  };

  return (
    <TableRow>
      {visibleColumnIds.map((columnId) => (
        <TableCell key={columnId}>
          {renderCellContent(columnId)}
        </TableCell>
      ))}
      
      {/* Actions cell always visible */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onViewRequest(request)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEditRequest(request)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onAddComment(request)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onViewHistory(request)}>
            <History className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RequestTableRow;
