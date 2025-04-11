
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, FileEdit, MessageSquare, Clock, Calendar } from 'lucide-react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { format } from 'date-fns';
import TooltipButton from '@/components/ui/tooltip-button';
import HomeownerRequestDetailDialog from './HomeownerRequestDetailDialog';
import HomeownerRequestEditDialog from './HomeownerRequestEditDialog';
import HomeownerRequestCommentDialog from './HomeownerRequestCommentDialog';
import HomeownerRequestHistoryDialog from './HomeownerRequestHistoryDialog';

interface HomeownerRequestsTableProps {
  requests: HomeownerRequest[];
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
}

const HomeownerRequestsTable: React.FC<HomeownerRequestsTableProps> = ({ 
  requests, 
  columns, 
  visibleColumnIds 
}) => {
  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  const handleViewRequest = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleEditRequest = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsEditOpen(true);
  };

  const handleAddComment = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsCommentOpen(true);
  };

  const handleViewHistory = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setIsHistoryOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const renderCellContent = (request: HomeownerRequest, columnId: string) => {
    switch (columnId) {
      case 'title':
        return <span className="font-medium">{request.title}</span>;
      case 'type':
        return <span className="capitalize">{request.type}</span>;
      case 'status':
        return renderStatusBadge(request.status);
      case 'priority':
        return renderPriorityBadge(request.priority);
      case 'createdAt':
        return formatDate(request.createdAt);
      case 'updatedAt':
        return formatDate(request.updatedAt);
      case 'description':
        return <span className="truncate max-w-[200px] block">{request.description}</span>;
      case 'residentId':
        return request.residentId || 'N/A';
      case 'propertyId':
        return <span className="truncate max-w-[120px] block">{request.propertyId || 'N/A'}</span>;
      case 'associationId':
        return <span className="truncate max-w-[120px] block">{request.associationId || 'N/A'}</span>;
      case 'assignedTo':
        return request.assignedTo || 'Unassigned';
      case 'resolvedAt':
        return request.resolvedAt ? formatDate(request.resolvedAt) : 'Not resolved';
      case 'tracking_number':
        return request.tracking_number || 'N/A';
      default:
        return '';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumnIds.map((columnId) => {
              const column = columns.find(col => col.id === columnId);
              return column ? (
                <TableHead key={columnId}>{column.label}</TableHead>
              ) : null;
            })}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnIds.length + 1} className="h-24 text-center">
                No requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                {visibleColumnIds.map((columnId) => (
                  <TableCell key={`${request.id}-${columnId}`}>
                    {renderCellContent(request, columnId)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipButton 
                      variant="ghost" 
                      size="icon" 
                      tooltip="View Request Details"
                      tooltipSide="left"
                      onClick={() => handleViewRequest(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </TooltipButton>
                    <TooltipButton 
                      variant="ghost" 
                      size="icon" 
                      tooltip="Edit Request"
                      tooltipSide="left"
                      onClick={() => handleEditRequest(request)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </TooltipButton>
                    <TooltipButton 
                      variant="ghost" 
                      size="icon" 
                      tooltip="Add Comment"
                      tooltipSide="left"
                      onClick={() => handleAddComment(request)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </TooltipButton>
                    <TooltipButton 
                      variant="ghost" 
                      size="icon" 
                      tooltip="View History"
                      tooltipSide="left"
                      onClick={() => handleViewHistory(request)}
                    >
                      <Clock className="h-4 w-4" />
                    </TooltipButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <HomeownerRequestDetailDialog 
        request={selectedRequest} 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
      />
      
      <HomeownerRequestEditDialog 
        request={selectedRequest}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      
      <HomeownerRequestCommentDialog
        request={selectedRequest}
        open={isCommentOpen}
        onOpenChange={setIsCommentOpen}
      />
      
      <HomeownerRequestHistoryDialog
        request={selectedRequest}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </div>
  );
};

export default HomeownerRequestsTable;
