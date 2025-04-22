
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { EmptyRequestsRow } from '@/components/homeowners/table/EmptyRequestsRow';
import RequestTableRow from '@/components/homeowners/table/RequestTableRow';
import { RequestsCardHeader } from '@/components/homeowners/queue/RequestsCardHeader';
import { RequestsStatusFooter } from '@/components/homeowners/queue/RequestsStatusFooter';
import HomeownerRequestBulkActions from '@/components/homeowners/HomeownerRequestBulkActions';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestHistoryDialog from '@/components/homeowners/history/HomeownerRequestHistoryDialog';

interface RequestsTabContentProps {
  status: string;
  title: string;
  requests: HomeownerRequest[];
  totalCount: number;
  isLoading: boolean;
  onStatusChange: (id: string, status: string) => void;
  columns: HomeownerRequestColumn[];
  selectedRequestIds: string[];
  setSelectedRequestIds: React.Dispatch<React.SetStateAction<string[]>>;
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);

  const handleViewDetails = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  const handleViewHistory = (request: HomeownerRequest) => {
    setSelectedRequest(request);
    setHistoryOpen(true);
  };

  const handleBulkSelectAll = () => {
    if (selectedRequestIds.length === requests.length) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(requests.map(req => req.id));
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b">
        <RequestsCardHeader 
          title={title}
          count={totalCount}
          isLoading={isLoading}
        />
      </CardHeader>
      
      {selectedRequestIds.length > 0 && (
        <div className="p-2 bg-muted/50 border-b flex justify-between items-center">
          <span className="text-sm font-medium ml-2">
            {selectedRequestIds.length} {selectedRequestIds.length === 1 ? 'request' : 'requests'} selected
          </span>
          <HomeownerRequestBulkActions 
            selectedRequestIds={selectedRequestIds}
            onClearSelection={() => setSelectedRequestIds([])}
          />
        </div>
      )}

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyRequestsRow 
            message={`No ${status} requests found.`}
          />
        ) : (
          <div className="divide-y">
            {requests.map(request => (
              <RequestTableRow
                key={request.id}
                request={request}
                columns={columns}
                isSelected={selectedRequestIds.includes(request.id)}
                onToggleSelect={() => toggleSelectRequest(request.id)}
                onViewDetails={() => handleViewDetails(request)}
                onViewHistory={() => handleViewHistory(request)}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </CardContent>

      {!isLoading && requests.length > 0 && (
        <RequestsStatusFooter 
          status={status}
          count={totalCount}
        />
      )}

      {selectedRequest && (
        <>
          <HomeownerRequestDetailDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            request={selectedRequest}
            onStatusChange={onStatusChange}
          />
          
          <HomeownerRequestHistoryDialog
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            requestId={selectedRequest.id}
          />
        </>
      )}
    </Card>
  );
};

export default RequestsTabContent;
