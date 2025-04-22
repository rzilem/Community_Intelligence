
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { HomeownerRequest, HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface RequestsTabContentProps {
  value: string;
  isLoading: boolean;
  requests: HomeownerRequest[];
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
  selectedRequests?: HomeownerRequest[];
  onToggleSelection?: (request: HomeownerRequest) => void;
}

const RequestsTabContent: React.FC<RequestsTabContentProps> = ({
  value,
  isLoading,
  requests,
  columns,
  visibleColumnIds,
  selectedRequests = [],
  onToggleSelection
}) => {
  // Get visible columns based on IDs
  const visibleColumns = columns.filter(col => visibleColumnIds.includes(col.id));
  
  // Check if a request is selected
  const isSelected = (request: HomeownerRequest) => {
    return selectedRequests.some(r => r.id === request.id);
  };

  // Format date fields
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get badge color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get cell content based on column type
  const getCellContent = (request: HomeownerRequest, columnId: string) => {
    switch (columnId) {
      case 'status':
        return (
          <Badge className={getStatusColor(request.status)}>
            {request.status.replace('-', ' ')}
          </Badge>
        );
      case 'priority':
        return (
          <Badge className={getPriorityColor(request.priority)}>
            {request.priority}
          </Badge>
        );
      case 'created_at':
      case 'updated_at':
      case 'resolved_at':
        return request[columnId] ? formatDate(request[columnId]) : '-';
      default:
        return request[columnId as keyof HomeownerRequest] || '-';
    }
  };

  return (
    <TabsContent value={value} className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {onToggleSelection && (
                    <TableHead className="w-[40px]">
                      <span className="sr-only">Select</span>
                    </TableHead>
                  )}
                  {visibleColumns.map((column) => (
                    <TableHead key={column.id}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50 cursor-pointer">
                    {onToggleSelection && (
                      <TableCell className="w-[40px]">
                        <Checkbox 
                          checked={isSelected(request)}
                          onCheckedChange={() => onToggleSelection(request)}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell key={`${request.id}-${column.id}`}>
                        {getCellContent(request, column.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No requests found matching your criteria.
        </div>
      )}
    </TabsContent>
  );
};

export default RequestsTabContent;
