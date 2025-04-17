
import React from 'react';
import { 
  Table, 
  TableBody
} from '@/components/ui/table';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import RequestTableHeader from './table/RequestTableHeader';
import RequestTableRow from './table/RequestTableRow';
import EmptyRequestsRow from './table/EmptyRequestsRow';

interface HomeownerRequestsTableProps {
  requests: HomeownerRequest[];
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
  isLoading?: boolean;
  error?: Error | null;
  onViewRequest?: (request: HomeownerRequest) => void;
  onEditRequest?: (request: HomeownerRequest) => void;
  onAddComment?: (request: HomeownerRequest) => void;
  onViewHistory?: (request: HomeownerRequest) => void;
}

const HomeownerRequestsTable: React.FC<HomeownerRequestsTableProps> = ({ 
  requests, 
  columns,
  visibleColumnIds,
  isLoading,
  error,
  onViewRequest = () => {},
  onEditRequest = () => {},
  onAddComment = () => {},
  onViewHistory = () => {}
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-red-500">Error loading requests: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <RequestTableHeader 
          columns={columns} 
          visibleColumnIds={visibleColumnIds} 
        />
        <TableBody>
          {requests.length === 0 ? (
            <EmptyRequestsRow columnsCount={visibleColumnIds.length + 1} />
          ) : (
            requests.map((request) => (
              <RequestTableRow
                key={request.id}
                request={request}
                columns={columns}
                visibleColumnIds={visibleColumnIds}
                onViewRequest={onViewRequest}
                onEditRequest={onEditRequest}
                onAddComment={onAddComment}
                onViewHistory={onViewHistory}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HomeownerRequestsTable;
