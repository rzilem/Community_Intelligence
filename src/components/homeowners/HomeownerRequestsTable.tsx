
import React from 'react';
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
  onViewRequest: (request: HomeownerRequest) => void;
  onEditRequest: (request: HomeownerRequest) => void;
}

const HomeownerRequestsTable: React.FC<HomeownerRequestsTableProps> = ({
  requests,
  columns,
  visibleColumnIds,
  isLoading,
  error,
  onViewRequest,
  onEditRequest,
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error.message}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <RequestTableHeader columns={columns} visibleColumnIds={visibleColumnIds} />
        <tbody>
          {requests.length === 0 ? (
            <EmptyRequestsRow colSpan={visibleColumnIds.length + 1} />
          ) : (
            requests.map((request) => (
              <RequestTableRow
                key={request.id}
                request={request}
                columns={columns}
                visibleColumnIds={visibleColumnIds}
                onViewRequest={onViewRequest}
                onEditRequest={onEditRequest}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HomeownerRequestsTable;
