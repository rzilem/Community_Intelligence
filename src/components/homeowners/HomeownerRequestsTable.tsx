
import React, { useState } from 'react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import RequestTableHeader from './table/RequestTableHeader';
import RequestTableRow from './table/RequestTableRow';
import EmptyRequestsRow from './table/EmptyRequestsRow';
import HomeownerRequestPagination from './HomeownerRequestPagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(requests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = requests.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <RequestTableHeader columns={columns} visibleColumnIds={visibleColumnIds} />
          <tbody>
            {paginatedRequests.length === 0 ? (
              <EmptyRequestsRow colSpan={visibleColumnIds.length + 1} />
            ) : (
              paginatedRequests.map((request) => (
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
      
      {requests.length > 0 && (
        <HomeownerRequestPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRequests={requests.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default HomeownerRequestsTable;
