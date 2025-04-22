
import React from 'react';
import { HomeownerRequest, RequestAttachment } from '@/types/homeowner-request-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import RequestTableRow from '../table/RequestTableRow';
import EmptyRequestsRow from '../table/EmptyRequestsRow';
import RequestTableHeader from '../table/RequestTableHeader';
import RequestsCardHeader from './RequestsCardHeader';
import RequestsStatusFooter from './RequestsStatusFooter';
import HomeownerRequestDetailDialog from '../HomeownerRequestDetailDialog';
import HomeownerRequestHistoryDialog from '../history/HomeownerRequestHistoryDialog';
import { HomeownerRequestBulkActions } from '../HomeownerRequestBulkActions';

interface RequestsTabContentProps {
  status: string;
  title: string;
  requests: HomeownerRequest[];
  totalCount: number;
  isLoading: boolean;
  onStatusChange: (id: string, status: string) => void;
  columns: string[];
  selectedRequestIds: string[];
  setSelectedRequestIds: (ids: string[]) => void;
  toggleSelectRequest: (id: string) => void;
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({
  status,
  title,
  requests,
  totalCount,
  isLoading,
  onStatusChange,
  columns,
  selectedRequestIds,
  setSelectedRequestIds,
  toggleSelectRequest
}) => {
  const [detailRequestId, setDetailRequestId] = React.useState<string | null>(null);
  const [historyRequestId, setHistoryRequestId] = React.useState<string | null>(null);
  
  const handleViewDetail = (requestId: string) => {
    setDetailRequestId(requestId);
  };
  
  const handleViewHistory = (requestId: string) => {
    setHistoryRequestId(requestId);
  };

  const handleCloseDetail = () => {
    setDetailRequestId(null);
  };

  const handleCloseHistory = () => {
    setHistoryRequestId(null);
  };
  
  const detailRequest = requests.find(req => req.id === detailRequestId);
  const historyRequest = requests.find(req => req.id === historyRequestId);

  // Function to handle bulk actions
  const handleBulkAction = (action: string) => {
    if (action === 'approve' || action === 'reject' || action === 'close') {
      selectedRequestIds.forEach(id => {
        const newStatus = action === 'approve' ? 'approved' : 
                         action === 'reject' ? 'rejected' : 'closed';
        onStatusChange(id, newStatus);
      });
      setSelectedRequestIds([]);
    }
  };

  // Function to safely render attachments
  const renderAttachments = (attachments: RequestAttachment[] | undefined) => {
    if (!attachments) return null;
    return <>{attachments.length} files</>;
  };

  return (
    <Card className="h-full flex flex-col">
      <RequestsCardHeader
        title={title}
        count={totalCount}
        isLoading={isLoading}
      />
      
      {/* Bulk actions bar (visible when items are selected) */}
      {selectedRequestIds.length > 0 && (
        <div className="px-4 py-2 bg-muted border-b">
          <HomeownerRequestBulkActions 
            selectedCount={selectedRequestIds.length}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedRequestIds([])}
          />
        </div>
      )}
      
      <CardContent className="p-0 flex-grow overflow-auto">
        <div className="min-w-full divide-y divide-gray-200">
          <RequestTableHeader 
            columns={columns} 
            enableSelection={true}
            selectedAll={selectedRequestIds.length === requests.length && requests.length > 0}
            onSelectAll={() => {
              if (selectedRequestIds.length === requests.length) {
                setSelectedRequestIds([]);
              } else {
                setSelectedRequestIds(requests.map(req => req.id));
              }
            }}
          />
          
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : requests.length === 0 ? (
              <EmptyRequestsRow columns={columns.length + 1} message={`No ${status.toLowerCase()} requests`} />
            ) : (
              requests.map(request => (
                <RequestTableRow
                  key={request.id}
                  request={request}
                  columns={columns}
                  onViewDetail={() => handleViewDetail(request.id)}
                  onViewHistory={() => handleViewHistory(request.id)}
                  isSelected={selectedRequestIds.includes(request.id)}
                  onToggleSelect={() => toggleSelectRequest(request.id)}
                  renderAttachments={() => renderAttachments(request.attachments)}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <RequestsStatusFooter 
        total={totalCount}
        status={status}
      />
      
      {detailRequest && (
        <HomeownerRequestDetailDialog
          isOpen={!!detailRequestId}
          onClose={handleCloseDetail}
          request={detailRequest}
          onStatusChange={onStatusChange}
        />
      )}
      
      {historyRequest && (
        <HomeownerRequestHistoryDialog
          isOpen={!!historyRequestId}
          onClose={handleCloseHistory}
          requestId={historyRequest.id}
        />
      )}
    </Card>
  );
};

export default RequestsTabContent;
