
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MessageSquare, Clock } from 'lucide-react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';

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
  const renderCellContent = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return null;
    
    const value = request[column.accessorKey as keyof HomeownerRequest];
    
    if (columnId === 'status') {
      return (
        <Badge variant={
          value === 'open' ? 'default' : 
          value === 'in-progress' ? 'secondary' : 
          value === 'resolved' ? 'success' : 
          'outline'
        }>
          {String(value)}
        </Badge>
      );
    }
    
    if (columnId === 'priority') {
      return (
        <Badge variant={
          value === 'urgent' ? 'destructive' : 
          value === 'high' ? 'destructive' : 
          value === 'medium' ? 'warning' : 
          'outline'
        }>
          {String(value)}
        </Badge>
      );
    }
    
    if (columnId === 'created_at' || columnId === 'updated_at' || columnId === 'resolved_at') {
      return value ? formatDate(value as string) : '-';
    }
    
    return String(value || '-');
  };

  return (
    <TableRow className="group">
      {visibleColumnIds.map(columnId => (
        <TableCell key={`${request.id}-${columnId}`}>
          {renderCellContent(columnId)}
        </TableCell>
      ))}
      <TableCell className="text-right">
        <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewRequest(request)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditRequest(request)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddComment(request)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewHistory(request)}
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RequestTableRow;
