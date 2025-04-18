
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { TableCell, TableRow, TableBody, Table, TableHead, TableHeader } from '@/components/ui/table';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import RequestStatusBadge from '@/components/homeowners/table/RequestStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyRequestsRow from '@/components/homeowners/table/EmptyRequestsRow';

interface RequestsTabContentProps {
  value: string;
  isLoading: boolean;
  requests: HomeownerRequest[];
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
  onRowClick?: (request: HomeownerRequest) => void;
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({ 
  value, 
  isLoading, 
  requests, 
  columns, 
  visibleColumnIds,
  onRowClick
}) => {
  const visibleColumns = columns.filter(col => visibleColumnIds.includes(col.id));

  const renderCellContent = (request: HomeownerRequest, columnId: string) => {
    switch(columnId) {
      case 'status':
        return <RequestStatusBadge status={request.status} />;
      case 'created_at':
      case 'updated_at':
      case 'resolved_at':
        return request[columnId] ? formatDate(request[columnId] as string) : '-';
      case 'priority':
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {request.priority}
        </span>;
      case 'type':
        return <span className="capitalize">{request.type}</span>;
      default:
        return request[columnId] || '-';
    }
  };

  const filteredRequests = value === 'all' 
    ? requests 
    : value === 'active'
      ? requests.filter(r => ['open', 'in-progress'].includes(r.status))
      : requests.filter(r => r.status === value);

  return (
    <TabsContent value={value} className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map(column => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {visibleColumns.map(column => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <EmptyRequestsRow colSpan={visibleColumns.length} />
            ) : (
              filteredRequests.map(request => (
                <TableRow 
                  key={request.id} 
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={onRowClick ? () => onRowClick(request) : undefined}
                >
                  {visibleColumns.map(column => (
                    <TableCell key={column.id}>
                      {renderCellContent(request, column.accessorKey)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
};

export default RequestsTabContent;
