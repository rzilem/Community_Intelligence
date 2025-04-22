
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { MaintenanceRequest } from '@/types/maintenance-types';
import { formatDistanceToNow } from 'date-fns';

interface MaintenanceRequestListProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  onEdit: (request: MaintenanceRequest) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const MaintenanceRequestList: React.FC<MaintenanceRequestListProps> = ({
  requests,
  isLoading,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  if (!requests.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No maintenance requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.property_id}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(request.priority)}>
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {request.created_at
                  ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(request)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(request.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaintenanceRequestList;
