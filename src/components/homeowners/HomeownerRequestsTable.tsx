
import React from 'react';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import RequestTableHeader from './table/RequestTableHeader';
import RequestTableRow from './table/RequestTableRow';
import EmptyRequestsRow from './table/EmptyRequestsRow';
import HomeownerRequestPagination from './HomeownerRequestPagination';
import TableContainer from '@/components/common/TableContainer';
import { Table, TableBody } from '@/components/ui/table';
import { useTablePagination } from '@/hooks/useTablePagination';

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
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange
  } = useTablePagination(requests.length);

  const paginatedRequests = requests.slice(startIndex, endIndex);

  return (
    <TableContainer isLoading={isLoading} error={error} loadingMessage="Loading requests...">
      <div className="space-y-4">
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <RequestTableHeader columns={columns} visibleColumnIds={visibleColumnIds} />
            <TableBody>
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
    </TableContainer>
  );
};

export default HomeownerRequestsTable;
