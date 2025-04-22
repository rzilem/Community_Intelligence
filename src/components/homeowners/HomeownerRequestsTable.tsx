
import React, { useState } from 'react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RequestTableHeader from './table/RequestTableHeader';
import { RequestTableRow } from './table/RequestTableRow';
import EmptyRequestsRow from './table/EmptyRequestsRow';
import HomeownerRequestPagination from './HomeownerRequestPagination';

interface HomeownerRequestsTableProps {
  requests: HomeownerRequest[];
  columns: HomeownerRequestColumn[];
  visibleColumnIds?: string[];
  isLoading?: boolean;
  error?: Error | null;
  onViewRequest?: (request: HomeownerRequest) => void;
  onEditRequest?: (request: HomeownerRequest) => void;
  onStatusChange?: (id: string, status: string) => void;
  onRefresh?: () => void;
  selectedRequestIds?: string[];
  setSelectedRequestIds?: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectRequest?: (id: string) => void;
  onToggleColumn?: (columnId: string) => void;
}

const HomeownerRequestsTable: React.FC<HomeownerRequestsTableProps> = ({
  requests,
  columns,
  visibleColumnIds = columns.map(col => col.id),
  isLoading,
  error,
  onViewRequest,
  onEditRequest,
  onStatusChange,
  onRefresh,
  selectedRequestIds,
  setSelectedRequestIds,
  toggleSelectRequest,
  onToggleColumn,
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
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnIds.map(id => {
                const column = columns.find(col => col.id === id);
                return column ? (
                  <TableHead key={id}>{column.label}</TableHead>
                ) : null;
              })}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <td colSpan={visibleColumnIds.length + 1} className="text-center p-4">
                  <EmptyRequestsRow message="No requests found" />
                </td>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => (
                <RequestTableRow
                  key={request.id}
                  request={request}
                  columns={columns}
                  visibleColumnIds={visibleColumnIds}
                  onViewRequest={onViewRequest}
                  onEditRequest={onEditRequest}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </TableBody>
        </Table>
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
