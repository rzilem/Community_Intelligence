
import React, { useState } from 'react';
import { 
  Table, 
  TableBody
} from '@/components/ui/table';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import HomeownerRequestDetailDialog from './HomeownerRequestDetailDialog';
import HomeownerRequestEditDialog from './HomeownerRequestEditDialog';
import HomeownerRequestCommentDialog from './HomeownerRequestCommentDialog';
import HomeownerRequestHistoryDialog from './HomeownerRequestHistoryDialog';
import RequestTableHeader from './table/RequestTableHeader';
import RequestTableRow from './table/RequestTableRow';
import EmptyRequestsRow from './table/EmptyRequestsRow';

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

  return (
    <div className="rounded-md border">
      <Table>
        <RequestTableHeader 
          columns={columns} 
          visibleColumnIds={visibleColumnIds} 
        />
        <TableBody>
          {requests.length === 0 ? (
            <EmptyRequestsRow columnsCount={visibleColumnIds.length} />
          ) : (
            requests.map((request) => (
              <RequestTableRow
                key={request.id}
                request={request}
                visibleColumnIds={visibleColumnIds}
                onViewRequest={handleViewRequest}
                onEditRequest={handleEditRequest}
                onAddComment={handleAddComment}
                onViewHistory={handleViewHistory}
              />
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
